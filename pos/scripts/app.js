///<reference path='./defs/google.maps.d.ts' />
///<reference path='./defs/jquery.d.ts' />

var access_token = "";

$(function () {
    /* Authentication via access token  */
    var params = Knoema.Helpers.parseHashParams();
    if (params == null)
    	Knoema.Helpers.getAccessToken('Ysyd9Tw', window.location, false, 'read_resources');
    else {
        if (params["access_token"] != undefined)
            access_token = params["access_token"];
    }
});

var App = (function () {
    function App() {
    }
    App.percentToRGB = function (percent) {
        percent = 100 - percent;
        if (percent === 100) {
            percent = 99;
        }
        var r, g, b;
        if (percent < 50) {
            // green to yellow
            r = Math.floor(255 * (percent / 50));
            g = 255;
        }
        else {
            // yellow to red
            r = 255;
            g = Math.floor(255 * ((50 - percent % 50) / 50));
        }
        b = 0;
        return "rgb(" + r + "," + g + "," + b + ")";
    };
    App.init = function () {
        var _this = this;
        // read settings
        ['datasetId', 'host', 'dashSummary', 'dashDetails', 'dashRegionSummary', 'dashRegionDetails', 'dashCountrySummary', 'dashCountryDetails'].forEach(function (field) {
            _this[field] = $('#settings_' + field).val();
        });
        ['skipFirstColumns', 'departmentColumnIndex', 'provinceColumnIndex', 'dateColumnIndex'].forEach(function (field) {
            _this[field] = parseInt($('#settings_' + field).val());
        });
        {
            var $legend = $('#legend');
            for (var i = 0; i <= 10; i++) {
                var item = $('<div class="color-item" style="background-color: ' + this.percentToRGB(i * 10) + ';"></div>');
                $legend.append(item);
            }
        }
        var refreshVoteCount = function () {
        	$.getJSON('http://' + _this.host + '/api/forms/pos20160502/status').done(function (result) {
                var formatedVoteCount = window['numeral'](result.all).format('0,0');
                $('#voteCount').html(formatedVoteCount);
            });
        };
        refreshVoteCount();
        setInterval(refreshVoteCount, 5000);
        $('.passport-popup').on('click', '.passport__close', function (event) { return $(event.delegateTarget).hide(); });
        // init map
        var map = new google.maps.Map(document.getElementById('map'), {
            mapTypeControl: false,
            zoom: 4,
            center: { lat: 0, lng: 0 }
        });
        $('#showCountrySummary').on('click', function (event) {
            if ($('#tab-country-summary iframe').length <= 0) {
                var summaryUrl = 'http://knoema.com/resource/embed/' + _this.dashCountrySummary + '/?noHeader=1';
                var detailsUrl = 'http://knoema.com/resource/embed/' + _this.dashCountryDetails + '/?noHeader=1';
                $('#tab-country-summary').html('<iframe src="' + summaryUrl + '">');
                $('#tab-country-details').html('<iframe src="' + detailsUrl + '">');
            }
            $('#countrySummaryPopup').show();
        });
        var showDepartmentPassposrt = function (depName) {
            if (depName != null) {
                var summaryUrl = 'http://knoema.com/resource/embed/' + _this.dashSummary + '/?noHeader=1&department=' + encodeURI(depName);
                var detailsUrl = 'http://knoema.com/resource/embed/' + _this.dashDetails + '/?noHeader=1&department=' + encodeURI(depName);
                $('#passportPopup .title').html(depName);
                $('#tab-summary').html('<iframe src="' + summaryUrl + '">');
                $('#tab-details').html('<iframe src="' + detailsUrl + '">');
                $('#passportPopup').show();
            }
        };
        var showProvincePassposrt = function (depName) {
            if (depName != null) {
                var summaryUrl = 'http://knoema.com/resource/embed/' + _this.dashRegionSummary + '/?noHeader=1&region=' + encodeURI(depName);
                var detailsUrl = 'http://knoema.com/resource/embed/' + _this.dashRegionDetails + '/?noHeader=1&region=' + encodeURI(depName);
                $('#passportPopup .title').html(depName);
                $('#tab-summary').html('<iframe src="' + summaryUrl + '">');
                $('#tab-details').html('<iframe src="' + detailsUrl + '">');
                $('#passportPopup').show();
            }
        };
        map['data'].loadGeoJson('./scripts/senegal-provinces.json');
        map['data'].loadGeoJson('./scripts/senegal-departments.json');
        map['data'].setStyle({
            strokeWeight: 1,
            visible: false
        });
        map['data'].addListener('click', function (event) {
            if ($('#optionDepartments').is(':checked')) {
                showDepartmentPassposrt(event.feature.getProperty('regionName'));
            }
            else {
                showProvincePassposrt(event.feature.getProperty('regionName'));
            }
        });
        // fit map to senegal
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'address': 'Senegal' }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.fitBounds(results[0].geometry.bounds);
            }
            else {
                // Senegal
                map.fitBounds(new google.maps.LatLngBounds(new google.maps.LatLng(12.307289, -17.529848), new google.maps.LatLng(16.693054, -11.348607)));
            }
        });
        var markers;
        var popMarkers = [];

        this.getDepartments().done(function (provinces, departments) {
        	_this.getPopulationData().done(function (populationData) {
        		var addPopMarkers = function () {
        			if (popMarkers.length > 0) {
        				popMarkers.forEach(function (marker) { return marker.setMap(null); });
        				popMarkers = [];
        			}

        			var valIndex = 8;
        			var latIndex = 9;
        			var lngIndex = 10;

        			var regions;
        			var regionColumnIndex;

        			if ($('#optionDepartments').is(':checked')) {
        				regionColumnIndex = 3;
        				regions = departments;
        			}
        			else {
        				regionColumnIndex = 1;
        				regions = provinces;
        			}

        			var count = populationData.columns.length;
        			var data = populationData.data;

        			var popMarkerInfo = {};
        			var max = -1;
        			for (var i = count; i < data.length; i += count) {
        				var value = data[i + valIndex];
        				var regionName = data[i + regionColumnIndex];
        				if (!popMarkerInfo[regionName])
        					popMarkerInfo[regionName] = value;
        				else
        					popMarkerInfo[regionName] += value;

        				if (value > max)
        					max = value;
        			}

        			for (var r in regions) {
        				var regionName = regions[r].Name;

        				if (popMarkerInfo[regionName]) {
        					popMarkers.push(new google.maps.Marker({
        						map: map,
        						position: new google.maps.LatLng(regions[r].Latitude, regions[r].Longitude),
        						icon: {
        							path: google.maps.SymbolPath.CIRCLE,
        							fillColor: '#3A45C7',
        							fillOpacity: 0.8,
        							strokeColor: 'black',
        							strokeWeight: 1,
        							scale: 20 * Math.log(popMarkerInfo[regionName] / max + 1) + 10
        						},
        					}));
        				}
        			}
        		};
        		addPopMarkers();

        		$('#optionDepartments, #optionProvinces').on('change', function (event) { return addPopMarkers(); });
        	});

            _this.getData().done(function (data) {
                var currentAnswers;
                var currentColumnIndex;
                var currentDate;
                var $timeline = $('#timeline');
                {
                    var dates = [];
                    for (var rowOffset = 0; rowOffset < data.data.length; rowOffset += data.columns.length) {
                        var date = data.data[rowOffset + 1];
                        if (date != null && dates.indexOf(date.value) < 0) {
                            dates.push(date.value);
                        }
                    }
                    dates = dates.sort();
                    var width = 100 / dates.length;
                    dates.forEach(function (date, index) {
                        var dateParts = date.split('/');
                        $timeline.append('<div style="width:' + width + '%;" class="item ' + (index == (dates.length - 1) ? 'active' : '') + '" data-date="' + date + '"><span class="day">' + parseInt(dateParts[1]) + '</span>&nbsp;<span class="month">mai</span></div>');
                    });
                    currentDate = dates[dates.length - 1];
                }
                _this.refreshSidebar(data, currentDate);
                var addMarkers = function () {
                    if (markers != null) {
                        markers.forEach(function (marker) { return marker.setMap(null); });
                        markers = null;
                    }
                    //if (currentColumnIndex != null) {
                    var regions;
                    var regionColumnIndex;
                    if ($('#optionDepartments').is(':checked')) {
                        regionColumnIndex = _this.departmentColumnIndex;
                        regions = departments;
                    }
                    else {
                        regionColumnIndex = _this.provinceColumnIndex;
                        regions = provinces;
                    }
                    if (currentAnswers == null) {
                        markers = _this.showQuestionStat(map, currentColumnIndex, data, currentDate, regions, regionColumnIndex);
                    }
                    else {
                        markers = _this.showAnswerStat(map, currentColumnIndex, currentAnswers, data, currentDate, regions, regionColumnIndex);
                    }
                    if ($('#optionBubbles').is(':checked')) {
                        map['data'].forEach(function (feature) { return map['data'].revertStyle(feature); });
                        markers.forEach(function (m) { return m.setMap(map); });
                    }
                    else {
                        var markersByRegionId = {};
                        markers.forEach(function (m) { return markersByRegionId[m['_regionId']] = m; });
                        map['data'].forEach(function (feature) {
                            map['data'].revertStyle(feature);
                            var regionMarker = markersByRegionId[feature.getId()];
                            if (regionMarker != null) {
                                console.log(feature.getId(), regionMarker);
                                var percent = regionMarker._percent;
                                var regionName = regionMarker._departmentName;
                                feature.setProperty('regionName', regionName);
                                if (percent != null) {
                                    map['data'].overrideStyle(feature, {
                                        fillColor: _this.percentToRGB(percent * 100),
                                        visible: true,
                                    });
                                }
                            }
                        });
                    }
                    markers.forEach(function (m) { return google.maps.event.addListener(m, 'click', function (event) {
                        if ($('#optionDepartments').is(':checked')) {
                            showDepartmentPassposrt(this._departmentName);
                        }
                        else {
                            showProvincePassposrt(this._departmentName);
                        }
                    }); });
                    //}
                };
                addMarkers();
                $('#statistics').on('click', '.results', function (event) {
                    $(event.delegateTarget).find('.results.white').removeClass('white');
                    $(event.delegateTarget).find('.bar.active').removeClass('active');
                    currentColumnIndex = $(event.currentTarget).toggleClass('white', true).data('column-index');
                    currentAnswers = null;
                    addMarkers();
                });
                $('#statistics').on('click', '.sr-progress > .bar', function (event) {
                    event.stopPropagation();
                    $(event.delegateTarget).find('.results.white').removeClass('white');
                    $(event.delegateTarget).find('.bar.active').removeClass('active');
                    var $bar = $(event.currentTarget).toggleClass('active', true);
                    currentAnswers = $bar.data('answers').split('|');
                    currentColumnIndex = $bar.closest('.results').toggleClass('white', true).data('column-index');
                    addMarkers();
                });
                $('#optionDepartments, #optionProvinces').on('change', function (event) { return addMarkers(); });
                $('#optionBubbles, #optionHeatmap').on('change', function (event) { return addMarkers(); });
                $timeline.on('click', '.item:not(.disabled)', function (event) {
                    $(event.delegateTarget).find('.item.active').removeClass('active');
                    currentDate = $(event.currentTarget).toggleClass('active', true).data('date');
                    _this.refreshSidebar(data, currentDate);
                    if (currentColumnIndex != null) {
                        if (currentAnswers != null) {
                            var strAnswers = currentAnswers.join('|');
                            var $bar;
                            if (strAnswers.indexOf('|') >= 0) {
                                $bar = $('#statistics .results[data-column-index="' + currentColumnIndex + '"] .bar[data-answers*="|"]');
                            }
                            else {
                                $bar = $('#statistics .results[data-column-index="' + currentColumnIndex + '"] .bar[data-answers="' + strAnswers + '"]');
                            }
                            if ($bar.length > 0) {
                                $bar.toggleClass('active', true).closest('.results').toggleClass('white', true);
                            }
                            else {
                                currentColumnIndex = null;
                                currentAnswers = null;
                            }
                        }
                        else {
                            var $results = $('#statistics .results[data-column-index="' + currentColumnIndex + '"]');
                            $results.toggleClass('white', true);
                        }
                    }
                    addMarkers();
                });
            });
        });
    };
    App.refreshSidebar = function (data, currentDate) {
        var _this = this;
        // prepare stat structure (skip 3 first columns)
        var stat = data.columns.slice(this.skipFirstColumns).map(function (column) {
            return {
                question: column.name,
                answers: {}
            };
        });
        // calc counts (skip 3 first columns)
        var voteCount = 0;
        for (var rowOffset = 0; rowOffset < data.data.length; rowOffset += data.columns.length) {
            if (data.data[rowOffset + this.dateColumnIndex] != null && data.data[rowOffset + this.dateColumnIndex].value == currentDate) {
                voteCount++;
                for (var colIndex = this.skipFirstColumns; colIndex < data.columns.length; colIndex++) {
                    var answers = stat[colIndex - this.skipFirstColumns].answers;
                    var value = data.data[rowOffset + colIndex];
                    if (value != null) {
                        if (value in answers) {
                            answers[value] += 1;
                        }
                        else {
                            answers[value] = 1;
                        }
                    }
                }
            }
        }
        var formatedVoteCount = window['numeral'](voteCount).format('0,0');
        $('#voteCountByDate').html(formatedVoteCount);
        var questionAnswers = {
            'HowYouVote': ['OUI', 'NON', 'ABSTENTION'],
            'ChangedYourMind': ['OUI', 'NON'],
            'Sex': ['Homme', 'Femme']
        };
        // calc percentages
        stat.forEach(function (item) {
            var total = 0;
            var answers = [];
            if (item.question in questionAnswers) {
                answers = questionAnswers[item.question];
            }
            else {
                for (var answer in item.answers) {
                    answers.push(answer);
                }
            }
            answers.forEach(function (answer) { return total += item.answers[answer]; });
            var percentages = answers.map(function (answer) {
                var percent = Math.round(item.answers[answer] / total * 100);
                return {
                    label: answer,
                    value: percent,
                    answers: [answer]
                };
            });
            if (!(item.question in questionAnswers)) {
                percentages = percentages.sort(function (a, b) { return b.value - a.value; });
            }
            item.percentages = percentages.slice(0, 4);
            var percentSum = 0;
            item.percentages.slice(0, item.percentages.length - 1).forEach(function (answer) { return percentSum += answer.value; });
            var lastPercentage = item.percentages[item.percentages.length - 1];
            if (lastPercentage != null) {
                lastPercentage.value = 100 - percentSum;
                if (answers.length > 4) {
                    lastPercentage.label = 'AUTRE';
                    lastPercentage.answers = percentages.slice(3).map(function (p) { return p.label; });
                }
            }
        });
        var $stat = $('#statistics').html('');
        var colors = {
            1: 'green',
            2: 'pink',
            3: 'lightgreen'
        };
        stat.forEach(function (item, itemIndex) {
            if (item.question == 'YourReason')
                return;
            var values = item.percentages.map(function (p) { return p.label + ': ' + p.value + '%'; });
            var progress = item.percentages.map(function (p, i) { return '<div class="bar ' + ((i + 1) in colors ? colors[i + 1] : '') + '" style="width: ' + p.value + '%" data-answers="' + p.answers.join('|') + '"></div>'; });

            if (_this.datasetColumnNames[item.question])
            	$stat.append('<div class="results" data-column-index="' + (itemIndex + _this.skipFirstColumns) + '">' + '<div class="sr-label">' + _this.datasetColumnNames[item.question] + '</div>' + '<div class="sr-progress">' + progress.join('') + '</div>' + '<span class="values">' + values.join(', ') + '</span>' + '</div>');
        });

        $stat.height($('#left-sidebar').outerHeight() - 141);
    };
    App.getData = function () {
        var _this = this;
        var def = $.Deferred();
        $.getJSON('http://knoema.com/api/1.0/meta/dataset/' + this.datasetId + '/dimension/region?access_token=' + access_token).done(function (dimension) {
        	if (typeof dimension == "string") {
        		$("#statistics").addClass("error").html(dimension).append("<p><a href='https://knoema.com/sys/login?returnUrl=" + location.protocol + '//' + location.host + location.pathname + "'>Try to use</a> different account</p>");
        	}
			else
        		$.post('http://knoema.com/api/1.0/data/details?page_id=' + _this.datasetId + '&access_token=' + access_token, {
					"Header": [],
					"Stub": [],
					"Filter": [{
						"DimensionId": "region",
						"Members": dimension.items.map(function (i) { return i.key; }),
						"DimensionName": "region",
						"DatasetId": _this.datasetId,
						"Order": "0",
						"isGeo": true
					}],
					"Frequencies": [],
					"Dataset": _this.datasetId,
					"Segments": null,
					"MeasureAggregations": null
        		}).done(function (data) {
        			return def.resolve(data);
        		});
        });
        return def;
    };
    App.getPopulationData = function () {
    	var self = this;
    	var def = $.Deferred();
    	var datasetId = 'uyppukg';
    	$.post('http://knoema.com/api/1.0/data/details?page_id=' + datasetId + '&access_token=' + access_token, {
    		"Header": [],
    		"Stub": [],
    		"Filter": [{
    			"DimensionId": "measure",
    			"Members": ['4996610'],
    			"DimensionName": "measure",
    			"DatasetId": datasetId,
    			"Order": "0",
    			"isGeo": true
    		}],
    		"Frequencies": [],
    		"Dataset": datasetId,
    		"Segments": null,
    		"MeasureAggregations": null
    	}).done(function (data) {
    		return def.resolve(data);
    	});

    	return def;
    };
    App.getDepartments = function () {
        var _this = this;
        var def = $.Deferred();
        $.getJSON('./scripts/regions.json').done(function (senegal) {
            var departments = {};
            var regions = {};
            senegal.Regions.forEach(function (region) {

            	var regionName = _this.datasetProvinceNames[region.Id];
            	if (regionName != null) {
            		regions[regionName] = region;
            	}
            	else {
            		console.log(department.Id, 'is not found in datasetProvinceNames');
            	}

                region.Regions.forEach(function (department) {
                    var depName = _this.datasetDepartmentNames[department.Id];
                    if (depName != null) {
                        departments[depName] = department;
                    }
                    else {
                        console.log(department.Id, 'is not found in databaseDepartmentNames');
                    }
                });
            });
            def.resolve(regions, departments);
        });
        return def;
    };
    App.showQuestionStat = function (map, columnIndex, data, currentDate, departments, regionColumnIndex) {
        var depStat = {};
        for (var rowOffset = 0; rowOffset < data.data.length; rowOffset += data.columns.length) {
            if (data.data[rowOffset + this.dateColumnIndex] != null && data.data[rowOffset + this.dateColumnIndex].value == currentDate) {
                if (columnIndex == null || data.data[rowOffset + columnIndex] != null) {
                    var depName = data.data[rowOffset + regionColumnIndex];
                    if (depName in depStat) {
                        depStat[depName] += 1;
                    }
                    else {
                        depStat[depName] = 1;
                    }
                }
            }
        }
        var markers = [];
        var max = 0;
        for (var depName in depStat) {
            if (depStat[depName] > max) {
                max = depStat[depName];
            }
        }
        for (var depName in depStat) {
            if (depName in departments) {
                var department = departments[depName];
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(department.Latitude, department.Longitude),
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: 'orange',
                        fillOpacity: 0.8,
                        strokeColor: 'black',
                        strokeWeight: 1,
                        scale: 5 + depStat[depName] / max * 30,
                    },
                    _departmentName: depName //$('#optionDepartments').is(':checked') ? depName : null
                });
                markers.push(marker);
            }
            else {
                console.log(depName);
            }
        }
        return markers;
    };
    App.showAnswerStat = function (map, columnIndex, targetAnswers, data, currentDate, departments, regionColumnIndex) {
        // vote count by question for each department
        var depStat = {};
        // vote count by answer for each departmnet
        var depAnswerStat = {};
        for (var rowOffset = 0; rowOffset < data.data.length; rowOffset += data.columns.length) {
            if (data.data[rowOffset + this.dateColumnIndex] != null && data.data[rowOffset + this.dateColumnIndex].value == currentDate) {
                var depName = data.data[rowOffset + regionColumnIndex];
                if (depName in depStat) {
                    depStat[depName] += 1;
                }
                else {
                    depStat[depName] = 1;
                }
                if (!(depName in depAnswerStat)) {
                    depAnswerStat[depName] = 0;
                }
                var answer = data.data[rowOffset + columnIndex];
                if (answer != null && targetAnswers.indexOf(answer) >= 0) {
                    depAnswerStat[depName] += 1;
                }
            }
        }
        var max = 0;
        for (var depName in depStat) {
            if (depStat[depName] > max) {
                max = depStat[depName];
            }
        }
        var markers = [];
        for (var depName in depStat) {
        	var lowerDepName = depName.toLowerCase();
        	if (lowerDepName in departments) {
        		var department = departments[lowerDepName];
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(department.Latitude, department.Longitude),
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: this.percentToRGB(depAnswerStat[depName] / depStat[depName] * 100),
                        fillOpacity: 0.5,
                        strokeColor: 'black',
                        strokeWeight: 1,
                        scale: 5 + depStat[depName] / max * 30
                    },
                    _percent: depAnswerStat[depName] / depStat[depName],
                    _regionId: department.Id,
                    _departmentName: depName // $('#optionDepartments').is(':checked') ? depName : null
                });
                console.log(marker['marker'], marker['_percent']);
                markers.push(marker);
            }
            else {
                console.log(depName);
            }
        }
        return markers;
    };
    App.datasetColumnNames = {
    	//'HowYouVote': 'Comment avez-vous vote pour ce referendum ?',
    	//'ChangedYourMind': 'Avez-vous considere vote autrement dans un premier temps ?',
    	//'YourReason': 'Quelle raison principale a motive votre choix ?',
    	//'Sex': 'Etes-vous',
    	//'Education': 'Quel est votre niveau d’education ?',
    	//'Occupation': 'Quelle est votre situation professionnelle ?',
    	//'YouLikePresident': 'Comment evaluez-vous le travail du president macky sall depuis 2012 ?',
    	//'Age': 'Quel est votre groupe d’age ?',
    	//'CountryDirection': 'Pensez-vous que le pays va vers la bonne direction ?',
    	//'Religion': 'Quelle est votre affiliation religieuse ?',
    	//'Ethnos': 'Quel est votre groupe ethnique ?',
    	//'Politics': 'Pour qui avez-vous vote en 2012 ?',

    	'PastElections': 'QUELLE EST LA DERNIERE ELECTION A LAQUELLE VOUS AVEZ PARTICIPE ?',
    	'CommuneVotedOrNot': 'SUR VOTRE CARTE D’ELECTEUR QUELLE EST VOTRE COMMUNE DE VOTE?',
    	'Sex': 'GENRE ?',
    	'Education': 'QUEL EST VOTRE NIVEAU D’EDUCATION ?',
    	'Profession': 'QUELLE EST VOTRE SITUATION PROFESSIONNELLE ?',
    	'Age': 'QUEL EST VOTRE GROUPE D’AGE',
    	'Religion': 'QUELLE EST VOTRE AFFILIATION RELIGIEUSE ?',
    	'Nationality': 'QUEL EST VOTRE GROUPE ETHNIQUE ?',
    	'EvaluatePresident': 'COMMENT EVALUEZ-VOUS LE TRAVAIL DU PRESIDENT MACKY SALL DEPUIS 2012 ?',
    	'RightDirection': 'PENSEZ-VOUS QUE LE PAYS VA DANS LA BONNE DIRECTION ?',
    	'Satisfied': 'CITEZ VOS PLUS GRANDS MOTIFS DE SATISFACTION DU PRESIDENT DEPUIS 2012 ?',
    	'Dissatisfied': 'CITEZ VOS PLUS GRANDS MOTIF DE D’INSATISFACTION DU PRESIDENT DEPUIS 2012 ?',
    	'Priority1': 'QUELLES SONT LES TROIS PRIORITES OÙ VOUS ATTENDEZ LE PRESIDENT ? #1:',
    	'Priority2': 'QUELLES SONT LES TROIS PRIORITES OÙ VOUS ATTENDEZ LE PRESIDENT ? #2:',
    	'Priority3': 'QUELLES SONT LES TROIS PRIORITES OÙ VOUS ATTENDEZ LE PRESIDENT ? #3:',
    	'Program': 'QUEL EST LE PROGRAMME DU PRESIDENT QUE VOUS APPRECIEZ LE PLUS ?',
    	'Participate': 'SERIEZ-VOUS INTERESSÉ A REPONDRE A DES QUESTIONS SUR LES AFFAIRES DU PAYS UNE FOIS PAR MOIS PAR TELEPHONE OU CONTACT DIRECT ?',
    };
    App.datasetDepartmentNames = {
        'SN-DK-DD': 'dakar',
        'SN-DK-GU': 'guediawaye',
        'SN-DK-PI': 'pikine',
        'SN-DK-RU': 'rufisque',
        'SN-DB-BA': 'bambey',
        'SN-DB-MB': 'mbacke',
        'SN-DB-DD': 'diourbel',
        'SN-FK-FD': 'fatick',
        'SN-FK-FO': 'foundiougne',
        'SN-FK-GO': 'gossas',
        'SN-KA-BI': 'birkelane',
        'SN-KA-KA': 'kaffrine',
        'SN-KA-KO': 'koungheul',
        'SN-KA-MH': 'malem hoddar',
        'SN-KL-GU': 'guinguineo',
        'SN-KL-KA': 'kaolack',
        'SN-KL-ND': 'nioro',
        'SN-KD-KD': 'kolda',
        'SN-KD-MY': 'medina yoro foulah',
        'SN-KD-VE': 'velingara',
        'SN-KE-KE': 'kedougou',
        'SN-KE-SL': 'salemata',
        'SN-KE-SA': 'saraya',
        'SN-LG-KE': 'kebemer',
        'SN-LG-LI': 'linguere',
        'SN-LG-LD': 'louga',
        'SN-MT-KA': 'kanel',
        'SN-MT-MA': 'matam',
        'SN-MT-RF': 'ranerou ferlo',
        'SN-SE-BO': 'bounkiling',
        'SN-SE-GO': 'goudomp',
        'SN-SE-SD': 'sedhiou',
        'SN-SL-DA': 'dagana',
        'SN-SL-PO': 'podor',
        'SN-SL-SD': 'saint louis',
        'SN-TC-BA': 'bakel',
        'SN-TC-GO': 'goudiry',
        'SN-TC-KO': 'koumpentoum',
        'SN-TC-TD': 'tambacounda',
        'SN-TH-MB': 'mbour',
        'SN-TH-TD': 'thies',
        'SN-TH-TI': 'tivaouane',
        'SN-ZG-BI': 'bignona',
        'SN-ZG-OU': 'oussouye',
        'SN-ZG-ZD': 'ziguinchor',
    };

    App.datasetProvinceNames = {
    	'SN-DK': 'dakar',
    	'SN-DB': 'diourbel',
    	'SN-FK': 'fatick',
    	'SN-KA': 'kaffrine',
    	'SN-KL': 'kaolack',
    	'SN-KE': 'kedougou',
    	'SN-KD': 'kolda',
    	'SN-LG': 'louga',
    	'SN-MT': 'matam',
    	'SN-SL': 'saint-louis',
    	'SN-SE': 'sedhiou',
    	'SN-TC': 'tambacounda',
    	'SN-TH': 'thies',
    	'SN-ZG': 'ziguinchor',
    };

    return App;
})();
//# sourceMappingURL=app.js.map