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

	App.setMapZoomCoordinates = function (id) {
		var zoomCo = {
			'ZM-05': [{ x: -550, y: -130, scale: 4 }, { x: -490, y: -35, scale: 4 }],
			'ZM-10': [{ x: -590, y: -210, scale: 3.3 }, { x: -520, y: -80, scale: 3.1 }],
			'ZM-04': [{ x: -450, y: -160, scale: 3.5 }, { x: -450, y: -40, scale: 3.2 }],
			'ZM-08': [{ x: -400, y: -360, scale: 5 }, { x: -400, y: -200, scale: 5 }],
			'ZM-06': [{ x: -130, y: -330, scale: 3.2 }, { x: -185, y: -170, scale: 3 }],
			'ZM-01': [{ x: -130, y: -520, scale: 3.7 }, { x: -185, y: -290, scale: 3 }],
			'ZM-07': [{ x: -325, y: -620, scale: 4.5 }, { x: -335, y: -380, scale: 4.3 }],
			'ZM-09': [{ x: -500, y: -550, scale: 6 }, { x: -450, y: -300, scale: 5 }],
			'ZM-03': [{ x: -660, y: -385, scale: 4.4 }, { x: -570, y: -205, scale: 4 }],
			'ZM-02': [{ x: -370, y: -400, scale: 3 }, { x: -355, y: -205, scale: 2.75 }]
		}

		var zoom = zoomCo[id];

		$('#zambia-districts').attr('transform', 'scale(' + zoom[0].scale + ') translate(' + zoom[0].x + ', ' + zoom[0].y + ')');
		$('#zambia-constituency').attr('transform', 'scale(' + zoom[1].scale + ') translate(' + zoom[1].x + ', ' + zoom[1].y + ')');

		return zoomCo[id];
	};
	App.init = function () {
		var _this = this;

		$('#pools').selectpicker();

		// read settings
		['datasetId', 'host', 'dashCountrySummary', 'dashCountryDetails', 'dashRegionSummary', 'dashRegionDetails', 'dashDepSummary', 'dashDepDetails', 'dashCommuneSummary', 'dashCommuneDetails', 'dashTownshipSummary', 'dashTownshipDetails'].forEach(function (field) {
			_this[field] = $('#settings_' + field).val();
		});
		['skipFirstColumns', 'departmentColumnIndex', 'provinceColumnIndex', 'dateColumnIndex'].forEach(function (field) {
			_this[field] = parseInt($('#settings_' + field).val());
		});

		var refreshVoteCount = function () {
			$.getJSON('http://' + _this.host + '/api/forms/zpe20160530/status').done(function (result) {
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
			center: { lat: -13.45824, lng: 27.77475 }
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

		$('#top-bar .tab').on('click', function () {
			var $this = $(this);

			if ($this.hasClass('active'))
				return false;

			$this.siblings('a').removeClass('active');
			$this.addClass('active');
			$('.tab1, .tab2, .tab3').hide();

			if ($this.hasClass('questionnaire'))
				$('.tab1').show();
			else {
				$('.tab2').show();
				$('.tab2 .timeline .item:last-child').click();
			}
		});

		this.candidate = {
			'edgar': {
				'name': 'Edgar Lungu',
				'party': '(PF)',
				'lastYearData': 49.17,
				'id': 1000020,
				'actualName': 'Edgar Lungu (PF)',
				'vote': 0
			},
			'hakainde': {
				'name': 'Hakainde Hichilema ',
				'party': '(UPND)',
				'lastYearData': 44.91,
				'id': 1000030,
				'actualName': 'Hakainde Hichilema (UPND)',
				'vote': 0
			},
			'tilyenji': {
				'name': 'Tilyenji Kaunda',
				'party': '(UNIP)',
				'lastYearData': 0.70,
				'id': 1000060,
				'actualName': 'Tilyenji Kaunda (UNIP)',
				'vote': 0
			},
			'edith': {
				'name': 'Edith Nawakwi',
				'party': '(FDD)',
				'lastYearData': 1.09,
				'id': 1000040,
				'actualName': 'Edith Nawakwi (FDD)',
				'vote': 0
			},
			'saviour': {
				'name': 'Saviour Chishimba',
				'party': '(UPP)',
				'actualName': 'Saviour Chishimba (UPP)',
				'vote': 0
			},
			'peter': {
				'name': 'Peter Sinkamba',
				'party': '(Greens Party)',
				'lastYearData': 0.09,
				'id': 1000120,
				'actualName': 'Peter Sinkamba (GPZ)',
				'vote': 0
			},
			'winter': {
				'name': 'Winter Kabimba',
				'party': '(Rainbow Party)',
				'actualName': 'Winter Kabimba (Rainbow Party)',
				'vote': 0
			},
			'andy': {
				'name': 'Andy Banda',
				'party': '(PAC)',
				'actualName': 'Andy Banda (PAC)',
				'vote': 0
			},
			'maxwell': {
				'name': 'Maxwell Mwamba',
				'party': '(DA)',
				'actualName': 'Maxwell Mwamba (DA)',
				'vote': 0
			}
		};

		$('.tab2 .candidate .view').on('click', function () {
			var $this = $(this);
			$('.tab2').hide('slow');
			$('.tab3').show('slow');
			var $head = $('.head');
			var id = $this.parent().get(0).id;
			$head.addClass(id);
			var can = _this.candidate[id];
			$head.find('.name span:first-child').text(can.name).end().find('.name span:last-child').text(can.party);
			$('.tab3 .timeline .item:last-child').click();
			return false;
		});

		$('.tab3 .head .back').on('click', function () {
			$('.tab2').show('slow');
			$('.tab3 .head').attr('class', 'head');
			$('.tab3').hide('slow');
			return false;
		});

		$('.tab3 g#zambia-province path').on('click', function () {
			var $this = $(this);
			var province = App.regions.find(function (region) { return $this.get(0).id === region.id; });
			$this.siblings('path').removeClass('active');
			$this.addClass('active');
			var $districtsMap = $('#zambia-districts');
			$districtsMap.find('path').removeClass('selected active');
			$('.tab3 .districts .header').text(province.name + " province");
			province.regions.forEach(function (district, idx) {
				if (idx == 0) {
					$districtsMap.find('#' + district.id).addClass('active');
					selectConst(district);
				}
				$districtsMap.find('#' + district.id).addClass('selected').data('regions', district);
			});
			$this.data('regions', province);
			var currentDate = $('.tab3 .timeline .item.active').data('date');

			//Zoom Map;

			_this.setMapZoomCoordinates($this.get(0).id);

			_this.changeRating(null, currentDate, false, "districts", $this.get(0).id, province);

		});

		var selectConst = function (district) {
			var $consMap = $('#zambia-constituency');
			$consMap.find('path').removeClass('selected active');
			$('.tab3 .constituencey .header').text(district.name + " district");
			district.regions.forEach(function (cons, idx) {
				if (idx == 0)
					$consMap.find('#' + cons.id).addClass('selected active');
				else
					$consMap.find('#' + cons.id).addClass('selected');
			});
		};

		$('.tab3 g#zambia-districts').on('click', 'path.selected', function () {
			var $this = $(this);
			var districts = $this.data('regions');

			$this.siblings('path').removeClass('active');
			$this.addClass('active');
			var $districtsMap = $('#zambia-districts');
			$('.tab3 .constituencey .header').text(districts.name + " district");
			selectConst(districts);
			var currentDate = $('.tab3 .timeline .item.active').data('date');

			_this.changeRating(null, currentDate, false, "constituencey", $this.get(0).id, districts);
		});

		$('.tab3 g#zambia-constituency ').on('click', 'path.selected', function () {
			var $this = $(this);
			$this.siblings('path').removeClass('active');
			$this.addClass('active');
		});

		var getRegion = function (regionId, regionLevel) {
			var regionData;
			if (regionLevel == 'province') {
				App.regions.forEach(function (region) {
					if (regionId == region.id) {
						regionData = region;
						return true;
					}
				});
			};

			return regionData;
		};

		var showProvincePassposrt = function (regionName) {
			if (regionName == null)
				return;

			var summaryUrl = 'http://knoema.com/resource/embed/' + _this.dashRegionSummary + '/?noHeader=1&Region=' + encodeURI(regionName + " Province");
			var detailsUrl = 'http://knoema.com/resource/embed/' + _this.dashRegionDetails + '/?noHeader=1&province=' + encodeURI(regionName + " Province");
			$('#passportPopup .title').html(regionName);
			$('#tab-summary').html('<iframe src="' + summaryUrl + '">');
			$('#tab-details').html('<iframe src="' + detailsUrl + '">');
			$('#passportPopup').show();
		};
		var showDepartmentPassposrt = function (regionName) {
			if (regionName == null)
				return;

			var summaryUrl = 'http://knoema.com/resource/embed/' + _this.dashDepSummary + '/?noHeader=1&district=' + encodeURI(regionName) + '&Region=' + encodeURI(regionName);
			var detailsUrl = 'http://knoema.com/resource/embed/' + _this.dashDepDetails + '/?noHeader=1&district=' + encodeURI(regionName);
			$('#passportPopup .title').html(regionName);
			$('#tab-summary').html('<iframe src="' + summaryUrl + '">');
			$('#tab-details').html('<iframe src="' + detailsUrl + '">');
			$('#passportPopup').show();
		};
		var showCommunePassposrt = function (regionName) {
			if (regionName == null)
				return;

			var summaryUrl = 'http://knoema.com/resource/embed/' + _this.dashCommuneSummary + '/?noHeader=1&constituency=' + encodeURI(regionName.toUpperCase()) + '&Region=' + encodeURI(regionName);
			var detailsUrl = 'http://knoema.com/resource/embed/' + _this.dashCommuneDetails + '/?noHeader=1&constituency=' + encodeURI(regionName.toUpperCase());
			$('#passportPopup .title').html(regionName);
			$('#tab-summary').html('<iframe src="' + summaryUrl + '">');
			$('#tab-details').html('<iframe src="' + detailsUrl + '">');
			$('#passportPopup').show();
		};

		var loadMap = function (mapName) {

			map['data'].forEach(function (feature) {
				map['data'].remove(feature);
			});

			map['data'].loadGeoJson('./scripts/zambia-' + mapName + '.json');
		};

		map['data'].addListener('click', function (event) {
			if ($('#option-provinces').is(':checked'))
				showProvincePassposrt(event.feature.getProperty('regionName'));
			else if ($('#option-districts').is(':checked'))
				showDepartmentPassposrt(event.feature.getProperty('regionName'));
			else if ($('#option-constituencies').is(':checked'))
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

							var valIndex = 9;

							var regions;
							var regionColumnIndex = 1;
							var baseNameIndex;
							var baseColumnIndex;

							if ($('#option-provinces').is(':checked')) {
								baseColumnIndex = 17;
								baseNameIndex = 2;
								regions = provinces;
							}
							else if ($('#option-districts').is(':checked')) {
								baseColumnIndex = 18;
								baseNameIndex = 3;
								regions = departments;
							}
							else if ($('#option-constituencies').is(':checked')) {
								baseColumnIndex = 19;
								baseNameIndex = 4;
								regions = communes;
							}

							var count = populationData.columns.length;
							var pdata = populationData.data;
							var baseData = data;

							var popMarkerInfo = {};
							var popMarkerNameInfo = {};

							var lists = _.groupBy(data.data, function (element, index) {
								return Math.floor(index / baseData.columns.length);
							});

							lists = _.toArray(lists);
							_this.votesByDate = _.groupBy(lists, function (element, index) {
								return element[1].value
							});

							for (var r in regions) {
								popMarkerNameInfo[r] = regions[r].name;
							}
							for (var i = count; i < pdata.length; i += count) {
								var value = pdata[i + valIndex];
								var regionName = pdata[i + regionColumnIndex];

								//if (!regions[regionName] || regionName.startsWith('MR-NKC'))//PGP committed
								//	continue;

								if (!regions[regionName])
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
				var $timeline = $('.timeline');
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
					var month = {
						'01': "Jan",
						'02': "Feb",
						"03": "Mar",
						"04": "Apr",
						"05": "May",
						"06": "Jun",
						"07": "Jul",
						"08": "Aug",
						"09": "Sep",
						"10": "Oct",
						"11": "Nov",
						"12": "Dec"
					};
					dates.forEach(function (date, index) {
						var dateParts = date.split('/');
						$timeline.append('<div style="width:' + width + '%;" class="item ' + (index == (dates.length - 1) ? 'active' : '') + '" data-date="' + date + '"><span class="day">' + parseInt(dateParts[1]) + '</span>&nbsp;<span class="month">' + month[dateParts[0]] + '</span></div>');
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
					if ($('#option-provinces').is(':checked')) {
						regionColumnIndex = 21;
						regionNameIndex = 2;
						regions = provinces;
					}
					else if ($('#option-districts').is(':checked')) {
						regionColumnIndex = 22;
						regionNameIndex = 3;
						regions = departments;
					}
					else if ($('#option-constituencies').is(':checked')) {
						regionColumnIndex = 23;
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
				$('#option-provinces, #option-districts, #option-constituencies').on('change', function () {

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
					if ($(this).parents('.tab2, .tab3').length) {
						var isFirstPage = true;
						if ($(this).parents('.tab3').length)
							isFirstPage = false;
						_this.changeRating(data, currentDate, isFirstPage, 'province');
						return false;
					}
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
					lastPercentage.label = 'OTHER';
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

	App.populateZambiaChart = function (votesByCurrentDate, regionLevel) {
		var _this = this;
		var votesByCandidate = _.groupBy(votesByCurrentDate, 17);
		var $tab = $('.tab3 .' + regionLevel + '.score .chart');
		for (var key in _this.candidate) {

			var canDet = votesByCandidate[_this.candidate[key].actualName];
			if (canDet) {
				var votePercent = ((canDet.length / votesByCurrentDate.length) * 100).toFixed(2);
				$tab.find('.' + key).find(".rating div:first-child .value").text(votePercent + ' %');
				$tab.find('.' + key).find(".rating div:first-child .vote-percent").css('width', votePercent * 2.5);
			}
			else {
				$tab.find('.' + key).find(".rating div:first-child .value").text(0 + ' %');
				$tab.find('.' + key).find(".rating div:first-child .vote-percent").css('width', 0);
			}

			if (_this.candidate[key].lastYearData)
				$tab.find('.' + key).find(".rating div:last-child .vote-percent").css('width', _this.candidate[key].lastYearData * 2.5);
		};
	};

	App.regionTextPosition = {
		"ZM-04": "translate(416 215)",
		"ZM-03": "translate(572 351)",
		"ZM-02": "translate(369 391)",
		"ZM-09": "translate(412 445)",
		"ZM-04-MW-C-MW": "translate(515 145)",
		"ZM-04-MW-C-MA": "translate(518 162)",
		"ZM-04-MW-C-BA": "translate(525 178)",
		"ZM-04-MI-C-CH": "translate(510 200)",
		"ZM-05-LU-C-LP": "translate(568 161)",
		"ZM-05-LU-C-LU": "translate(578 145)",
		"ZM-04-NC-C-NC": "translate(515 100)",
		"ZM-04-CH-C-CH": "translate(524 80)",
		"ZM-05-KA-C-KA": "translate(555 65)",
		"ZM-05-MB-C-MB": "translate(650 75)",
		"ZM-05-MP-C-MP": "translate(650 224)",
		"ZM-05-MP-C-MF": "translate(675 225)",
		"ZM-03-LU-C-CH": "translate(732 230)",
		"ZM-01-KA-C-MA": "translate(290 365)",
		"ZM-01-MI-C-LW": "translate(225 335)",
		"ZM-01-MI": "translate(160 560)",
		"ZM-07-MO-C-MO": "translate(463 443)",
		"ZM-07-MA-C-MA": "translate(463 430)",
		"ZM-09-SH-C-MW": "translate(470 405)",
		"ZM-06-MU-C-MW": "translate(290 210)",
		"ZM-06-SO-C-SE": "translate(440 230)",
		"ZM-08-MP-C-MO": "translate(476 302)",
		"ZM-08-CH-C-CH": "translate(471 249)",
		"ZM-08-CA-C-CA": "translate(468 261)",
		"ZM-03-CP-C-LU": "translate(710 325)",
		"ZM-03-PE-C-KA": "translate(650 355)",
		"ZM-09-LU": "translate(645 640)",
		"ZM-09-LU-C-FI": "translate(580 400)",
		"ZM-02-KA": "translate(530 580)",
		"ZM-02-KA-C-BW": "translate(498 350)",
		"ZM-09-LD": "translate(530 647)",
		"ZM-03-CP": "translate(808 530)",
		"ZM-08-CA": "translate(495 448)",
		"ZM-01-KA": "translate(240 590)",
		"ZM-07-MO-C-MC": "translate(455 450)",
		"ZM-01-LA-C-LA": "translate(310 396)",
		"ZM-07-LI-C-LI": "translate(380 522)",
		"ZM-01-KO": "translate(136 585)",
		"ZM-01-LA": "translate(275 635)",
		"ZM-07-LI": "translate(390 800)",
	};

	App.addText = function (p, text, fontSize) {
		var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
		var b = p.getBBox();

		var transform = App.regionTextPosition[p.id];
		if (transform)
			t.setAttribute("transform", transform);
		else {
			var offsetX = b.width <= 50 ? 0 : 5;
			var offsetY = b.height <= 50 ? 0 : 5;

			t.setAttribute("transform", "translate(" + ((b.x + b.width / 2) - offsetX) + " " + ((b.y + b.height / 2) + offsetY) + ")");
		}

		t.textContent = text;
		t.setAttribute("fill", "black");
		t.setAttribute("font-size", fontSize);
		p.parentNode.insertBefore(t, p.nextSibling);
	};

	App.getColor = function (position) {

		var colors = ["rgb(0, 255, 0)", "rgb(255, 169, 0)", "rgb(255, 255, 0)", "rgb(255, 85, 0)"];

		return colors[position - 1];
	};

	App.changeRating = function (data, currentDate, isFirstPage, regionLevel, selectedregion, regions) {
		var _this = this;
		var voteCount = 0;
		var tempCan = {};
		var candidate = _this.candidate;
		if (isFirstPage) {
			for (var rowOffset = 0; rowOffset < data.data.length; rowOffset += data.columns.length) {
				if (data.data[rowOffset + _this.dateColumnIndex] != null && data.data[rowOffset + _this.dateColumnIndex].value == currentDate) {
					voteCount++;

					for (var key in candidate)
						if (candidate[key].actualName == data.data[rowOffset + 17]) {
							if (!tempCan[key])
								tempCan[key] = {
									'vote': 0
								};
							tempCan[key].vote += 1;
						}
				}
			}

			for (var key in tempCan)
				if (tempCan[key].vote > 0) {
					tempCan[key].votePercent = ((tempCan[key].vote / voteCount) * 100).toFixed(2);
				}

			for (var key in candidate) {
				if (tempCan[key] && tempCan[key].votePercent) {
					$('#' + key).find(".rating div:first-child .value").text(tempCan[key].votePercent + ' %');
					$('#' + key).find(".rating div:first-child .vote-percent").css('width', tempCan[key].votePercent * 5);
				}
				else {
					$('#' + key).find(".rating div:first-child .value").text(0 + ' %');
					$('#' + key).find(".rating div:first-child .vote-percent").css('width', 0);
				}

				if (candidate[key].lastYearData)
					$('#' + key).find(".rating div:last-child .vote-percent").css('width', candidate[key].lastYearData * 5);
			}
		}
		else {
			var votesByCurrentDate = _this.votesByDate[currentDate];
			var votesByProvince = _.groupBy(votesByCurrentDate, 21);

			var canId = $('.head').attr('class').split(" ")[1];
			var can = _this.candidate[canId];

			function getRegion(key) {
				var regionData;
				_this.regions.forEach(function (region) {

					region.regions.forEach(function (department) {
						if (key == department.id)
							regionData = department;

						department.regions.forEach(function (commune) {
							if (key == commune.id)
								regionData = commune;
						});
					});
				});

				return regionData;
			};
			if (regionLevel == "province") {
				var votePercent = {};
				for (var key in votesByProvince) {
					var votesByCandidateForEach = _.groupBy(votesByProvince[key], 17);
					var canDet = votesByCandidateForEach[can.actualName];
					if (canDet) {
						votePercent[key] = {};
						votePercent[key].percent = ((canDet.length / votesByProvince[key].length) * 100).toFixed(2);
						var position = 1;
						for (var k in votesByCandidateForEach) {
							if (k != can.actualName) {
								if (votesByCandidateForEach[k].length > canDet.length)
									position += 1;
							}
						}
						votePercent[key].position = position;
					}
				}
				$('#zambia-province path').removeClass('active').css('fill', '#fff');
				$('#zambia-province').find('text').remove().end().find('title').remove();

				for (var key in votePercent) {
					if (votePercent[key]) {
						var province = _this.regions.find(function (region) { return key === region.id; });
						var $region = $('#' + key);
						$region.css({ 'fill': _this.getColor(votePercent[key].position), 'opacity': '0.5' });
						$region.html("<title>Region Name: " + province.name + "<br/>Position: " + votePercent[key].position + "</title>");
						_this.addText($region.get(0), votePercent[key].position, "32pt");
					}
				}
				_this.populateZambiaChart(votesByCurrentDate, regionLevel);

				var provincekey;
				for (var k in votePercent) {
					provincekey = k;
					break;
				}
				if (provincekey)
					$('#' + provincekey).click();
				else {
					$('#zambia-districts path').removeClass('active').css('fill', '#fff');
					$('#zambia-districts').find('text').remove().end().find('title').remove();
					$('#zambia-constituency path').removeClass('active').css('fill', '#fff');
					$('#zambia-constituency').find('text').remove().end().find('title').remove();
				}
			}
			else if (regionLevel == "districts") {
				if (selectedregion) {
					var voteForProvince = votesByProvince[selectedregion];
					var voteByDistricts = _.groupBy(voteForProvince, 22);
					var votePercent = {};
					for (var key in voteByDistricts) {
						var votesByCandidateForEach = _.groupBy(voteByDistricts[key], 17);
						var canDet = votesByCandidateForEach[can.actualName];
						if (canDet) {
							votePercent[key] = {};
							votePercent[key].percent = ((canDet.length / voteByDistricts[key].length) * 100).toFixed(2);
							var position = 1;
							for (var k in votesByCandidateForEach) {
								if (k != can.actualName) {
									if (votesByCandidateForEach[k].length > canDet.length)
										position += 1;
								}
							}
							votePercent[key].position = position;
						}
					}

					$('#zambia-districts path').removeClass('active').css('fill', '#fff');
					$('#zambia-districts').find('text').remove().end().find('title').remove();

					for (var key in votePercent) {
						if (votePercent[key]) {
							var $region = $('#' + key);
							$region.css({ 'fill': _this.getColor(votePercent[key].position), 'opacity': '0.5' });
							var region = getRegion(key);
							if (region)
								$region.html("<title>Region Name: " + region.name + "<br/>Position: " + votePercent[key].position + "</title>");
							if ($region.length)
								_this.addText($region.get(0), votePercent[key].position, "7pt");
						}
					}
					$('#' + selectedregion).addClass('active');

					_this.populateZambiaChart(voteForProvince, regionLevel);

					var provincekey;
					for (var k in votePercent) {
						provincekey = k;
						break;
					}

					if (provincekey)
						$('#' + provincekey).click();
					else {
						$('#zambia-constituency path').removeClass('active').css('fill', '#fff');
						$('#zambia-constituency').find('text').remove().end().find('title').remove();
					}
				}
			}
			else {
				if (selectedregion) {
					var voteForProvince = votesByProvince[$('#zambia-province').find('path.active').get(0).id]; // Recently formed Province will reference to old province constituency id.
					var voteByDistricts = _.groupBy(voteForProvince, 22)[selectedregion];
					var voteByCons = _.groupBy(voteByDistricts, 23);
					var votePercent = {};
					for (var key in voteByCons) {
						var votesByCandidateForEach = _.groupBy(voteByCons[key], 17);
						var canDet = votesByCandidateForEach[can.actualName];
						if (canDet) {
							votePercent[key] = {};
							votePercent[key].percent = ((canDet.length / voteByCons[key].length) * 100).toFixed(2);
							var position = 1;
							for (var k in votesByCandidateForEach) {
								if (k != can.actualName) {
									if (votesByCandidateForEach[k].length > canDet.length)
										position += 1;
								}
							}
							votePercent[key].position = position;
						}
					}
					$('#zambia-constituency path').removeClass('active').css('fill', '#fff');
					$('#zambia-constituency').find('text').remove().end().find('title').remove();

					for (var key in votePercent) {
						if (votePercent[key]) {
							var $region = $('#' + key);
							$region.css({ 'fill': _this.getColor(votePercent[key].position), 'opacity': '0.5' });
							var region = getRegion(key);
							if (region)
								$region.html("<title>Region Name: " + region.name + "<br/>Position: " + votePercent[key].position + "</title>");
							_this.addText($region.get(0), votePercent[key].position, "5pt");
						}
					}
					_this.populateZambiaChart(voteByDistricts, regionLevel);
				}
			}
		}
	};

	App.getData = function () {
		var _this = this;
		var def = $.Deferred();
		$.getJSON('http://knoema.com/api/1.0/meta/dataset/' + this.datasetId + '/dimension/province?access_token=' + access_token).done(function (dimension) {
			if (typeof dimension == "string") {
				$("#statistics").addClass("error").html(dimension).append("<p><a href='https://knoema.com/sys/login?returnUrl=" + location.protocol + '//' + location.host + location.pathname + "'>Try to use</a> different account</p>");
			}
			else
				$.post('http://knoema.com/api/1.0/data/details?page_id=' + _this.datasetId + '&access_token=' + access_token, {
					"Header": [],
					"Stub": [],
					"Filter": [{
						"DimensionId": "province",
						"Members": dimension.items.map(function (i) { return i.key; }),
						"DimensionName": "province",
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
			if (!item.hasData)
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
		var datasetId = 'ECZPERRR2016';
		$.get('http://knoema.com/api/1.0/meta/dataset/' + datasetId + '/dimension/indicator?page_id=' + datasetId + '&access_token=' + access_token, {
		}).done(function (data) {
			return def.resolve(data.items);
		});

		return def;
	};
	App.getPopulationData = function (memberId) {
		var self = this;
		var def = $.Deferred();
		var datasetId = 'ECZPERRR2016';
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

	App.getCandidatesData = function (memberId) {
		var self = this;
		var def = $.Deferred();
		var datasetId = 'ECZPERRR2016';
		$.post('http://knoema.com//api/1.0/data/pivot?page_id=' + datasetId + '&access_token=' + access_token, {
			"Header": [{
				'DatasetId': "ECZPERRR2016",
				'DimensionId': "Time",
				'DimensionName': "Time",
				'Members': ['2015-2015'],
				"Order": "0",
				"UiMode": "range"
			}],
			"Stub": [{
				'DatasetId': "ECZPERRR2016",
				'DimensionId': "region",
				'DimensionName': "Region",
				'Members': [],
				"Order": "0",
				"isGeo": true
			},
			{
				'DatasetId': "ECZPERRR2016",
				'DimensionId': "indicator",
				'DimensionName': "Indicator",
				'Members': ["1000020", "1000030", "1000040", "1000060", "1000120"],
				"Order": "1",
			}],
			"Filter": [{
				"DimensionId": "measure",
				"Members": ['1000010'],
				"DimensionName": "Measure",
				"DatasetId": datasetId,
				"Order": "0"
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
			_this.regions = senegal.regions;
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

				var totalPopulation = '1000000';

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
				if (answer != null && targetAnswers != null && targetAnswers.indexOf(answer) >= 0) {
					depAnswerStat[depName] += 1;
				}
			}
		}

		for (var key in depAnswerStat) {
			if (depAnswerStat[key] == 0) {
				delete depAnswerStat[key];
				if (depStat[key])
					delete depStat[key];
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
		'q01': 'Are you a registered voter?',
		'q02': "Have you verified with ECZ on voter's status?",
		'q03': 'Are you - Male of Female?',
		'q04': 'What is your level of education?',
		'q05': 'What is your employment status?',
		'q06': 'How do you rate the work of President Edgar Lungu since 2015? (1 to 10)',
		'q07': 'What is your age group?',
		'q08': 'Do you think the country is going in the right direction?',
		'q09': 'What is your ethnic group?',
		'q10': 'Whom did you vote for in 2015?',
		'q11': 'Are you aware of the referendum?',
		'q12': 'Are you voting?',
		'q13': 'Who is your preferred presidential candidate for 2016?',
		'q14': 'Which party exhibits more violent acts in Zambia?',
		'q15': 'Which MP do you prefer in your constituency?',
		'q16': 'Which campaign materials people have received most?'
	};

	return App;
})();
//# sourceMappingURL=app.js.map