﻿///<reference path='./defs/google.maps.d.ts' />
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
		['datasetId', 'host', 'dashCountryOverview', 'dashCountrySummary', 'dashCountryDetails', 'dashRegionOverview', 'dashRegionSummary', 'dashRegionDetails', 'dashDepOverview', 'dashDepSummary', 'dashDepDetails', 'dashCommuneOverview', 'dashCommuneSummary', 'dashCommuneDetails'].forEach(function (field) {
			_this[field] = $('#settings_' + field).val();
		});
		['skipFirstColumns', 'departmentColumnIndex', 'provinceColumnIndex', 'dateColumnIndex'].forEach(function (field) {
			_this[field] = parseInt($('#settings_' + field).val());
		});
		
		var refreshVoteCount = function () {
			$.getJSON('http://' + _this.host + '/api/forms/pom20150526/status').done(function (result) {
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
			zoom: 6,
			center: { lat: 20.215167, lng: -10.777588 }
		});

		var tabLoadingDelay = 8000;
		$('#showCountrySummary').on('click', function (event) {
			if ($('#tab-country-summary iframe').length <= 0) {
				var overviewUrl = 'http://knoema.com/resource/embed/' + _this.dashCountryOverview + '/?noHeader=1';
				var summaryUrl = 'http://knoema.com/resource/embed/' + _this.dashCountrySummary + '/?noHeader=1';
				var detailsUrl = 'http://knoema.com/resource/embed/' + _this.dashCountryDetails + '/?noHeader=1';
				$('#tab-country-overview').html('<iframe src="' + overviewUrl + '">');
				setTimeout(function () {
					$('#tab-country-summary').html('<iframe src="' + summaryUrl + '">');
					$('#tab-country-details').html('<iframe src="' + detailsUrl + '">');
				}, tabLoadingDelay);
			}
			$('#countrySummaryPopup').show();
		});

		var showProvincePassposrt = function (regionName) {
			if (regionName == null)
				return;

			$('#passportPopup [role=presentation]').removeClass('active');
			$('#passportPopup [role=presentation]:first').addClass('active');
			$('#passportPopup [role=tabpanel]').removeClass('active');
			$('#passportPopup [role=tabpanel]:first').addClass('active');

			var overviewUrl = 'http://knoema.com/resource/embed/' + _this.dashRegionOverview + '/?noHeader=1&Region=' + encodeURI(regionName);
			var summaryUrl = 'http://knoema.com/resource/embed/' + _this.dashRegionSummary + '/?noHeader=1&Region=' + encodeURI(regionName);
			var detailsUrl = 'http://knoema.com/resource/embed/' + _this.dashRegionDetails + '/?noHeader=1&Region=' + encodeURI(regionName);
			$('#passportPopup .title').html(regionName);
			$('#tab-overview').html('<iframe src="' + overviewUrl + '">');
			setTimeout(function () {
				$('#tab-summary').html('<iframe src="' + summaryUrl + '">');
				$('#tab-details').html('<iframe src="' + detailsUrl + '">');
			}, tabLoadingDelay);
			$('#passportPopup').show();
		};
		var showDepartmentPassposrt = function (regionName) {
			if (regionName == null)
				return;

			$('#passportPopup [role=presentation]').removeClass('active');
			$('#passportPopup [role=presentation]:first').addClass('active');
			$('#passportPopup [role=tabpanel]').removeClass('active');
			$('#passportPopup [role=tabpanel]:first').addClass('active');
			
			var overviewUrl = 'http://knoema.com/resource/embed/' + _this.dashDepOverview + '/?noHeader=1&region=' + encodeURI(regionName.toUpperCase()) + '&fgaqdnb.moukataa=' + encodeURI(regionName.toUpperCase()) + '&dtirit.moukataa=' + encodeURI(regionName.toUpperCase()) + '&sfpsahf.moukataa=' + encodeURI(regionName.toUpperCase()) + '&louwet.moukataa=' + encodeURI(regionName.toUpperCase());
			var summaryUrl = 'http://knoema.com/resource/embed/' + _this.dashDepSummary + '/?noHeader=1&dept=' + encodeURI(regionName.toUpperCase()) + '&Region=' + encodeURI(regionName + ' Department');
			var detailsUrl = 'http://knoema.com/resource/embed/' + _this.dashDepDetails + '/?noHeader=1&dept=' + encodeURI(regionName.toUpperCase()) + '&Region=' + encodeURI(regionName + ' Department');
			$('#passportPopup .title').html(regionName);
			$('#tab-overview').html('<iframe src="' + overviewUrl + '">');
			setTimeout(function () {
				$('#tab-summary').html('<iframe src="' + summaryUrl + '">');
				$('#tab-details').html('<iframe src="' + detailsUrl + '">');
			}, tabLoadingDelay);
			$('#passportPopup').show();
		};
		var showCommunePassposrt = function (regionName) {
			if (regionName == null)
				return;

			$('#passportPopup [role=presentation]').removeClass('active');
			$('#passportPopup [role=presentation]:first').addClass('active');
			$('#passportPopup [role=tabpanel]').removeClass('active');
			$('#passportPopup [role=tabpanel]:first').addClass('active');

			var overviewUrl = 'http://knoema.com/resource/embed/' + _this.dashCommuneOverview + '/?noHeader=1&region=' + encodeURI(regionName.toUpperCase()) + '&fgaqdnb.commune=' + encodeURI(regionName.toUpperCase()) + '&rfzcdbd.commune=' + encodeURI(regionName.toUpperCase()) + '&qmulsr.commune=' + encodeURI(regionName.toUpperCase()) + '&zxahkce.commune=' + encodeURI(regionName.toUpperCase()) + '&sfpsahf.commune=' + encodeURI(regionName.toUpperCase()) + '&louwet.commune=' + encodeURI(regionName.toUpperCase());
			var summaryUrl = 'http://knoema.com/resource/embed/' + _this.dashCommuneSummary + '/?noHeader=1&commune=' + encodeURI(regionName) + '&Region=' + encodeURI(regionName);
			var detailsUrl = 'http://knoema.com/resource/embed/' + _this.dashCommuneDetails + '/?noHeader=1&commune=' + encodeURI(regionName) + '&Region=' + encodeURI(regionName);
			$('#passportPopup .title').html(regionName);
			$('#tab-overview').html('<iframe src="' + overviewUrl + '">');
			setTimeout(function () {
				$('#tab-summary').html('<iframe src="' + summaryUrl + '">');
				$('#tab-details').html('<iframe src="' + detailsUrl + '">');
			}, tabLoadingDelay);
			$('#passportPopup').show();
		};
		
		var loadMap = function (mapName) {

			map['data'].forEach(function (feature) {
				map['data'].remove(feature);
			});

			map['data'].loadGeoJson('./scripts/mauritania-' + mapName + '.json');
		};

		map['data'].addListener('click', function (event) {
			if ($('#optionProvinces').is(':checked'))
				showProvincePassposrt(event.feature.getProperty('regionName'));
			else if ($('#optionDepartments').is(':checked'))
				showDepartmentPassposrt(event.feature.getProperty('regionName'));
			else if ($('#optionCommunities').is(':checked'))
				showCommunePassposrt(event.feature.getProperty('regionName'));
		});
		var markers;
		var popMarkers = [];

		this.getDepartments().done(function (provinces, departments, communes) {

			_this.getData().done(function (data) {

				loadMap('regions');

				{
					var addPopMarkers = function () {
						if ($('#population-select').val() == 'q')
							return;

						_this.getPopulationData($('#population-select').val()).done(function (populationData) {

							if (popMarkers.length > 0) {
								popMarkers.forEach(function (marker) { return marker.setMap(null); });
								popMarkers = [];
							}

							var valIndex = 6;

							var regions;
							var regionColumnIndex = 1;
							var baseNameIndex;
							var baseColumnIndex;

							if ($('#optionProvinces').is(':checked')) {
								baseColumnIndex = 17;
								baseNameIndex = 2;
								regions = provinces;
							}
							else if ($('#optionDepartments').is(':checked')) {
								baseColumnIndex = 18;
								baseNameIndex = 3;
								regions = departments;
							}
							else if ($('#optionCommunities').is(':checked')) {
								baseColumnIndex = 19;
								baseNameIndex = 4;
								regions = communes;
							}

							var count = populationData.columns.length;
							var pdata = populationData.data;
							var baseData = data;

							var popMarkerInfo = {};
							var popMarkerNameInfo = {};
							//for (var i = baseData.columns.length; i < baseData.data.length; i += baseData.columns.length)
							//	if (regions[baseData.data[i + baseColumnIndex]])
							//		popMarkerNameInfo[baseData.data[i + baseColumnIndex]] = regions[baseData.data[i + baseColumnIndex]].name;
							for (var r in regions) {
								popMarkerNameInfo[r] = regions[r].name;
							}
							for (var i = count; i < pdata.length; i += count) {
								var value = pdata[i + valIndex];
								var regionName = pdata[i + regionColumnIndex];

								if (!regions[regionName] || regionName.startsWith('MR-NKC'))
									continue;

								if (!popMarkerInfo[regionName])
									popMarkerInfo[regionName] = value;
								else
									popMarkerInfo[regionName] += value;
							}

							var max = -1;
							var min = Infinity;
							for (var rId in popMarkerInfo) {
								if (popMarkerInfo[rId] > max)
									max = popMarkerInfo[rId];
								if (popMarkerInfo[rId] < min)
									min = popMarkerInfo[rId];
							}
							_this.setLegendValues('0', '', (max / 1000).toFixed(1) + 'k', true);

							map['data'].setStyle(function (feature) {
								var fId = feature.getId();

								if (popMarkerInfo[fId]) {
									feature.setProperty('regionName', popMarkerNameInfo[fId]);
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
						});
					};
					addPopMarkers();

					$('#population-select').on('change', function () { return addPopMarkers(); });
				}

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
					if ($('#population-select').val() != 'q') {

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
					var regionNameIndex;

					var isTwnshp = false;
					if ($('#optionProvinces').is(':checked')) {
						regionColumnIndex = 17;
						regionNameIndex = 2;
						regions = provinces;
					}
					else if ($('#optionDepartments').is(':checked')) {
						regionColumnIndex = 18;
						regionNameIndex = 3;
						regions = departments;
					}
					else if ($('#optionCommunities').is(':checked')) {
						regionColumnIndex = 19;
						regionNameIndex = 4;
						regions = communes;
					}

					markers = _this.showAnswerStat(map, currentColumnIndex, currentAnswers, data, currentDate, regions, regionColumnIndex, regionNameIndex);

					_this.setLegendValues();

					var markersByRegionId = {};
					markers.forEach(function (m) { return markersByRegionId[m['_regionId']] = m; });
					map['data'].setStyle(function (feature) {
						var fId = feature.getId();
						var regionMarker = markersByRegionId[fId];
						if (regionMarker != null) {
							var percent = regionMarker._percent;
							feature.setProperty('regionName', regionMarker['_departmentName']);
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

					$('#population-select').val('q');

					addMarkers();
				});
				$('#optionDepartments, #optionProvinces, #optionCommunities, #optionTownships').on('change', function () {

					loadMap($(this).data('map-name'));

					addPopMarkers();
					addMarkers();
				});
				$('#population-select').on('change', function () { return addMarkers(); });
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

	App.setLegendValues = function (low, medium, high, back) {

		var $legend = $('#legend');
		$legend.find('.color-item').remove();

		if (back) {
			for (var i = 10; i > 0; i--) {
				var item = $('<div class="color-item" style="background-color: ' + this.percentToRGB(i * 10) + ';"></div>');
				$legend.append(item);
			}
		}
		else {
			for (var i = 0; i <= 10; i++) {
				var item = $('<div class="color-item" style="background-color: ' + this.percentToRGB(i * 10) + ';"></div>');
				$legend.append(item);
			}
		}

		$('#legend_low').html(low != undefined ? low : '0');
		$('#legend_medium').html(medium != undefined ? medium : '50');
		$('#legend_high').html(high != undefined ? high : '100%');
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
					"MeasureAggregations": null,
					"RegionIdsRequired": true
				}).done(function (data) {
					return def.resolve(data);
				});
		});
		return def;
	};
	App.displayPopulationItems = function (dimItems, selectedItem) {

		var $items = [];
		for (var i = 0; i < dimItems.length; i++) {
			var item = dimItems[i];
			
			var options = {
				value: item.key,
				text: (item.level == 1 ? '\xa0\xa0\xa0' : '') + item.name
			};
			if(!item.hasData)
				options.disabled = 'disabled';
			if (item.key == selectedItem)
				options.selected = 'selected';

			$items.push($('<option>', options));
		}

		$('#population-select').append($items);
	};
	App.getPopulationIndicators = function () {

		var self = this;
		var def = $.Deferred();
		var datasetId = 'MRPOPELST2016';
		$.get('http://knoema.com/api/1.0/meta/dataset/' + datasetId + '/dimension/indicator?page_id=' + datasetId + '&access_token=' + access_token, {
		}).done(function (data) {
			return def.resolve(data.items);
		});

		return def;
	};
	App.getPopulationData = function (memberId) {
		var self = this;
		var def = $.Deferred();
		var datasetId = 'MRPOPELST2016';
		$.post('http://knoema.com/api/1.0/data/details?page_id=' + datasetId + '&access_token=' + access_token, {
			"Header": [],
			"Stub": [],
			"Filter": [{
				"DimensionId": "indicator",
				"Members": [memberId],
				"DimensionName": "Indicator",
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
			senegal.regions.forEach(function (region) {
				regions[region.id] = region;

				region.regions.forEach(function (department) {
					departments[department.id] = department;

					department.regions.forEach(function (commune) {
						communes[commune.id] = commune;
					});
				});
			});

			_this.getPopulationIndicators().done(function (dimItems) {

				var totalPopulation = '1000120';

				_this.displayPopulationItems(dimItems, totalPopulation);

				def.resolve(regions, departments, communes);
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
	App.showAnswerStat = function (map, columnIndex, targetAnswers, data, currentDate, departments, regionColumnIndex, regionNameIndex) {
		// vote count by question for each department
		var depStat = {};
		// vote count by answer for each departmnet
		var depAnswerStat = {};
		var depNames = {};
		for (var rowOffset = 0; rowOffset < data.data.length; rowOffset += data.columns.length) {
			if (data.data[rowOffset + this.dateColumnIndex] != null && data.data[rowOffset + this.dateColumnIndex].value == currentDate) {
				var depName = data.data[rowOffset + regionColumnIndex];
				depNames[depName] = data.data[rowOffset + regionNameIndex];
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
					_regionId: department.id,
					_departmentName: department.name
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
		'Sex': 'GENRE ?',
		'Education': 'QUEL EST VOTRE NIVEAU D’EDUCATION ?',
		'Profession': 'QUELLE EST VOTRE SITUATION PROFESSIONNELLE ?',
		'Age': 'QUEL EST VOTRE GROUPE D’AGE',
		'Religion': 'QUELLE EST VOTRE AFFILIATION RELIGIEUSE ?',
		'Nationality': 'QUEL EST VOTRE GROUPE ETHNIQUE ?',
		'EvaluatePresident': 'COMMENT EVALUEZ-VOUS LE TRAVAIL DU PRESIDENT MOHAMED OULD ABDEL AZIZ DEPUIS 2014 ?',
		'RightDirection': 'PENSEZ-VOUS QUE LE PAYS VA DANS LA BONNE DIRECTION ?',
		'Priority1': 'QUELLES SONT LES TROIS PRIORITES OÙ VOUS ATTENDEZ LE PRESIDENT ? #1:',
		'Priority2': 'QUELLES SONT LES TROIS PRIORITES OÙ VOUS ATTENDEZ LE PRESIDENT ? #2:',
		'Priority3': 'QUELLES SONT LES TROIS PRIORITES OÙ VOUS ATTENDEZ LE PRESIDENT ? #3:'
	};

	return App;
})();
//# sourceMappingURL=app.js.map