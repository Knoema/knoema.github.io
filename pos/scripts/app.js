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

		$('#pools').selectpicker();

		// read settings
		['datasetId', 'host', 'dashCountrySummary', 'dashCountryDetails', 'dashRegionSummary', 'dashRegionDetails', 'dashDepSummary', 'dashDepDetails', 'dashCommuneSummary', 'dashCommuneSummary', 'dashTownshipSummary', 'dashTownshipDetails'].forEach(function (field) {
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
			zoom: 8,
			center: { lat: 14.56624, lng: -14.47348 }
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

		var showProvincePassposrt = function (regionName) {
			if (regionName == null)
				return;

			var summaryUrl = 'http://knoema.com/resource/embed/' + _this.dashRegionSummary + '/?noHeader=1&region=' + encodeURI(regionName);
			var detailsUrl = 'http://knoema.com/resource/embed/' + _this.dashRegionDetails + '/?noHeader=1&region=' + encodeURI(regionName);
			$('#passportPopup .title').html(regionName);
			$('#tab-summary').html('<iframe src="' + summaryUrl + '">');
			$('#tab-details').html('<iframe src="' + detailsUrl + '">');
			$('#passportPopup').show();
		};
		var showDepartmentPassposrt = function (regionName) {
			if (regionName == null)
				return;

			var summaryUrl = 'http://knoema.com/resource/embed/' + _this.dashDepSummary + '/?noHeader=1';
			var detailsUrl = 'http://knoema.com/resource/embed/' + _this.dashDepDetails + '/?noHeader=1&dvpgckc.dept=' + encodeURI(regionName) + '&nmlinf.dept=' + encodeURI(regionName) + '&eiaaxcf.dept=' + encodeURI(regionName);
			$('#passportPopup .title').html(regionName);
			$('#tab-summary').html('<iframe src="' + summaryUrl + '">');
			$('#tab-details').html('<iframe src="' + detailsUrl + '">');
			$('#passportPopup').show();
		};
		var showCommunePassposrt = function (regionName) {
			return null;

			if (regionName == null)
				return;

			var summaryUrl = 'http://knoema.com/resource/embed/' + _this.dashCommuneSummary + '/?noHeader=1&region=' + encodeURI(regionName);
			var detailsUrl = 'http://knoema.com/resource/embed/' + _this.dashCommuneDetails + '/?noHeader=1&region=' + encodeURI(regionName);
			$('#passportPopup .title').html(regionName);
			$('#tab-summary').html('<iframe src="' + summaryUrl + '">');
			$('#tab-details').html('<iframe src="' + detailsUrl + '">');
			$('#passportPopup').show();
		};
		var showTownshipPassposrt = function (regionName) {
			if (regionName == null)
				return;

			var summaryUrl = 'http://knoema.com/resource/embed/' + _this.dashTownshipSummary + '/?noHeader=1&dvpgckc.township=' + encodeURI(regionName) + '&nmlinf.township=' + encodeURI(regionName) + '&eiaaxcf.township=' + encodeURI(regionName);
			var detailsUrl = 'http://knoema.com/resource/embed/' + _this.dashTownshipDetails + '/?noHeader=1&dvpgckc.township=' + encodeURI(regionName) + '&nmlinf.township=' + encodeURI(regionName) + '&eiaaxcf.township=' + encodeURI(regionName);
			$('#passportPopup .title').html(regionName);
			$('#tab-summary').html('<iframe src="' + summaryUrl + '">');
			$('#tab-details').html('<iframe src="' + detailsUrl + '">');
			$('#passportPopup').show();
		};
		
		var loadMap = function (mapName) {

			map['data'].forEach(function (feature) {
				map['data'].remove(feature);
			});

			map['data'].loadGeoJson('./scripts/senegal-' + mapName + '.json');
		};
		loadMap('provinces');

		map['data'].addListener('click', function (event) {
			if ($('#optionProvinces').is(':checked'))
				showProvincePassposrt(event.feature.getProperty('regionName'));
			else if ($('#optionDepartments').is(':checked'))
				showDepartmentPassposrt(event.feature.getProperty('regionName'));
			else if ($('#optionCommunities').is(':checked'))
				showCommunePassposrt(event.feature.getProperty('regionName'));
			else if ($('#optionTownships').is(':checked'))
				showTownshipPassposrt(event.feature.getProperty('regionName'));
		});
		var markers;
		var popMarkers = [];

		this.getDepartments().done(function (provinces, departments, communes, townships, populationData) {

			var poolsStructure = _this.getPoolsStructure(populationData);

			{
				var addPopMarkers = function () {
					if ($('#optionQuestionnaire').is(':checked'))
						return;

					if (popMarkers.length > 0) {
						popMarkers.forEach(function (marker) { return marker.setMap(null); });
						popMarkers = [];
					}

					var valIndex = 12;
					var latIndex = 13;
					var lngIndex = 14;

					var regions;
					var regionColumnIndex;
					var selectedRegions;

					if ($('#optionProvinces').is(':checked')) {
						regionColumnIndex = 2;
						regions = provinces;
						selectedRegions = _this.getSelectedRegions(poolsStructure.region);
					}
					else if ($('#optionDepartments').is(':checked')) {
						regionColumnIndex = 5;
						regions = departments;
						selectedRegions = _this.getSelectedRegions(poolsStructure.dep);
					}
					else if ($('#optionCommunities').is(':checked')) {
						regionColumnIndex = 8;
						regions = communes;
						selectedRegions = _this.getSelectedRegions(poolsStructure.communes);
					}
					else if ($('#optionTownships').is(':checked')) {
						regionColumnIndex = 11;
						regions = townships;
						selectedRegions = _this.getSelectedRegions(poolsStructure.townships);
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

						if (popMarkerInfo[regionName] > max)
							max = popMarkerInfo[regionName];
					}

					map['data'].setStyle(function (feature) {
						var fId = feature.getId();

						if (popMarkerInfo[fId] && $.inArray(fId, selectedRegions) != -1) {
							feature.setProperty('regionName', feature.getProperty('name'));
							return {
								fillColor: _this.percentToRGB(100 * (1 - popMarkerInfo[fId] / max)),
								strokeWeight: 1
							};
						}
						else {
							return {
								visible: false,
								strokeWeight: 0
							}
						}
					});
				};
				addPopMarkers();

				$('#optionPopulation, #optionQuestionnaire').on('change', function () { return addPopMarkers(); });
			}

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
					if ($('#optionPopulation').is(':checked')) {

						$('#statistics .results').removeClass('white');
						$('#statistics .bar').removeClass('active');
						currentAnswers = null;

						return;
					}

					if (markers != null) {
						markers.forEach(function (marker) { return marker.setMap(null); });
						markers = null;
					}

					var regions;
					var regionColumnIndex;
					var selectedRegions;

					var isTwnshp = false;
					if ($('#optionProvinces').is(':checked')) {
						regionColumnIndex = 33;
						regions = provinces;
						selectedRegions = _this.getSelectedRegions(poolsStructure.region);
					}
					else if ($('#optionDepartments').is(':checked')) {
						regionColumnIndex = 34;
						regions = departments;
						selectedRegions = _this.getSelectedRegions(poolsStructure.dep);
					}
					else if ($('#optionCommunities').is(':checked')) {
						regionColumnIndex = 35;
						regions = communes;
						selectedRegions = _this.getSelectedRegions(poolsStructure.communes);
					}
					else if ($('#optionTownships').is(':checked')) {
						regionColumnIndex = 32;
						regions = townships;
						selectedRegions = _this.getSelectedRegions(poolsStructure.townships);
					}


					if (currentAnswers == null)
						markers = _this.showQuestionStat(map, currentColumnIndex, data, currentDate, regions, regionColumnIndex);
					else
						markers = _this.showAnswerStat(map, currentColumnIndex, currentAnswers, data, currentDate, regions, regionColumnIndex);

					var markersByRegionId = {};
					markers.forEach(function (m) { return markersByRegionId[m['_regionId']] = m; });
					map['data'].setStyle(function (feature) {
						var fId = feature.getId();
						var regionMarker = markersByRegionId[fId];
						if (regionMarker != null && $.inArray(fId, selectedRegions) != -1) {
							var percent = regionMarker._percent;
							feature.setProperty('regionName', feature.getProperty('name'));
							if (percent != null) {
								return {
									fillColor: _this.percentToRGB(percent * 100),
									strokeWeight: 1
								};
							} else {
								return {
									visible: false,
									strokeWeight: 0
								}
							}
						} else {
							return {
								visible: false,
								strokeWeight: 0
							}
						}
					});

					markers.forEach(function (m) {
						return google.maps.event.addListener(m, 'click', function (event) {
							if ($('#optionProvinces').is(':checked'))
								showProvincePassposrt(this._departmentName);
							else if ($('#optionDepartments').is(':checked'))
								showDepartmentPassposrt(this._departmentName);
							else if ($('#optionCommunities').is(':checked'))
								showCommunePassposrt(this._departmentName);
							else if ($('#optionTownships').is(':checked'))
								showTownshipPassposrt(this._departmentName);
						});
					});
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

					$('#optionQuestionnaire').trigger('click');

					addMarkers();
				});
				$('#optionDepartments, #optionProvinces, #optionCommunities, #optionTownships').on('change', function () {

					loadMap($(this).data('map-name'));

					addPopMarkers();
					addMarkers();
				});
				$('#optionPopulation, #optionQuestionnaire').on('change', function () { return addMarkers(); });
				$('#pools').on('change', function () {
					addMarkers();
					addPopMarkers();
				})
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

	App.getSelectedRegions = function (structure) {

		var selectedPools = [];
		var regions = [];
		$('#pools option:selected').each(function (i, item) {
			selectedPools.push($(item).text());
		});

		for (var p in structure) {
			if ($.inArray(p, selectedPools) == -1)
				continue;

			regions = regions.concat(structure[p]);
		}

		return regions;
	};

	App.getPoolsStructure = function (populationData) {

		var count = populationData.columns.length;
		var data = populationData.data;

		var regionIndex = 2;
		var depIndex = 5;
		var communeIndex = 8;
		var townshipsIndex = 11;
		var poolIndex = 15;
		var poolDep = {};
		var poolRegion = {};
		var poolCommunes = {};
		var poolTownships = {};
		var pools = [];

		for (var i = count; i < data.length; i += count) {

			var poolName = data[i + poolIndex];
			var regionName = data[i + regionIndex];
			var depName = data[i + depIndex];
			var communeName = data[i + communeIndex];
			var townshipsName = data[i + townshipsIndex];

			if (poolName == '')
				continue;

			if ($.inArray(poolName, pools) == -1)
				pools.push(poolName);

			if (!poolDep[poolName])
				poolDep[poolName] = [];

			if ($.inArray(depName, poolDep[poolName]) == -1)
				poolDep[poolName].push(depName);

			if (!poolRegion[poolName])
				poolRegion[poolName] = [];

			if ($.inArray(regionName, poolRegion[poolName]) == -1)
				poolRegion[poolName].push(regionName);

			if (!poolCommunes[poolName])
				poolCommunes[poolName] = [];

			if ($.inArray(communeName, poolCommunes[poolName]) == -1)
				poolCommunes[poolName].push(communeName);

			if (!poolTownships[poolName])
				poolTownships[poolName] = [];

			if ($.inArray(townshipsName, poolTownships[poolName]) == -1)
				poolTownships[poolName].push(townshipsName.toUpperCase());
		}

		return { dep: poolDep, region: poolRegion, communes: poolCommunes, townships: poolTownships, pools: pools };
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
		var $stat = $('#statistics').html('').append($('<p>', {
			text: 'Please click on an answer bar to see data',
			style: 'margin: 10px 120px; font-size: 9pt;'
		}));
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
		var datasetId = 'fqxbqre';
		$.post('http://knoema.com/api/1.0/data/details?page_id=' + datasetId + '&access_token=' + access_token, {
			"Header": [],
			"Stub": [],
			"Filter": [{
				"DimensionId": "measure",
				"Members": ['5042180'],
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
			var regions = {};
			var departments = {};
			var communes = {};
			var townships = {};
			senegal.Regions.forEach(function (region) {
				regions[region.Id] = region;

				region.Regions.forEach(function (department) {
					departments[department.Id] = department;

					department.Regions.forEach(function (commune) {
						communes[commune.Id] = commune;

						commune.Regions.forEach(function (township) {
							townships[township.Id] = township;
						});
					});
				});
			});

			_this.getPopulationData().done(function (populationData) {
				def.resolve(regions, departments, communes, townships, populationData);
			});
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
					_departmentName: depName
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

			if (depName in departments) {
				var department = departments[depName];
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
					_departmentName: depName
				});
				markers.push(marker);
			}
			else {
				console.log(depName);
			}
		}
		return markers;
	};
	App.datasetColumnNames = {
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

	return App;
})();
//# sourceMappingURL=app.js.map