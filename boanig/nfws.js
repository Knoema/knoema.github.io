/// <reference path="typings/jquery.d.ts"/>
/// <reference path="typings/google.maps.d.ts"/>
var Infrastructure;
(function (Infrastructure) {
	var TypeNameToId = {};

	var TypeNameToIcon = {};

	var TypeNameToPassportImage = {};

	var RegionNameToColor = {};

	var Application = (function () {
		function Application() {
		}

		Application.prototype.run2 = function () {

			var self = this;

			self.showTopic('water');
			//self.showTopic('food');
			//self.showTopic('population');

			$('.sidebar-topic').on('click', function () {

				var topicId = $(this).data('topic-id');

				self.showTopic(topicId);
			});

			$('.main-menu a').click(function (e) {
				e.preventDefault()
				
				window.location = $(this).attr('href');
			})

			$('.topic-content li').on('click', function () {
				
				var $this = $(this).find('.custom-checkbox');
				var $checkbox = $(this).find('input[type=checkbox]');
				var indicator = $checkbox.val();
				if ($this.hasClass('checked')) {
					if ($.inArray(indicator, self.indicators) != -1) {
						self.indicators.splice($.inArray(indicator, self.indicators), 1);
					}

					$this.removeClass('checked');
					$(this).find('input[type=checkbox]').removeAttr('checked');

					switch (indicator) {
						case 'rain':
							self.rainLayer.setMap(null);
							break;
						case 'rain2':
							self.hideLegend();
							self.rain2Layer.setMap(null);
							break;

						case 'density':
						case 'ethnicities':
						case 'livelihood':
						case 'fews':
							self.hideLegend();
							self.map.data.forEach(function (feature) {
								self.map.data.remove(feature);
							});

							break;

						case 'road':
						case 'railroad':
							self.clearMarkers(indicator);
							self.map.data.forEach(function (feature) {
								self.map.data.remove(feature);
							});

							break;

						case 'alcogol':
							if ($.inArray('markets', self.indicators) != -1) {
								self.loadDataForIndicator('markets');
							}
							else {
								self.clearMarkers('markets');
							}
							break;

						case 'markets':
							if ($.inArray('alcogol', self.indicators) != -1) {
								$('input[value=alcogol]').parent().parent().trigger('click');
							}
							else {
								self.clearMarkers(indicator);
							}
							break;

						case 'displaced-persons-all':
							if ($.inArray('displaced-persons-conflict', self.indicators) != -1) {
								$('input[value=displaced-persons-conflict]').parent().parent().trigger('click');
							}
							if ($.inArray('displaced-persons-natural', self.indicators) != -1) {
								$('input[value=displaced-persons-natural]').parent().parent().trigger('click');
							}
							break;

						case 'displaced-persons-conflict':
							//
							self.clearMarkers(indicator);
							//}
							//else {
							if ($.inArray('displaced-persons-all', self.indicators) != -1 && $.inArray('displaced-persons-natural', self.indicators) == -1) {
								$('input[value=displaced-persons-all]').parent().parent().trigger('click');
							}
							//}
							break;

						case 'displaced-persons-natural':
							//if ($.inArray('displaced-persons-conflict', self.indicators) != -1) {
							self.clearMarkers(indicator);
							//}
							//else {
							if ($.inArray('displaced-persons-all', self.indicators) != -1 && $.inArray('displaced-persons-conflict', self.indicators) == -1) {
								$('input[value=displaced-persons-all]').parent().parent().trigger('click');
							}
							//}
							break;

						case 'farms':
						case 'hospital':
						case 'schools':
						case 'churches':
						case 'mosques':
						case 'buildings':

						case 'refineries':
						case 'platforms':
						case 'power':

						case 'refugee':
						case 'bocoharam':
						case 'fatalities':

						case 'cities':
							self.clearMarkers(indicator);
							break;
					}
				}
				else {
					self.indicators.push(indicator);

					$this.addClass('checked');
					$(this).find('input[type=checkbox]').attr('checked');

					var singleLayers = ['rain2', 'density', 'ethnicities', 'livelihood', 'road', 'railroad', 'fews'];

					var layerIndex = $.inArray(indicator, singleLayers);
					if (layerIndex != -1) {
						if (indicator != 'rain2')
							self.rain2Layer.setMap(null);

						if (indicator != 'railroad')
							self.clearMarkers('railroad');

						if (indicator == 'road' || indicator == 'railroad') {
							self.hideLegend();
						}
						else {
							self.showLegend();
						}

						self.map.data.forEach(function (feature) {
							self.map.data.remove(feature);
						});

						for (var i = 0; i < singleLayers.length; i++) {
							if (i != layerIndex) {
								$('input[value=' + singleLayers[i] + ']').parent().find('.custom-checkbox').removeClass('checked');

								var indIndex = $.inArray(singleLayers[i], self.indicators);
								if (indIndex != -1)
									self.indicators.splice(indIndex, 1);
							}
						}
					}

					self.loadDataForIndicator(indicator);
				}

				return false;
			});

			$('#calendar .item').on('click', function () {

				$('.item').removeClass('active');
				$(this).addClass('active');
				self.timeBarDate = $(this).data('date');
				self.timeBarMonth = $(this).data('month');

				if ($.inArray('rain', self.indicators) != -1) {
					self.rainLayer.setMap(null);
					self.loadDataForIndicator('rain');
				}

				if ($.inArray('bocoharam', self.indicators) != -1) {
					self.clearMarkers('bocoharam');
					self.loadDataForIndicator('bocoharam');
				}

				if ($.inArray('fatalities', self.indicators) != -1) {
					self.clearMarkers('fatalities');
					self.loadDataForIndicator('fatalities');
				}
				if ($.inArray('farms', self.indicators) != -1) {
					self.clearMarkers('farms');
					self.loadDataForIndicator('farms');
				}

				if ($.inArray('alcogol', self.indicators) != -1) {
					self.clearMarkers('alcogol');
					self.loadDataForIndicator('alcogol');
				}
			});

			$('#clear-all-filters').on('click', function () {

				self.hideLegend();
				var indicators = self.indicators.slice();
				for (var i = 0; i < indicators.length; i++) {
					$('input[value=' + indicators[i] + ']').parent().parent().trigger('click');
				}

				return false;
			});

			$('[data-toggle="tooltip"]').tooltip({ placement: 'bottom' });
			$('[data-toggle="tooltip-lh"]').tooltip();
			$('[data-toggle="tooltip3"]').tooltip({
				title: 'To view similar indicators, click <a href="http://knoema.com/atlas/topics/Demographics" target="blank">here</a>',
				html: true,
				delay: { "show": 0, "hide": 1000 }
			});

			window.AppMapData = {};
			this.timeBarDate = '2014.06';
			this.timeBarMonth = '6';
			this.indicators = [];
			this.datasets = {};
			this.koeffTable = {
				farms: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [-0.1, 0], [-0.4, 0], [-0.7, 0], [-1, 0], [-1.3, 0], [-1.3, 0], [-1.3, 0]],
				bocoharam: [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1]],
				fatalities: [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1]]
			};
			this.showDataTable = {
				alcogol: [1, 1, 1, 1, 1, 1, 0.5, 0, 0, 0.5, 0.5, 0]
			};

			//$('input[value=rain]').parent().parent().trigger('click');
			//$('input[value=bocoharam]').parent().parent().trigger('click');
			//$('input[value=farms]').parent().parent().trigger('click');
			//$('input[value=fatalities]').parent().parent().trigger('click');
			//$('input[value=churches]').parent().parent().trigger('click');

			//$('input[value=rain2]').parent().parent().trigger('click');

			var self = this;
			this.getMarkets().done(function (data) {

				window.AppMapData['markets'] = data;

				var indexFrom = 3;
				var indexTo = 15;

				
				var options = [];
				for(var i = indexFrom; i< indexTo; i++)
					options.push($('<option>', { text: data.columns[i].name, value: i }));

				$('#products').append(options);
			});

			$('#products').on('change', function () {
				
				if ($.inArray('markets', self.indicators) != -1) {
					self.loadDataForIndicator('markets');
				}
				else {
					$('input[value=markets]').parent().parent().trigger('click');
				}
			});
		};

		Application.prototype.loadDataForIndicator = function (indicator) {

			var self = this;

			switch (indicator) {

				case 'road':

					this.map.data.loadGeoJson('Nigeria-Roads.json');
					this.map.data.setStyle(function (feature) {

						return {
							strokeColor: '#643100',
							strokeOpacity: 0.8,
							strokeWeight: 2
						};
					});
					break;

				case 'railroad':

					this.map.data.loadGeoJson('Nigeria-Railroads.json');
					this.map.data.setStyle(function (feature) {

						return {
							strokeColor: '#385800',
							strokeOpacity: 0.8,
							strokeWeight: 4
						};
					});

					var railroadOptions = {
						wovalue: true,
						size: 5000,
						fillColor: '#1e5d02',
						strokeColor: '#000',
					};

					if (window.AppMapData[indicator]) {
						self.addObjectsToMap(self.map, window.AppMapData[indicator], indicator, 1, 2, false, true, railroadOptions);
					}
					else {
						$(document.body).addClass('loading');

						this.getRailStations().done(function (data) {

							self.addObjectsToMap(self.map, data, indicator, 1, 2, false, true, railroadOptions);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'ethnicities':

					$(document.body).addClass('loading');
					this.showLegend('ethnicities');

					this.map.data.loadGeoJson('etnicity_felix.json?v=0.123');
					var idByColor = { 0: '#CFEB63', 1: '#2D3180', 2: '#DE5B57', 3: '#61CFED', 4: '#ED72ED', 5: '#449C59', 6: '#9C834F', 7: '#969DFA', 8: '#824F6A', 9: '#5AE85A', 10: '#496A80', 11: '#845FE8', 12: '#689E89', 13: '#F7A797', 14: '#8AF2BB', 15: '#F578AE', 16: '#913A8D', 17: '#F7F0A1', 18: '#819937', 19: '#5A629C', 20: '#8A3344', 21: '#966356', 22: '#8BE37F', 23: '#E6BB5E', 24: '#6FAFF7', 25: '#8AA66C', 26: '#A576DB', 27: '#389C36', 28: '#59F79B', 29: '#C4754D', 30: '#4B6FD1' };

					this.map.data.setStyle(function (feature) {

						var featureId = feature.getProperty('symbol');

						for (i in idByColor) {
							if (featureId == i) {
								return {
									fillColor: idByColor[i],
									fillOpacity: 0.5,
									strokeWeight: 0
								};
							}
						}
					});

					if ($(document.body).hasClass('loading'))
						$(document.body).removeClass('loading');

					break;

				case 'fews':

					$(document.body).addClass('loading');
					this.showLegend('fews');

					this.map.data.loadGeoJson('FEWSs.json?v=1.124');
					var idByColor = { 1: '#DFF7DF', 2: '#FFE517', 3: '#E87A00', 4: '#D00000', 5: '#690D11', 66: '#96DCF0' };

					this.map.data.setStyle(function (feature) {

						var featureId = feature.getProperty('ML2');

						for (i in idByColor) {
							if (featureId == i) {
								return {
									fillColor: idByColor[i],
									fillOpacity: 0.5,
									strokeWeight: 0
								};
							}
						}
					});

					if ($(document.body).hasClass('loading'))
						$(document.body).removeClass('loading');

					break;

				case 'density':

					this.map.data.loadGeoJson('NG-States-GeoJSON.json');
					this.showLegend('density');

					if (window.AppMapData[indicator]) {
						self.addObjectsToDataLayer(self.map, window.AppMapData[indicator], 1, 14);
					}
					else {
						$(document.body).addClass('loading');

						this.getPopulationDensity().done(function (data) {

							self.addObjectsToDataLayer(self.map, data, 1, 14);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'markets':

					var marketOptions = {
						//latlngTransform: true,
						//latOffset: 2,
						//lngOffset: 2,
						priceIndex: $('#products').val() * 1
					};

					if ($.inArray('alcogol', self.indicators) != -1) {
						marketOptions.alcoIndex = 15;
					}

					if (window.AppMapData[indicator]) {
						self.addObjectsToMap(self.map, window.AppMapData[indicator], indicator, 1, 2, false, false, marketOptions);
					}
					else {
						$(document.body).addClass('loading');

						this.getMarkets().done(function (data) {
							self.addObjectsToMap(self.map, data, indicator, 1, 2, false, false, marketOptions);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'alcogol':
					if ($.inArray('markets', self.indicators) != -1) {
						self.loadDataForIndicator('markets');
					}
					else {
						$('input[value=markets]').parent().parent().trigger('click');
					}

					break;

				case 'rain':

					$(document.body).addClass('loading');

					this.rainLayer = new google.maps.KmlLayer({
						url: 'http://6grain.s3.amazonaws.com/kmz/chirps-v2.0.' + this.timeBarDate + '.tif.kmz',
						map: this.map,
						preserveViewport: true
					});

					if ($(document.body).hasClass('loading'))
						$(document.body).removeClass('loading');
					break;

				case 'rain2':

					$(document.body).addClass('loading');
					this.showLegend('rain2');

					this.rain2Layer = new google.maps.KmlLayer({
						url: 'http://6grain.s3.amazonaws.com/kmz/MaliToNigeria0601to09152015.kmz',
						map: this.map,
						preserveViewport: true
					});

					if ($(document.body).hasClass('loading'))
						$(document.body).removeClass('loading');
					break;

				case 'hospital':
					if (window.AppMapData[indicator]) {
						self.addObjectsToMap(self.map, window.AppMapData[indicator], indicator, 22, 23, true, false);
					} else {
						$(document.body).addClass('loading');

						this.getHospitals().done(function (data) {
							self.addObjectsToMap(self.map, data, indicator, 22, 23, true, false);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'schools':

					if (window.AppMapData[indicator]) {
						self.addObjectsToMap(self.map, window.AppMapData[indicator], indicator, 11, 12, true, false);
					}
					else {
						$(document.body).addClass('loading');

						this.getSchools().done(function (data) {
							self.addObjectsToMap(self.map, data, indicator, 11, 12, true, false);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'churches':

					if (window.AppMapData[indicator]) {
						self.addObjectsToMap(self.map, window.AppMapData[indicator], indicator, 3, 4, true, false);
					}
					else {
						$(document.body).addClass('loading');

						this.getChurches().done(function (dataCh) {
							self.addObjectsToMap(self.map, dataCh, indicator, 3, 4, true, false);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'mosques':

					if (window.AppMapData[indicator]) {
						self.addObjectsToMap(self.map, window.AppMapData[indicator], indicator, 3, 4, true, false);
					}
					else {
						$(document.body).addClass('loading');

						self.getMosques().done(function (dataMo) {

							self.addObjectsToMap(self.map, dataMo, indicator, 3, 4, true, false);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'buildings':

					if (window.AppMapData[indicator]) {
						self.addObjectsToMap(self.map, window.AppMapData[indicator], indicator, 3, 4, true, false);
					}
					else {
						$(document.body).addClass('loading');

						this.getBuildings().done(function (data) {
							self.addObjectsToMap(self.map, data, indicator, 3, 4, true, false);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'refineries':

					if (window.AppMapData[indicator]) {
						self.addObjectsToMap(self.map, window.AppMapData[indicator], indicator, 2, 3, false, false);
					}
					else {
						$(document.body).addClass('loading');

						this.getRefineries().done(function (data) {
							self.addObjectsToMap(self.map, data, indicator, 2, 3, true, false);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'platforms':

					if (window.AppMapData[indicator]) {
						self.addObjectsToMap(self.map, window.AppMapData[indicator], indicator, 6, 7, true, false);
					}
					else {
						$(document.body).addClass('loading');

						this.getPlatforms().done(function (data) {
							self.addObjectsToMap(self.map, data, indicator, 6, 7, true, false);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'power':

					if (window.AppMapData[indicator]) {
						self.addObjectsToMap(self.map, window.AppMapData[indicator], indicator, 2, 3, true, false);
					}
					else {
						$(document.body).addClass('loading');

						this.getPowerStations().done(function (data) {
							self.addObjectsToMap(self.map, data, indicator, 2, 3, true, false);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'farms':

					var farmOptions = {
						valueIndex: 15,
						fillColor: '#72cc4a',
						strokeColor: '#000',
						//offsetTable: true,
						//latlngTransform: true,
						//latOffset: 1.8,
						//lngOffset: 1.8,
						//dontMoveEach: 4
					};

					if (window.AppMapData[indicator]) {
						self.addObjectsToMap(self.map, window.AppMapData[indicator], indicator, 11, 12, false, true, farmOptions);
					}
					else {
						$(document.body).addClass('loading');

						this.getFarms().done(function (data) {
							self.addObjectsToMap(self.map, data, indicator, 11, 12, false, true, farmOptions);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'refugee':

					var refugeeOptions = { valueIndex: 33, fillColor: '#66E7ED', strokeColor: '#000', norm: 0.5 };

					if (window.AppMapData[indicator]) {
						self.addObjectsToMap(self.map, window.AppMapData[indicator], indicator, 5, 6, false, true, refugeeOptions);
					}
					else {
						$(document.body).addClass('loading');

						this.getRefugee().done(function (data) {
							self.addObjectsToMap(self.map, data, indicator, 5, 6, false, true, refugeeOptions);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'displaced-persons-all':

					if ($.inArray('displaced-persons-conflict', self.indicators) == -1) {
						$('input[value=displaced-persons-conflict]').parent().parent().trigger('click');
					}
					if ($.inArray('displaced-persons-natural', self.indicators) == -1) {
						$('input[value=displaced-persons-natural]').parent().parent().trigger('click');
					}
					break;

				case 'displaced-persons-conflict':

					if ($.inArray('displaced-persons-all', self.indicators) == -1) {
						self.indicators.push('displaced-persons-all');
						$('input[value=displaced-persons-all]').siblings('span.custom-checkbox').addClass('checked');
					}

					var displacedOptions = { valueIndex: 7, fillColor: '#3c80e6', strokeColor: '#000', norm: 0.4, displaced: true, displacedType: 'conflict' };

					if (window.AppMapData[indicator]) {
						self.addObjectsToMap(self.map, window.AppMapData[indicator], indicator, 25, 26, false, true, displacedOptions);
					}
					else {
						$(document.body).addClass('loading');

						this.getDisplacedPersons().done(function (data) {
							self.addObjectsToMap(self.map, data, indicator, 25, 26, false, true, displacedOptions);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'displaced-persons-natural':

					if ($.inArray('displaced-persons-all', self.indicators) == -1) {
						self.indicators.push('displaced-persons-all');
						$('input[value=displaced-persons-all]').siblings('span.custom-checkbox').addClass('checked');
					}

					var displacedOptions = { valueIndex: 7, fillColor: '#3c80e6', strokeColor: '#000', norm: 0.4, displaced: true, displacedType: 'natural' };

					if (window.AppMapData[indicator]) {
						self.addObjectsToMap(self.map, window.AppMapData[indicator], indicator, 25, 26, false, true, displacedOptions);
					}
					else {
						$(document.body).addClass('loading');

						this.getDisplacedPersons().done(function (data) {
							self.addObjectsToMap(self.map, data, indicator, 25, 26, false, true, displacedOptions);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'fatalities':

					var fatalitiesOptions = {
						valueIndex: 23,
						fillColor: '#5e0303',
						strokeColor: '#000',
						filterByDate: true,
						dateIndex: 2,
						//latlngTransform: true,
						//offsetTable: true
					};

					if (window.AppMapData[indicator]) {
						self.addObjectsToMap(self.map, window.AppMapData[indicator], indicator, 18, 19, false, true, fatalitiesOptions);
					}
					else {
						$(document.body).addClass('loading');

						this.getReportedFatalities().done(function (data) {
							self.addObjectsToMap(self.map, data, indicator, 18, 19, false, true, fatalitiesOptions);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'bocoharam':

					var bocoharamOptions = {
						valueIndex: 23,
						fillColor: '#ff00ae',
						strokeColor: '#000',
						filterByDate: true,
						dateIndex: 2,
						//latlngTransform: true,
						//offsetTable: true
					};

					if (window.AppMapData[indicator]) {
						self.addObjectsToMap(self.map, window.AppMapData[indicator], indicator, 18, 19, false, true, bocoharamOptions);
					}
					else {
						$(document.body).addClass('loading');

						this.getBokoHaram().done(function (data) {
							self.addObjectsToMap(self.map, data, indicator, 18, 19, false, true, bocoharamOptions);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'cities':

					var citiesOptions = {
						valueIndex: 4,
						fillColor: '#fff',
						strokeColor: '#000',
						norm: 0.00001,
						dontLog: true
					};

					if (window.AppMapData[indicator]) {
						self.addObjectsToMap(self.map, window.AppMapData[indicator], indicator, 2, 3, false, true, citiesOptions);
					}
					else {
						$(document.body).addClass('loading');

						this.getCities().done(function (data) {
							self.addObjectsToMap(self.map, data, indicator, 2, 3, false, true, citiesOptions);

							if ($(document.body).hasClass('loading'))
								$(document.body).removeClass('loading');
						});
					}
					break;

				case 'livelihood':

					$(document.body).addClass('loading');
					this.showLegend('livelihood');

					this.map.data.loadGeoJson('NG_LHZ_2014.json?v=0.111');
					var idByColor = { 0: '#97DBF2', 1: '#5D5FCF', 2: '#EBB496', 3: '#AB785A', 4: '#8CE68C', 5: '#E16400', 6: '#6B3C1E', 7: '#CDF078', 8: '#CDF078', 9: '#549E54', 10: '#1C561C', 11: '#F3C100', 12: '#658018', 13: '#FFFF00' };

					this.map.data.setStyle(function (feature) {

						var featureId = feature.getProperty('LZNUM');

						for (i in idByColor) {
							if (featureId == i) {
								return {
									fillColor: idByColor[i],
									fillOpacity: 0.5,
									strokeWeight: 0
								};
							}
						}
					});

					if ($(document.body).hasClass('loading'))
						$(document.body).removeClass('loading');

					break;

				default:
					break;
			}
		};

		Application.prototype.showTopic = function (topicId) {

			if ($('.sidebar-topic[data-topic-id=' + topicId + ']').find('.arrow').hasClass('up')) {
				$('.topic-content[data-topic-id=' + topicId + ']').hide();
				$('.sidebar-topic[data-topic-id=' + topicId + ']').find('.arrow').removeClass('up').addClass('down');
			}
			else {
				$('.topic-content[data-topic-id=' + topicId + ']').show();
				$('.sidebar-topic[data-topic-id=' + topicId + ']').find('.arrow').removeClass('down').addClass('up');
			}
		};

		Application.prototype.showLegend = function (indicator) {

			$('#static-legend').show();

			var imgPath = '';
			switch (indicator) {
				case 'rain2':
					imgPath = 'img/scale2.png';
					break;
				case 'density':
					imgPath = 'img/scale-density.png';
					break;
				case 'ethnicities':
					imgPath = 'img/legend1.png';
					break;
				case 'livelihood':
					imgPath = 'img/legend2.png';
					break;
				case 'fews':
					imgPath = 'img/legend3.png';
					break;
			}

			$('#static-legend img').attr('src', imgPath);
		};

		Application.prototype.hideLegend = function () {

			$('#static-legend').hide();
		};

		Application.prototype.run = function () {
			var _this = this;
			this.markers = {};
			this.markerClusters = {};
			this.infoWindow = new google.maps.InfoWindow();

			// Country overview map
			this.map = new google.maps.Map(document.getElementById('map-canvas'), {
				center: { lat: 7.247800, lng: 11.133026 },
				zoom: 6,
				streetViewControl: false,
				zoomControlOptions: {
					position: google.maps.ControlPosition.LEFT_TOP
				},
				mapTypeId: google.maps.MapTypeId.HYBRID
			});
			this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('static-legend'));
			this.map.data.addListener('click', $.proxy(this.clickDataLayerListener, this));


			//radius button
			var $radiusButton = $('#radius-button');

			var drawingManager = new google.maps.drawing.DrawingManager({
				map: this.map,
				drawingMode: null,
				drawingControl: false,
				circleOptions: {
					fillColor: 'black',
					fillOpacity: 0.2,
					strokeWeight: 4,
					strokeColor: 'orange',
					clickable: false,
					editable: true,
					zIndex: 1
				}
			});

			this.radiusToolWindow = new google.maps.InfoWindow();
			this.radiusToolWindow.setContent('<label class="label" style="font-size: 1em; color: #000;">RADIUS, KM</label>&nbsp;&nbsp;<input id="radius-spinner" class="form-control input-sm" type="number" min="0" step="0.1"><a href="#" id="goods-list" class="btn btn-primary btn-sm">GO</a>');

			google.maps.event.addListener(drawingManager, 'circlecomplete', function (circle) {

				function tradeMarkup(latLng) {
					var tradeList = {
						'Cereals': [
							'Loaf of white bread',
							'White rice, 25% broken',
							'Wheat flour',
							'White maize flour',
							'Maize grain',
							'Millet whole grain',
							'Sorghum white whole grain'
						],
						'Livestock products': [
							'Beef with bones',
							'Goat meat',
							'Whole chicked frozen',
							'Large size chicken eggs',
							'Pasteurized unskimmed milk'
						],
						//'Fish products': [
						//	'Bream fish',
						//	'Nile Perch'
						//],
						//'Vegetables': [
						//	'Vegetable oil',
						//	'Onion',
						//	'Round tomato',
						//	'Green cabbage',
						//	'Sweet potatoes',
						//	'Spotted beans'
						//],
						//'Flavours': [
						//	'White sugar',
						//	'Cooking salt'
						//],
						'Fuels': [
							'Gas (regular, unleaded)',
							'Diesel',
							'Cooking Gas (LPG Cylinder)'
						]
					};

					_this.infoWindow.setPosition(latLng);
					_this.infoWindow.setZIndex(999);

					var date = new Date();
					date.setDate(date.getDate() + 7);

					var html = '<div class="trade-markup">';
					html += '<p><b>Deadline:</b></p>';
					html += '<input type="date" value="' + date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + (date.getDate() + 1)).slice(-2) + '"/>';
					html += '<textarea placeholder="Type comment"></textarea>'

					for(var s in tradeList){
						html += '<div class="trade-group">';
						html += '<p class="group-title"><b>' + s + '</b></p>';
						for (var i = 0; i < tradeList[s].length; i++) {
							html += '<label class="trade-label"><input type="checkbox" class="trade-item" />' + tradeList[s][i] + '</label></br>';
						}
						html += '</div>';
					}

					html += '</div>';

					html += '<a href="#" id="close-trade-list" class="btn btn-primary btn-sm">OK</a>';
					html += '<a href="#" id="other-data" class="btn btn-primary btn-sm">Submit other data request</a>';

					_this.infoWindow.setContent(html);
					_this.infoWindow.open(_this.map);

					$('#close-trade-list').on('click', function () {

						$('body').css('cursor', 'default');

						_this.infoWindow.close();
						_this.radiusToolWindow.close();
						_this.radiusToolCircle.setMap(null);
						$('[data-toggle="tooltip1"]').tooltip('destroy');

						return false;
					});


					$('#other-data').on('click', function () {

						$('#other-data').hide();

						var html = '<p><b>Describe your information request:</b></p>';
						html += '<textarea></textarea>';

						html += '<div class="form-group">';
						html += '<label>Photograph required:</label>';
						html += '<label class="radio-inline">';
						html += '<input type="radio" name="photo-required" value="yes">Yes';
						html += '</label>';
						html += '<label class="radio-inline">';
						html += '<input type="radio" name="photo-required" checked="checked" value="no">No';
						html += '</label>';
						html += '</div>';

						html += '<div class="form-group" id="last-form-group">';
						html += '<label>One time request:</label>';
						html += '<label class="radio-inline">';
						html += '<input type="radio" name="one-time" id="one-time" value="yes">Yes';
						html += '</label>';
						html += '<label class="radio-inline">';
						html += '<input type="radio" name="one-time" id="multipe-times" checked="checked" value="no">No';
						html += '</label>';
						html += '</div>';

						html += '<div class="form-group" id="duration">';
						html += '<label for="duration" class="">Duration:</label>';
						html += '<div class="">';
						html += '<input type="text" class="form-control">';
						html += '</div>';
						html += '</div>';

						html += '<div class="form-group" id="periodicity">';
						html += '<label for="periodicity" class="">Periodicity:</label>';
						html += '<div class="">';
						html += '<input type="text" class="form-control">';
						html += '</div>';
						html += '</div>';

						$('.trade-markup').empty().append(html);

						$('#one-time').on('click', function () {
							$('#duration').hide();
							$('#periodicity').hide();
							$('#last-form-group').css('margin-bottom', '165px');
						});

						$('#multipe-times').on('click', function () {
							$('#duration').show();
							$('#periodicity').show();
							$('#last-form-group').css('margin-bottom', '15px');
						});

						return false;
					});
				}

				drawingManager.setDrawingMode(null);
				_this.radiusToolCircle = circle;
				//_this.refreshData();
				_this.radiusToolWindow.setPosition(circle.getCenter());
				_this.radiusToolWindow.open(_this.map);

				var $radiusSpinner = $('#radius-spinner');
				// convert radius from meters to kilometers
				$radiusSpinner.val((circle.getRadius() / 1000).toFixed(2));
				// convert radius from kilometers to meters
				$radiusSpinner.on('change', function () {

					circle.setRadius($radiusSpinner.val() * 1000)
				});

				$('#goods-list').on('click', function () {

					tradeMarkup(circle.getCenter());

					return false;
				});

				google.maps.event.addListener(circle, 'center_changed', function () {

					//_this.refreshData();
					_this.radiusToolWindow.setPosition(circle.getCenter());
				});
				google.maps.event.addListener(circle, 'radius_changed', function () {

					//_this.refreshData();
					if ($radiusSpinner.val() * 1 != circle.getRadius() / 1000) {
						$radiusSpinner.val((circle.getRadius() / 1000).toFixed(2));
					}
				});
			});

			$radiusButton.on('click', function () {

				$radiusButton.toggleClass('active');
				if ($radiusButton.hasClass('active')) {
					$('body').css('cursor', 'crosshair');
					drawingManager.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);

					$('[data-toggle="tooltip1"]').tooltip('show');
				}
				else {
					$('body').css('cursor', 'default');
					drawingManager.setDrawingMode(null);
					if (_this.radiusToolCircle) {
						_this.radiusToolCircle.setMap(null);
						_this.radiusToolCircle = null;
						_this.radiusToolWindow.close();
					}

					$('[data-toggle="tooltip1"]').tooltip('destroy');
				}
			});
			//radius button: finish

			$('.slider').each(function () {
				var $slider = $(this);
				var $spinner = $($slider.data('spinner'));
				var $form = $slider.closest('form');
				var min = $slider.attr('min') * 1;
				var max = $slider.attr('max') * 1;
				var step = $slider.attr('step') * 1;
				var value = $slider.attr('value') * 1;

				$slider
                    .append('<div class="min">' + min + '</div>')
                    .append('<div class="max">' + max + '</div>')
                    .slider({
                    	range: "min",
                    	min: min,
                    	max: max,
                    	step: step,
                    	value: value,
                    	slide: function (event, ui) {
                    		$spinner.val(ui.value);
                    		$form.trigger('change');
                    	}
                    });

				$spinner
                    .attr({ min: min, max: max, step: step, value: value })
                    .on('change', function () {
                    	$slider.slider('value', $spinner.val());
                    });
			});

			function filterByStatus() {
				if (_this.markers) {
					/*var allStatuses = $overviewFilter.find('[name="Status"]').map(function() {
                        return $(this).val();
                    }).toArray();*/

					var checkedStatuses = $overviewFilter.find('[name="Status"]:checked').map(function () {
						return $(this).val();
					}).toArray();

					_this.markers.forEach(function (marker) {
						var statusIsSwitchedOn = checkedStatuses.indexOf(marker.get('Status')) >= 0;
						//var knownStatus = allStatuses.indexOf(marker.get('Status')) >= 0;
						if (statusIsSwitchedOn /*|| !knownStatus && checkedStatuses.indexOf('Under Construction') >= 0*/) {
							marker.setMap(_this.map);
						} else {
							marker.setMap(null);
						}
					});
				}
			}

			// Request dataset and show on the map
			var $overviewFilter = $('#overviewFilter')
                .on('change', function (event) {
                	clearTimeout(_this.filterTimeout);

                	var objectTypeIds = [];
                	var params = $overviewFilter.serializeArray();
                	for (var i = 0; i < params.length; i++) {
                		var param = params[i];
                		switch (param.name) {
                			case 'Layer':
                				if (!_this.hasGeoJson) {
                					_this.hasGeoJson = true;
                					_this.map.data.loadGeoJson('senegal.json');
                				}
                				_this.map.data.revertStyle();
                				_this.map.data.setStyle(function (feature) {
                					if (param.value === 'none') {
                						$("div#legend").hide();
                						return { visible: false };
                					} else {
                						$("div#legend").show();
                						return {
                							fillColor: RegionNameToColor[feature.getProperty('Name')][param.value],
                							strokeWeight: 1,
                							visible: true
                						};
                					}
                				});
                				break;

                			case 'PowerPlants':
                				if (param.value === '1') {
                					var $powerPlantsSelect = $overviewFilter.find('[name="PowerPlantsSelect"]');
                					var powerPlants = $powerPlantsSelect.selectpicker('val');

                					if (!Array.isArray(powerPlants)) {
                						powerPlants = $powerPlantsSelect
                                            .find('option[value]')
                                            .map(function () { return $(this).val() })
                                            .toArray();
                					}

                					powerPlants.forEach(function (typeName) {
                						typeName = typeName.trim();
                						if (typeName in TypeNameToId) {
                							objectTypeIds.push(TypeNameToId[typeName]);
                						}
                					});
                				}
                				break;

                			case 'Consumers':
                				if (typeof param.value === 'string' && param.value.length > 0) {
                					param.value.split(',').forEach(function (typeName) {
                						typeName = typeName.trim();
                						if (typeName in TypeNameToId) {
                							objectTypeIds.push(TypeNameToId[typeName]);
                						}
                					});
                				}
                				break;
                		}
                	}

                	if (objectTypeIds.length > 0) {
                		_this.filterTimeout = setTimeout(function () {
                			$overviewFilter.find('input').attr('disabled', 'disabled');

                			_this.getObjects(objectTypeIds).done(function (data) {
                				_this.addObjectsToMap(_this.map, data);

                				filterByStatus();

                				$overviewFilter.find('input').removeAttr('disabled');

                				if ($(document.body).hasClass('loading')) {
                					$(document.body).removeClass('loading');
                				}
                			});
                		}, 800);
                	} else {
                		_this.clearMarkers();
                		if ($(document.body).hasClass('loading')) {
                			$(document.body).removeClass('loading');
                		}
                	}
                });
			$overviewFilter.trigger('change');

			$(document).on('click', '.passport__close', function (event) {
				$(event.target).closest('.passport-popup').hide();
			});
		};

		var ChartColors = {
			Red: '#b00e0e',
			Blue: '#00bff3',
			Green: '#3cb00e',
			Pink: '#c724c9',
			Orange: '#f4950c',
			Turquoise: '#43c8ba'
		};

		Application.prototype.buildModelingChart = function (type, elementSelector, title, subtitle, colors, legend, yMin, yMax, tickInterval) {
			var categories = [2016, 2017, 2018, 2019, 2020];
			var series = [];
			for (var i = 0; i < colors.length; i++) {
				series.push({ data: [0, 0, 0, 0, 0], color: colors[i] });
			}
			return this.buildChart(elementSelector, type, title, subtitle, categories, series, legend, yMin, yMax, tickInterval);
		};

		Application.prototype.buildChart = function (elementSelector, type, title, subtitle, categories, series, legend, yMin, yMax, tickInterval) {
			$(elementSelector).highcharts({
				chart: { type: type },
				title: { text: title, align: 'left', x: 40, margin: 30, style: { fontFamily: '"Roboto", serif', fontSize: '21px', fontWeight: 'bold' } },
				subtitle: { text: subtitle, align: 'left', x: 40, y: 32, style: { fontFamily: '"Roboto", serif', fontSize: '14px', color: 'grey' } },
				xAxis: { categories: categories, tickWidth: 0, labels: { style: { fontFamily: '"Roboto", serif', fontSize: '12px' } } },
				yAxis: {
					min: yMin, max: yMax, title: null, gridLineWidth: 0, lineWidth: 1, tickInterval: tickInterval,
					labels: { formatter: function () { return this.value; }, style: { fontFamily: '"Roboto", serif', fontSize: '12px' } }
				},
				tooltip: {
					pointFormatter: function () {
						return '<span style="color:' + this.color + '">\u25CF</span> ' + this.series.name + ': <b>' + (Math.round(this.y * 10) / 10) + '</b>';
					}
				},
				plotOptions: { column: { pointPadding: 0.1, borderWidth: 0 } },
				series: series,
				legend: legend || { enabled: false },
				credits: { enabled: false }
			});

			return $(elementSelector).highcharts();
		};

		Application.prototype.clearMarkers = function (indicator) {
			if (Array.isArray(this.markers[indicator])) {
				this.markers[indicator].forEach(function (marker) {
					marker.setMap(null);
				});
				this.markers[indicator] = null;
			}

			if (this.markerClusters[indicator]) {
				this.markerClusters[indicator].clearMarkers();
				this.markerClusters[indicator] = null;
			}
		};

		Application.prototype.showPassport = function (name, typeName) { };

		Application.prototype.buildPassportCharts = function () { };

		Application.prototype.addObjectsToDataLayer = function (map, data, regionIndex, valueIndex) {

			//var colors = ["#d73027", "#fc8d59", "#fee08b", "#d9ef8b", "#91cf60", "#1a9850"];
			var colors = ["#1a9850", "#91cf60", "#d9ef8b", "#fee08b", "#fc8d59", "#d73027"];

			var rowCount = Math.floor(data.data.length / data.columns.length);

			var maxValue = -Infinity;
			var minValue = Infinity;
			var dataByRegion = {};
			this.realDataByRegion = {};
			for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
				var rowOffset = rowIndex * data.columns.length;

				var val = Math.log(data.data[rowOffset + valueIndex] * 1);
				//var val = data.data[rowOffset + valueIndex] * 1;
				var region = data.data[rowOffset + regionIndex];

				if(val < minValue)
					minValue = val
				if (val > maxValue)
					maxValue = val;

				dataByRegion[region] = val;
				this.realDataByRegion[region] = data.data[rowOffset + valueIndex] * 1;
			}

			var dataByColor = {};
			var partLength = (maxValue - minValue) / colors.length;
			for (var r in dataByRegion) {
				var colorIndex = Math.floor((dataByRegion[r] - minValue) / partLength);
				colorIndex = colorIndex == colors.length ? colorIndex - 1 : colorIndex;

				dataByColor[r] = colors[colorIndex];
			}

			map.data.setStyle(function (feature) {

				var featureId = feature.getProperty('id');

				for (r in dataByRegion) {
					if (featureId == r) {
						return {
							//title: dataByRegion[r],
							fillColor: dataByColor[r],
							fillOpacity: 0.8,
							strokeWeight: 1
						};
					}
				}
			});
		};

		Application.prototype.formatNumber = function (num, precision) {
			if (num == null) return '';
			precision = $.isNumeric(precision) ? precision : "";
			if (typeof num === 'string')
				num = parseFloat(num);
			var format = precision === "" ? null : ("n" + precision);
			return Globalize.format(num, format, undefined, precision);
		},

		Application.prototype.clickDataLayerListener = function (event) {

			if (this.infoWindow != null)
				this.infoWindow.close();

			var content = '';
			var indicator = null;
			if ($.inArray('ethnicities', this.indicators) != -1) {
				content = '<b>Family:&nbsp;</b>' + event.feature.getProperty('FAMILY') + '<br /><b>Ethnicity:&nbsp;</b>' + event.feature.getProperty('ETHNICITY');
			}
			else if ($.inArray('density', this.indicators) != -1) {
				var regionId = event.feature.getProperty('id');
				content = '<b>' + event.feature.getProperty('name') + '</b><br />' + this.realDataByRegion[regionId].toFixed(2);
			}
			else if ($.inArray('livelihood', this.indicators) != -1) {
				content = '<b>Livelihood zona:&nbsp;</b>' + event.feature.getProperty('LZNAME');
			}
			else if ($.inArray('fews', this.indicators) != -1) {
				content = '<b>Level:&nbsp;</b>' + event.feature.getProperty('level');
			}

			this.infoWindow = new google.maps.InfoWindow({
				content: content,
				position: event.latLng
			});

			this.infoWindow.open(this.map);
		};

		Application.prototype.latLngTransform = function (lat, lng, koef, latOffset, lngOffset, rnd, table, move) {
			var newCenter = { lat: 10.047800, lng: 11.133026 };
			var center = { lat: 8.870483, lng: 8.899170 };

			var latOffsetInt = lat - center.lat;
			var lngOffsetInt = lng - center.lng;

			koef = koef || 0.5;
			latOffset = latOffset || 0;
			lngOffset = lngOffset || 0;

			var tableOffset = table ? table[this.timeBarMonth * 1 - 1] : [0, 0];

			return new google.maps.LatLng(
				latOffsetInt * koef + newCenter.lat + latOffset + (move ? tableOffset[0] : 0),
				lngOffsetInt * koef + newCenter.lng + lngOffset + (move ? tableOffset[1] : 0)
			);
		};

		Application.prototype.addObjectsToMap = function (map, data, indicator, latIndex, lngIndex, clustering, circles, options) {

			function markerClickHandler(event) {
				self.infoWindow.setPosition(event.latLng);

				var tooltipData = this.get('tooltip');
				var data = tooltipData.data;
				var html = '';

				switch (tooltipData.indicator) {
					case 'farms':
						html += '<div class="map-tooltip farms">';

						html += '<p class="tooltip-header">' + data['Name'] + '</p>';

						html += '<div class="general-block">';

						var int = Math.floor((Math.random() * 5), 10) + 1;
						html += '<div class="img-block">';
						html += '<img src="img/farm' + int + '.jpg"/>';
						html += '</div>';

						html += '<div class="data-block">';
						html += '<div><label>Head of farm:&nbsp;</label>' + data['HeadName'] + '&nbsp;(<a href="http://6grain.com/api/farmSurvey/1090/image/farmer" target="_blank">photo</a>)</div>';
						html += '<div><label>Ethnicity:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Languages spoken:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Year of schooling:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Years farming current land:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Farm size:&nbsp;</label>' + data['FarmSize'] + '</div>';
						html += '</div>';

						html += '<div class="data-block">';
						html += '<div><label>Farm implements available:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Water source:&nbsp;</label>' + data['WaterSource'] + '</div>';
						html += '<div><label>Fertilizer per hectare (kg):&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Primary market/buyer:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Distance to nearest market:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Method of transport:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '</div>';

						html += '</div>';

						html += '<table>';
						html += '<thead>';
						html += '<tr>';
						html += '<th>Crop list</th>';
						html += '<th>Current yield</th>';
						html += '<th>Last season yield</th>';
						html += '</tr>';
						html += '</thead>';
						html += '<tbody>';
						html += '<td>' + data['Crop Name'] + '&nbsp;(<a href="http://6grain.com/api/farmSurvey/1083/image/crop/0" target="_blank">photo</a>)</td>';
						html += '<td>&nbsp</td>';
						html += '<td>&nbsp</td>';
						html += '</tr>';
						html += '</tbody>';
						html += '</table>';

						html += '</div>';
						break;

					case 'markets':
					case 'alcogol':
						var int = Math.floor((Math.random() * 3), 10) + 1;

						html += '<div class="map-tooltip markets">';

						html += '<p class="tooltip-header">' + '&nbsp' + '</p>';

						html += '<div class="img-block">';
						html += '<img src="img/market' + int + '.jpg"/>';
						html += '</div>';

						html += '<div class="data-block">';
						html += '<div><label>Market name:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Type of market:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div class="prices-block"><a href="http://knoema.com/xkfllfd/nigeria-local-food-prices" target="_blank">' + 'Prices >' + '</a></div>';
						html += '</div>';
						break;

					case 'churches':
						html += '<div class="map-tooltip churches">';

						html += '<p class="tooltip-header">' + data['Church Name'] + '</p>';

						html += '<div class="img-block">';
						html += '<img src="img/church.jpg"/>';
						html += '</div>';

						html += '<div class="data-block">';
						html += '<div><label>Name of pastor/minister/overseer:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Built on date:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Religious affiliation:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Capacity:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Amenities:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Holding services (Y/N):&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>External speaker system (Y/N):&nbsp;</label>' + '&nbsp' + '</div>';
						html += '</div>';
						break;

					case 'mosques':
						html += '<div class="map-tooltip mosques">';

						html += '<p class="tooltip-header">' + data['Mosque Name'] + '</p>';

						html += '<div class="img-block">';
						html += '<img src="img/mosque.jpg"/>';
						html += '</div>';

						html += '<div class="data-block">';
						html += '<div><label>Name of Imam:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Built on date:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Capacity (avg. headcount during prayer):&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Amenities (school, library, conference center, market):&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>External speaker system (Y/N):&nbsp;</label>' + '&nbsp' + '</div>';
						html += '</div>';
						break;

					case 'fatalities':
					case 'bocoharam':
						html += '<div class="map-tooltip bocoharam">';

						html += '<div><label>Event type:&nbsp;</label>' + data['EVENT_TYPE'] + '</div>';
						html += '<div><label>Interaction:&nbsp;</label>' + data['INTERACTION'] + '</div>';
						html += '<div><label>Fatalities:&nbsp;</label>' + data['FATALITIES'] + '</div>';
						html += '<div><label>Source:&nbsp;</label>' + data['SOURCE'] + '</div>';
						html += '<div>' + data['NOTES'] + '</div>';
						break;

					case 'schools':
						html += '<div class="map-tooltip schools">';

						html += '<p class="tooltip-header">' + data['School Name'] + '</p>';

						html += '<div class="img-block">';
						html += '<img src="img/school.jpg"/>';
						html += '</div>';

						var powerSource = 'None';
						if (data['Power Sources.Generator'] == 'TRUE') {
							powerSource = 'Generator';
						}
						else if (data['Power Sources.Grid'] == 'TRUE') {
							powerSource = 'Grid';
						}
						else if (data['Power Sources.Solar System'] == 'TRUE') {
							powerSource = 'Solar';
						}

						html += '<div class="data-block">';
						html += '<div><label>Year build:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Type of school:&nbsp;</label>' + data['Education Type'] + '</div>';
						html += '<div><label>Public or private:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Number of teachers:&nbsp;</label>' + data['Number of Teachers, Total'] + '</div>';
						html += '<div><label>Power source:&nbsp;</label>' + powerSource + '</div>';
						html += '</div>';
						break;

					case 'hospital':
						html += '<div class="map-tooltip hospital">';

						html += '<p class="tooltip-header">' + data['Facility Name'] + '</p>';

						html += '<div class="img-block">';
						html += '<img src="img/hospital.jpg"/>';
						html += '</div>';

						html += '<div class="data-block">';
						html += '<div><label>Built on date:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Accreditations, Affiliations:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Service departments:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Number of beds:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Pharmacy onsite (Y/N):&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Power source:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '</div>';
						break;

					case 'buildings':
						html += '<div class="map-tooltip buildings">';

						html += '<p>' + data['Governemnt office'] + '</p>';
						html += '<div><label>Address:&nbsp;</label>' + data['Address'] + '</div>';
						break;

					case 'refineries':
						html += '<div class="map-tooltip refineries">';

						html += '<p class="tooltip-header">' + '&nbsp' + '</p>';

						html += '<div class="img-block">';
						html += '<img src="img/oil_refinery.jpg"/>';
						html += '</div>';
						
						html += '<div class="data-block">';
						html += '<div><label>Built on date:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Dates of expansions, upgrades:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Installed capacity (b/d):&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Operating capacity (b/d):&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Operator (company name):&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Owners:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Feedstock:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Petroleum product yield (share by type):&nbsp;</label>' + '&nbsp' + '</div>';
						html += '</div>';

						break;

					case 'cities':
						html += '<div class="map-tooltip refineries">';

						html += '<div><label>Name:&nbsp;</label>' + data['Local Government Areas'] + '</div>';
						html += '<div><label>State:&nbsp;</label>' + data['States'] + '</div>';
						html += '<div><label>Latitude:&nbsp;</label>' + data['Latitude'] + '</div>';
						html += '<div><label>Longitude:&nbsp;</label>' + data['Longitude'] + '</div>';
						html += '<div><label>Population (2006):&nbsp;</label>' + data['Population (2006)'] + '</div>';
						html += '<div><label>Area (sq. km):&nbsp;</label>' + data['Area (sq. km)'] + '</div>';
						html += '<div><label>Population density (People per sq. km):&nbsp;</label>' + data['Population density (People per sq. km)'] + '</div>';
						html += '<div><label>Primary health clinics:&nbsp;</label>' + data['Primary health clinics'] + '</div>';
						html += '<div><label>Total number of schools:&nbsp;</label>' + data['Total number of schools'] + '</div>';

						break;

					case 'refugee':
						html += '<div class="map-tooltip refugee">';

						html += '<p class="tooltip-header">' + data['Name of Location'] + '</p>';

						html += '<div class="data-block">';
						html += '<div><label>Survey date:&nbsp;</label>' + data['1.1.a.1 Survey date (DD.MM.YYYY)'] + '</div>';
						html += '<div><label>Camp size (square meters):&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Camp capacity (individuals, planned and actual):&nbsp;</label>' + '&nbsp' + '</div>';
						html += '<div><label>Organization managing site:&nbsp;</label>' + data['1.2.d Type of organization managing the site'] + '</div>';
						html += '<div><label>Site opening date:&nbsp;</label>' + data['1.4.a Site start/open date'] + '</div>';
						html += '<div><label>Access to food (Y/N):&nbsp;</label>' + data['5.1.a Is there access to food (distribution, trade, fishing…)'] + '</div>';
						html += '<div><label>Water available per day, per person (liters):&nbsp;</label>' + data['4.2.a Average amount of water available per day and per person'] + '</div>';
						html += '<div><label>Security onsite (Y/N):&nbsp;</label>' + data['10.1.a Is there security on-site/settlement areas'] + '</div>';
						html += '<div><label>Security provider:&nbsp;</label>' + data['10.1.b Who provides main security in the site'] + '</div>';
						html += '</div>';

						break;

					case 'displaced-persons-all':
					case 'displaced-persons-conflict':
					case 'displaced-persons-natural':
						html += '<div class="map-tooltip refugee">';

						html += '<p class="tooltip-header">' + data['Ward Name'] + '</p>';

						html += '<div class="data-block">';
						html += '<div><label>Number of individuals:&nbsp;</label>' + data['Estimated number of individuals by Ward'] + '</div>';
						html += '<div><label>Number of families:&nbsp;</label>' + data['Estimated number of households by Ward'] + '</div>';
						html += '<div><label>State of origin of majority:&nbsp;</label>' + data['State of origin of majority'] + '</div>';
						html += '<div><label>Displaced by insurgency (Y/N):&nbsp;</label>' + ((data['Reason of displacement Insurgency_Yes or No'] == 'Yes' || data['Reason of displacement Commnunity clash_Yes or No'] == 'Yes') ? 'Yes' : 'No') + '</div>';
						html += '<div><label>Displaced by natural disaster (Y/N):&nbsp;</label>' + (data['Reason of displacement Natural disasters_Yes or No'] != 'No' ? 'Yes' : 'No') + '</div>';
						html += '<div><label>Expected crop conditions during next six months in State of Origin:&nbsp;</label>' + '&nbsp' + '</div>';
						html += '</div>';

						break;

					default:
						html += '<div class="map-tooltip">';

						for (var i in data)
							html += self.buildTooltipMarkup(i + (data[i] == null ? '' : ':'), data[i]);
						break;
				}

				//if (tooltipData.indicator != 'farms')
				html += '<div style="margin-top: 5px;">Source: <a href="http://knoema.com/' + self.datasets[tooltipData.indicator] + '" target="_blank">Knoema.com</a></div>'
				html += '</div>';

				self.infoWindow.setContent(html);
				self.infoWindow.open(self.map);
			}

			var options = options || {};

			var self = this;
			var rowCount = Math.floor(data.data.length / data.columns.length);
			var markers = [];
			var heatmapArray = [];

			this.clearMarkers(indicator);

			// hack - need to passe data into [data-target="more-data"] click handler
			if (!window.AppMapData)
				window.AppMapData = {};
			window.AppMapData[indicator] = data;

			var postponedMarkers = [];

			var visibleColumnCount = data.columns.length < 15 ? data.columns.length : 15;
			for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
				var rowOffset = rowIndex * data.columns.length;

				var lat = data.data[rowOffset + latIndex] * 1;
				var lng = data.data[rowOffset + lngIndex] * 1;

				if (!isFinite(lat) || !isFinite(lng) || (lat === 0 && lng === 0)) {
					continue;
				}

				var markerIconName = indicator;
				if (options.partData && self.showDataTable[indicator]) {
					var showDataKoeff = self.showDataTable[indicator][self.timeBarMonth * 1 - 1];


					if (rowIndex / rowCount >= showDataKoeff) {
						markerIconName = 'markets';
					}
				}

				if (options.filterByDate) {
					var month = (new Date(data.data[rowOffset + options.dateIndex].value)).getMonth() + 1;

					if (self.timeBarMonth != month) {
						continue;
					}
				}

				if (options.displaced) {
					switch (options.displacedType) {
						case 'all':
							break;
						case 'conflict':
							if (data.data[rowOffset + 13] == 'Yes' || data.data[rowOffset + 16] == 'Yes') {
							}
							else {
								continue;
							}
							break;
						case 'natural':
							if (data.data[rowOffset + 19] == 'No') {
								continue;
							}
							else {
								
							}
							break;
					}
				}

				var move = true;
				if (options.dontMoveEach) {
					move = (rowIndex + 1) % options.dontMoveEach != 0;
				}

				var latLng = options.latlngTransform ?
					self.latLngTransform(lat, lng, options.transformKoef, options.latOffset, options.lngOffset, options.rnd, options.offsetTable ? this.koeffTable[indicator] : null, move) :
					new google.maps.LatLng(lat, lng);
				heatmapArray.push(latLng);

				// tooltip text

				var tooltip = {};

				for (var j = 0; j < data.columns.length; j++) {

					var dataIndex = rowOffset + j;

					var value = null;

					if (data.columns[j].type === 'Date' && data.data[dataIndex]) {
						tooltip['Time'] = data.data[dataIndex].value;
					}
					else
						value = data.data[dataIndex];

					if (value != null && value != '')
						tooltip[data.columns[j].name] = value;
				}

				var tooltipData = {
					indicator: indicator,
					data: tooltip
				};
				// end tooltip

				//if (indicator == 'farms') {
				//	console.log('{ "FarmID":"' + data.data[rowOffset + 0] + '", "Latitude": "' + latLng.lat().toFixed(6) + '", "Longitude": "' + latLng.lng().toFixed(6) + '", "Name": "' + data.data[rowOffset + 3] + '" },');
				//}
				var postpone = false;

				if (circles) {
					var val = data.data[rowOffset + options.valueIndex] * 1;

					if (!options.wovalue && val == 0)
						continue;

					var strokeColor = options.strokeColor || '#FF0000';
					var fillColor = options.fillColor || '#FF0000';

					
					if (indicator == 'farms') {
						if (data.data[rowOffset + 3] == '1' && self.timeBarMonth == '10') {

							postpone = true;
							strokeColor = '#000';
							fillColor = '#f24040';
						}
					}

					var radius = options.size ? options.size : 3000 * (options.dontLog ? val : Math.log(val)) * (options.norm ? options.norm : 1);
					if (!postpone) {
						var marker = new google.maps.Circle({
							strokeColor: strokeColor,
							strokeOpacity: 0.8,
							strokeWeight: 1,
							fillColor: fillColor,
							fillOpacity: 0.8,
							map: map,
							center: latLng,
							radius: radius
						});

						marker.set('tooltip', tooltipData);
						marker.addListener('click', markerClickHandler);
					}
					else {
						postponedMarkers.push({
							strokeColor: strokeColor,
							fillColor: fillColor,
							latLng: latLng,
							radius: radius,
							tooltipData: tooltipData,
							markerClickHandler: markerClickHandler
						});
					}
				}
				else {
					if (options.priceIndex > 0) {
						//var marker = new google.maps.Marker();
						var marker = new MarkerWithLabel({
							position: latLng,
							map: map,
							labelContent:  self.formatNumber(data.data[rowOffset + options.priceIndex], 2).replace('.00', ''),
							labelAnchor: new google.maps.Point(0, 20),
							labelClass: "labels", // the CSS class for the label
							labelStyle: { opacity: 0.9 }
						});
					}
					else {
						var marker = new google.maps.Marker({
							position: latLng,
							map: map,
							//labelContent: "$425K",
							//labelAnchor: new google.maps.Point(0, 20),
							//labelClass: "labels", // the CSS class for the label
							//labelStyle: { opacity: 0.75 }
						});
					}

					if (options.alcoIndex > 0) {
						var alco = data.data[rowOffset + options.alcoIndex] * 1;
						if (alco == 0) {
							markerIconName = 'markets';
						}
						else if (alco == 1) {
							markerIconName = 'alcogol';
						}
					}

					marker.setIcon('img/icons_' + markerIconName + '.png');

					marker.set('tooltip', tooltipData);
					marker.addListener('click', markerClickHandler);
				}

				//google.maps.event.addListener(marker, 'click', this.showPassport.bind(this, data.data[rowOffset + 1], data.data[rowOffset]));

				if (!postpone)
					markers.push(marker);
			}

			for (var i = 0; i < postponedMarkers.length; i++) {

				var m = postponedMarkers[i];
				var marker = new google.maps.Circle({
					strokeColor: m.strokeColor,
					strokeOpacity: 0.8,
					strokeWeight: 1,
					fillColor: m.fillColor,
					fillOpacity: 0.8,
					map: map,
					center: m.latLng,
					radius: m.radius,
					zIndex: 1
				});

				marker.set('tooltip', m.tooltipData);
				marker.addListener('click', m.markerClickHandler);

				markers.push(marker);
			}

			if (!this.markers)
				this.markers = {};

			this.markers[indicator] = markers;

			if (!self.markerClusters)
				self.markerClusters = {};

			if (clustering) {
				if (!self.markerClusters[indicator]) {
					// http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/docs/reference.html
					self.markerClusters[indicator] = new window['MarkerClusterer'](map, markers, {
						ignoreHidden: true,
						styles: [
							{
								url: 'img/icons_' + markerIconName + '.png',
								width: 40,
								height: 40,
								textSize: 18,
								textColor: '#ffffff'
							}]
					});
				}
			}
		};

		Application.prototype.isUrl = function (value) {
			return /https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,}/.test(value);
		}

		Application.prototype.buildTooltipMarkup = function (label, value) {

			if (value != null)
				value = this.isUrl(value) ? ('<a target="_blank" href="' + value + '">' + value + '</a>') : value;

			return '<div><label>' + label + '</label>' + (value == null ? '' : value) + '</div>';
		};

		Application.prototype.getObjects = function (objectTypeIds) {
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=pocqwkd';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "object-type",
					"Members": objectTypeIds,
					"DimensionName": "Object Type",
					"DatasetId": "pocqwkd",
					"Order": "0"
				}, {
					"DimensionId": "object-name",
					"Members": ["1000000", "1000010", "1000020", "1000030", "1000040", "1000050", "1000060", "1000070", "1000080", "1000090", "1000100", "1000110", "1000120", "1000130", "1000140", "1000150", "1000160", "1000170", "1000180", "1000190", "1000200", "1000210", "1000220", "1000230", "1000240", "1000250", "1000260", "1000270", "1000280", "1000290", "1000300", "1000310", "1000320", "1000330", "1000340", "1000350", "1000360", "1000370", "1000380", "1000390", "1000400", "1000410", "1000420", "1000430", "1000440", "1000450", "1000460", "1000470", "1000480", "1000490", "1000500", "1000510", "1000520", "1000530", "1000540", "1000550", "1000560", "1000570", "1000580", "1000590", "1000600", "1000610", "1000620", "1000630", "1000640", "1000650", "1000660", "1000670", "1000680", "1000690", "1000700", "1000710", "1000720", "1000730", "1000740", "1000750", "1000760", "1000770", "1000780", "1000790", "1000800", "1000810", "1000820", "1000830", "1000840", "1000850", "1000860", "1000870", "1000880", "1000890", "1000900", "1000910", "1000920", "1000930", "1000940", "1000950", "1000960", "1000970", "1000980", "1000990", "1001000", "1001010", "1001020", "1001030", "1001040", "1001050", "1001060", "1001070", "1001080", "1001090", "1001100", "1001110", "1001120", "1001130", "1001140", "1001150", "1001160", "1001170", "1001180", "1001190", "1001200", "1001210", "1001220", "1001230", "1001240", "1001250", "1001260", "1001270", "1001280", "1001290", "1001300", "1001310", "1001320", "1001330", "1001340", "1001350", "1001360", "1001370", "1001380", "1001390", "1001400", "1001410", "1001420", "1001430", "1001440", "1001450", "1001460", "1001470", "1001480", "1001490", "1001500", "1001510", "1001520", "1001530", "1001540", "1001550", "1001560", "1001570", "1001580", "1001590", "1001600", "1001610", "1001620", "1001630", "1001640", "1001650", "1001660", "1001670", "1001680", "1001690", "1001700", "1001710", "1001720", "1001730", "1001740", "1001750", "1001760", "1001770", "1001780", "1001790", "1001800", "1001810", "1001820", "1001830", "1001840", "1001850", "1001860", "1001870", "1001880", "1001890", "1001900", "1001910", "1001920", "1001930", "1001940", "1001950", "1001960", "1001970", "1001980", "1001990", "1002000", "1002010", "1002020", "1002030", "1002040", "1002050", "1002060", "1002070", "1002080", "1002090", "1002100", "1002110", "1002120", "1002130", "1002140", "1002150", "1002160", "1002170", "1002180", "1002190", "1002200", "1002210", "1002220", "1002230", "1002240", "1002250", "1002260", "1002270", "1002280", "1002290", "1002300", "1002310", "1002320", "1002330", "1002340", "1002350", "1002360", "1002370", "1002380", "1002390", "1002400", "1002410", "1002420", "1002430", "1002440", "1002450", "1002460", "1002470", "1002480", "1002490", "1002500", "1002510", "1002520", "1002530", "1002540", "1002550", "1002560", "1002570", "1002580", "1002590", "1002600", "1002610", "1002620", "1002630", "1002640", "1002650", "1002660", "1002670", "1002680", "1002690", "1002700", "1002710", "1002720", "1002730", "1002740", "1002750", "1002760", "1002770", "1002780", "1002790", "1002800", "1002810", "1002820", "1002830", "1002840", "1002850", "1002860", "1002870", "1002880", "1002890", "1002900", "1002910", "1002920", "1002930", "1002940", "1002950", "1002960", "1002970", "1002980", "1002990", "1003000", "1003010", "1003020", "1003030", "1003040", "1003050", "1003060", "1003070", "1003080", "1003090", "1003100", "1003110", "1003120", "1003130", "1003140", "1003150", "1003160", "1003170", "1003180", "1003190", "1003200", "1003210", "1003220", "1003230", "1003240", "1003250", "1003260", "1003270", "1003280", "1003290", "1003300", "1003310", "1003320", "1003330", "1003340", "1003350", "1003360", "1003370", "1003380", "1003390", "1003400", "1003410", "1003420", "1003430", "1003440", "1003450", "1003460", "1003470", "1003480", "1003490", "1003500", "1003510", "1003520", "1003530", "1003540", "1003550", "1003560", "1003570", "1003580", "1003590", "1003600", "1003610", "1003620", "1003630", "1003640", "1003650", "1003660", "1003670", "1003680", "1003690", "1003700", "1003710", "1003720", "1003730", "1003740", "1003750", "1003760", "1003770", "1003780", "1003790", "1003800", "1003810", "1003820", "1003830", "1003840", "1003850", "1003860", "1003870", "1003880", "1003890", "1003900", "1003910", "1003920", "1003930", "1003940", "1003950", "1003960", "1003970", "1003980", "1003990", "1004000", "1004010", "1004020", "1004030", "1004040", "1004050", "1004060", "1004070", "1004080", "1004090", "1004100", "1004110", "1004120", "1004130", "1004140", "1004150", "1004160", "1004170", "1004180", "1004190", "1004200", "1004210", "1004220", "1004230", "1004240", "1004250", "1004260", "1004270", "1004280", "1004290", "1004300", "1004310", "1004320", "1004330", "1004340", "1004350", "1004360", "1004370", "1004380", "1004390", "1004400", "1004410", "1004420", "1004430", "1004440", "1004450", "1004460", "1004470", "1004480", "1004490", "1004500", "1004510", "1004520", "1004530", "1004540", "1004550", "1004560", "1004570", "1004580", "1004590", "1004600", "1004610", "1004620", "1004630", "1004640", "1004650", "1004660", "1004670", "1004680", "1004690", "1004700", "1004710", "1004720", "1004730", "1004740", "1004750", "1004760", "1004770", "1004780", "1004790", "1004800", "1004820", "1004830", "1004840", "1004850", "1004860", "1004870", "1004880", "1004890", "1004900", "1004910", "1004920", "1004930", "1004940", "1004950", "1004960", "1004970", "1004980", "1004990", "1005000", "1005010", "1005020", "1005030", "1005040", "1005050", "1005060", "1005070", "1005080", "1005090", "1005100", "1005110", "1005120", "1005130", "1005140", "1005150", "1005160", "1005170", "1005180", "1005190", "1005200", "1005210", "1005220", "1005230", "1005240", "1005250", "1005260", "1005270", "1005280", "1005290", "1005300", "1005310", "1005320", "1005330", "1005340", "1005350", "1005360", "1005370", "1005380", "1005390", "1005400", "1005410", "1005420", "1005430", "1005440", "1005450", "1005460", "1005470", "1005480", "1005490", "1005500", "1005510", "1005520", "1005530", "1005540", "1005550", "1005560", "1005570", "1005580", "1005590", "1005600", "1005610", "1005620", "1005630", "1005640", "1005650", "1005660", "1005670", "1005680", "1005690", "1005700", "1005710", "1005720", "1005730", "1005740", "1005750", "1005760", "1005770", "1005780", "1005790"],
					"DimensionName": "Object Name",
					"DatasetId": "pocqwkd",
					"Order": "1",
					"isGeo": true
				}],
				"Frequencies": [],
				"Dataset": "pocqwkd",
				"Segments": null,
				"MeasureAggregations": null
			};

			return $.post(url, data);
		};

		Application.prototype.getHospitals = function () {
			this.datasets['hospital'] = 'pgahpq';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=pgahpq';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "facility-type",
					"Members": ['1000000', '1000010']
				}],
				"Frequencies": [],
				"Dataset": "pgahpq"
			};

			return $.post(url, data);
		};

		Application.prototype.getSchools = function () {
			this.datasets['schools'] = 'smuydcd';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=smuydcd';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "education-type",
					"Members": ['1000000', '1000010', '1000020']
				}],
				"Frequencies": [],
				"Dataset": "smuydcd"
			};

			return $.post(url, data);
		};

		Application.prototype.getPlatforms = function () {
			this.datasets['platfomrs'] = 'sgcltvg';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=sgcltvg';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "measure",
					"Members": ['4360750']
				}],
				"Frequencies": [],
				"Dataset": "sgcltvg"
			};

			return $.post(url, data);
		};

		Application.prototype.getRefineries = function () {
			this.datasets['refineries'] = 'hwatisg';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=hwatisg';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "measure",
					"Members": ['4410830']
				}],
				"Frequencies": [],
				"Dataset": "hwatisg"
			};

			return $.post(url, data);
		};

		Application.prototype.getPowerStations = function () {
			this.datasets['power'] = 'lxnptag';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=lxnptag';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "type",
					"Members": ['1000000', '1000010', '1000020']
				}],
				"Frequencies": [],
				"Dataset": "lxnptag"
			};

			return $.post(url, data);
		};

		Application.prototype.getRefugee = function () {
			this.datasets['refugee'] = 'vumwlgc';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=vumwlgc';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "adm1-name",
					"Members": ['1000000', '1000010']
				}],
				"Frequencies": [],
				"Dataset": "vumwlgc"
			};

			return $.post(url, data);
		};

		Application.prototype.getDisplacedPersons = function () {
			this.datasets['displaced-persons-all'] = 'vumgwf';
			this.datasets['displaced-persons-conflict'] = 'vumgwf';
			this.datasets['displaced-persons-natural'] = 'vumgwf';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=vumgwf';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "measure",
					"Members": ['4367690']
				}],
				"Frequencies": [],
				"Dataset": "vumgwf"
			};

			return $.post(url, data);
		};

		Application.prototype.getReportedFatalities = function () {
			this.datasets['fatalities'] = 'pehclt';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=pehclt';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "country",
					"Members": '1000330'
				}],
				"Frequencies": [],
				"Dataset": "pehclt"
			};

			return $.post(url, data);
		};

		Application.prototype.getBokoHaram = function () {
			this.datasets['bocoharam'] = 'pehclt';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=pehclt';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "country",
					"Members": ['1000330']
				}, {
					"DimensionId": "actor1",
					"Members": ['1000780']
				}],
				"Frequencies": [],
				"Dataset": "pehclt"
			};

			return $.post(url, data);
		};

		Application.prototype.getPopulationDensity = function () {
			this.datasets['density'] = 'xybvkwg';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=xybvkwg';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "measure",
					"Members": ['1165580']
				}],
				"Frequencies": [],
				"Dataset": "xybvkwg"
			};

			return $.post(url, data);
		};

		Application.prototype.getFarms = function () {
			//this.datasets['farms'] = 'efdgaef';
			//var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=efdgaef';
			//var data = {
			//	"Header": [],
			//	"Stub": [],
			//	"Filter": [{
			//		"DimensionId": "sex",
			//		"Members": ['1000000', '1000010']
			//	}],
			//	"Frequencies": [],
			//	"Dataset": "efdgaef"
			//};

			//this.datasets['farms'] = 'qfwpqtc';
			//var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=qfwpqtc';
			//var data = {
			//	"Header": [],
			//	"Stub": [],
			//	"Filter": [{
			//		"DimensionId": "measure",
			//		"Members": ['4404480']
			//	}],
			//	"Frequencies": [],
			//	"Dataset": "qfwpqtc"
			//};

			this.datasets['farms'] = 'qudnhcf';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=qudnhcf';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "measure",
					"Members": ['4427060']
				}],
				"Frequencies": [],
				"Dataset": "qudnhcf"
			};

			return $.post(url, data);
		};

		Application.prototype.getChurches = function () {
			this.datasets['churches'] = 'rqzrlge';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=rqzrlge';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "state",
					"Members": ['1000000', '1000010', '1000020', '1000030', '1000040', '1000050', '1000060', '1000070', '1000080', '1000090', '1000100', '1000110', '1000120', '1000130', '1000140', '1000150', '1000160', '1000170', '1000180', '1000190', '1000200', '1000210', '1000220', '1000230', '1000240']
				}],
				"Frequencies": [],
				"Dataset": "rqzrlge"
			};

			return $.post(url, data);
		};

		Application.prototype.getMosques = function () {
			this.datasets['churches'] = 'pmefixb';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=pmefixb';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "states",
					"Members": ['1000000', '1000010', '1000020', '1000030', '1000040', '1000050']
				}],
				"Frequencies": [],
				"Dataset": "pmefixb"
			};

			return $.post(url, data);
		};

		Application.prototype.getBuildings = function () {
			this.datasets['buildings'] = 'vuadgsf';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=vuadgsf';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "state",
					"Members": ['1000220', '1000230', '1000240', '1000250', '1000260', '1000270', '1000280', '1000290', '1000300', '1000310', '1000320', '1000330', '1000340', '1000350', '1000360', '1000370', '1000380', '1000390', '1000400', '1000410']
				}],
				"Frequencies": [],
				"Dataset": "vuadgsf"
			};

			return $.post(url, data);
		};

		Application.prototype.getMarkets = function () {
			//this.datasets['markets'] = 'pwsivdf';
			//var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=pwsivdf';
			//var data = {
			//	"Header": [],
			//	"Stub": [],
			//	"Filter": [{
			//		"DimensionId": "measure",
			//		"Members": ['4368070']
			//	}],
			//	"Frequencies": [],
			//	"Dataset": "pwsivdf"
			//};

			this.datasets['markets'] = 'tybnkwd';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=tybnkwd';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "measure",
					"Members": ['4473720']
				}],
				"Frequencies": [],
				"Dataset": "tybnkwd"
			};

			return $.post(url, data);
		};

		Application.prototype.getAlcogol = function () {
			this.datasets['alcogol'] = 'jbcluv';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=jbcluv';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "measure",
					"Members": ['4381050']
				}],
				"Frequencies": [],
				"Dataset": "jbcluv"
			};

			return $.post(url, data);
		};

		Application.prototype.getCities = function () {
			this.datasets['cities'] = 'btsaiid';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=btsaiid';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "measure",
					"Members": ['4396420']
				}],
				"Frequencies": [],
				"Dataset": "btsaiid"
			};

			return $.post(url, data);
		};

		Application.prototype.getRailStations = function () {
			this.datasets['railroad'] = 'rghyjzb';
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=rghyjzb';
			var data = {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "station-name",
					"Members": ['1000000', '1000010', '1000020', '1000030', '1000040', '1000050', '1000060', '1000070', '1000080', '1000090', '1000100', '1000110', '1000120', '1000130', '1000140', '1000150', '1000160', '1000170', '1000180', '1000190', '1000200', '1000210', '1000220', '1000230', '1000240', '1000250', '1000260', '1000270', '1000280', '1000290', '1000300', '1000310', '1000320', '1000330', '1000340', '1000350', '1000360', '1000370', '1000370', '1000380', '1000390', '1000400', '1000410', '1000420', '1000430', '1000440', '1000450', '1000460', '1000470', '1000480']
				}],
				"Frequencies": [],
				"Dataset": "rghyjzb"
			};

			return $.post(url, data);
		};

		return Application;
	})();

	google.maps.event.addDomListener(window, 'load', function () {
		var greeter = new Application();
		greeter.run();
		greeter.run2();
	});
})(Infrastructure || (Infrastructure = {}));
//# sourceMappingURL=app.js.map
