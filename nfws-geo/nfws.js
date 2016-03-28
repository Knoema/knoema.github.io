/// <reference path="typings/jquery.d.ts"/>
/// <reference path="typings/google.maps.d.ts"/>

(function () {

	var TypeNameToId = {};

	var RegionNameToColor = {};

	var Application = (function () {

		function Application() {

			this.indicators = {};
			this.map = null;
			this.drawingManager = null;
			this.date = null;
			this.markers = [];
		}

		Application.prototype.run = function () {

			var self = this;

			this.initMap(function () {
				$(document.body).removeClass('loading');
				self.bubblesLayer = new Knoema.GeoPlayground.BubblesLayer(self.map);
				$('input[value=rain2]').parent().parent().trigger('click');
			});


			this.bindEvents();
			this.initTooltips();
			this.showTopic('water');
			
			this.getMarkets().done(function (data) {
				for (var i = 3; i < 15; i++)
					$('#products').append($('<option>', { text: data.columns[i].name, value: i }));			
			});
		};

		Application.prototype.initMap = function (callback) {

			var self = this;

			this.infoWindow = new google.maps.InfoWindow();

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

			google.maps.event.addListenerOnce(this.map, 'idle', function () {
				var idleTimeout = window.setTimeout(function () {
					callback();
				}, 300);
			});

			this.initRadiusControl();
		};

		Application.prototype.uncheck = function (indicator) {
			$('input[value=' + indicator + ']').removeAttr('checked');
			$('input[value=' + indicator + ']').parent().find('.custom-checkbox').removeClass('checked');
		};

		Application.prototype.check = function (indicator) {
			$('input[value=' + indicator + ']').attr('checked');
			$('input[value=' + indicator + ']').parent().find('.custom-checkbox').addClass('checked');
		};

		Application.prototype.checked = function (indicator) {
			return $('input[value=' + indicator + ']').parent().find('.custom-checkbox').hasClass('checked');
		};

		Application.prototype.bindEvents = function () {

			var self = this;

			$('.sidebar-topic').on('click', function () {
				self.showTopic($(this).data('topic-id'));
			});

			$('.main-menu a').click(function () {
				window.location = $(this).attr('href');
			})

			$('.topic-content li').on('click', function () {

				var container = $(this).find('.custom-checkbox');
				var checkbox = $(this).find('input');
				var indicator = checkbox.val();

				if (!indicator)
					return;

				if (container.hasClass('checked')) {
					
					// uncheck

					container.removeClass('checked');
					checkbox.removeAttr('checked');
										
					switch (indicator) {
						case 'displaced-persons':
							self.uncheck('displaced-persons-conflict');
							self.uncheck('displaced-persons-natural');
							self.cleanIndicator('displaced-persons');
							break;
						case 'displaced-persons-conflict':	
						case 'displaced-persons-natural':
							
							self.cleanIndicator('displaced-persons');
					
							if (!self.checked(indicator == 'displaced-persons-conflict' ? 'displaced-persons-natural' : 'displaced-persons-conflict')) {
								self.uncheck('displaced-persons');
							}
							else
								self.loadIndicator('displaced-persons');
							
							break;
						case 'markets':
							self.uncheck('alcohol');
							self.cleanIndicator('markets');
							break;
						case 'alcohol':
							self.loadIndicator('markets');
							break;
						default:
							self.cleanIndicator(indicator);
							break;
					}

				}
				else {

					switch (indicator) {
						case 'displaced-persons':
							self.check('displaced-persons-conflict');
							self.check('displaced-persons-natural')
							break;
						case 'displaced-persons-conflict':
						case 'displaced-persons-natural':
							indicator = 'displaced-persons';
							self.check('displaced-persons');
							break;
						case 'alcohol':
							indicator = 'markets';
							self.check('markets');
							break;
					}

					var singleLayers = ['rain2', 'density', 'ethnicities', 'livelihood', 'road', 'railroad', 'fews'];

					if ($.inArray(indicator, singleLayers) > -1) {

						for (var i = 0; i < singleLayers.length; i++) {

							var id = singleLayers[i];

							self.cleanIndicator(id);

							$('input[value=' + id + ']').parent().find('.custom-checkbox').removeClass('checked');
						}
					}

					container.addClass('checked');
					checkbox.attr('checked');

					self.loadIndicator(indicator);
				}

				return false;
			});

			$('#calendar .item').on('click', function () {

				$('.item').removeClass('active');
				$(this).addClass('active');

				self.date = Globalize.format(new Date('2015.' + $(this).data('month')), 'yyyy MMM');

				if (self.indicators['bocoharam'])
					self.loadIndicator('bocoharam');

				if (self.indicators['fatalities'])
					self.loadIndicator('fatalities');

				if (self.indicators['farms'])
					self.loadIndicator('farms');

			});

			$('#clear-all-filters').on('click', function () {

				self.hideLegend();

				for (var key in self.indicators)
					$('input[value=' + key + ']').parent().parent().trigger('click');

				self.indicators = {};

				return false;
			});

			$('#products').on('change', function () {
				self.cleanIndicator('markets');
				self.loadIndicator('markets');
				self.check('markets');
			});

			$('#radius-button').on('click', function () {

				$(this).toggleClass('active');

				if ($(this).hasClass('active')) {

					$('body').css('cursor', 'crosshair');
					self.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);

					$('[data-toggle="tooltip1"]').tooltip('show');
				}
				else {
					$('body').css('cursor', 'default');

					self.drawingManager.setDrawingMode(null);

					if (self.radiusToolCircle) {
						self.radiusToolCircle.setMap(null);
						self.radiusToolCircle = null;
						self.radiusToolWindow.close();
					}

					$('[data-toggle="tooltip1"]').tooltip('destroy');
				}
			});
		};
		
		Application.prototype.initTooltips = function () {
			$('[data-toggle="tooltip"]').tooltip({ placement: 'bottom' });
			$('[data-toggle="tooltip-lh"]').tooltip();
			$('[data-toggle="tooltip3"]').tooltip({
				title: 'To view similar indicators, click <a href="http://knoema.com/atlas/topics/Demographics" target="blank">here</a>',
				html: true,
				delay: { "show": 0, "hide": 1000 }
			});
		}

		Application.prototype.getLayers = function (indicator) {

			var layers = {
				'road': '945aa606-5a96-c6ee-4a67-acf8656c0bfe',
				'railroad': ['5f592909-8c82-232b-21eb-1ea6ed7b86e4', 'bf92de93-bb79-4a07-7563-9151c57eddb5'],
				'ethnicities': '18f5dd4f-966f-6362-724d-0c04612a0828',
				'fews': '183d6d2e-67a6-c28f-732d-ac0a07fb47fc',
				'density': '87e1f21c-a3ce-15e8-2f8e-ac4254a3bf6e',
				'markets': '2f84c905-426a-3cd9-10ba-5fe042de35c9',
				'rain2': 'da7317d2-fb87-1094-e261-cddeaa0b8b5d',
				'schools': '0e15e6c8-af6b-fe40-e15e-5b842e4fd91f',
				'churches': '9e74f2fc-5312-42f5-5152-3bac33e3c527',
				'mosques': '394ceaf4-7c9b-f2d4-5160-dc6e78d94579',
				'buildings': 'be607125-d046-46cb-9db8-748e0603a1c4',
				'platforms': 'f8823bf1-431e-b5cb-08e3-03f2e93b4f42',
				'power': 'cfb3b9c8-0b78-f0ac-8114-1f3383035ab1',
				'farms': '6d60344f-b540-e17f-993d-b83bb24ba81b',
				'refugee': 'c2598a78-6a9e-fb97-856e-79a966ea0469',
				'fatalities': '462d19b9-d6cc-ddf2-5c46-8cba761c778d',
				'bocoharam': '90aac69c-a6d4-14ee-4e8e-2c6107b381f2',
				'cities': '0c3e56ba-cc18-c890-3d38-23a2ec73013c',
				'livelihood': '210a3189-27f4-654b-dc05-c73b450f7474',
				'displaced-persons': 'edad5b04-0380-886e-f1da-9ed05cb254fa',
				'hospital': '1613f8ec-a11b-e275-2fca-4319497ff2a3',
				'refineries': '79ca9979-40b1-f6b0-1a3a-4ff7995db5fa'
			};

			return $.isArray(layers[indicator]) ? layers[indicator] : [layers[indicator]];
		}
				
		Application.prototype.loadIndicator = function (name) {

			if (!this.indicators[name])
				this.indicators[name] = {};

			var self = this;
			
			var layers = this.getLayers(name);
			if (layers) {
					
				for (var i = 0; i < layers.length; i++) {

					var id = layers[i];
					var layer = this.indicators[name][id];

					if (!layer) {

						$(document.body).addClass('loading');

						layer = new GeoPlayground.Layer({
							map: this.map,
							layerId: id,
							geoPlaygroundId: 'iqtagob',
							formatTime: this.formatTime,
							bubblesLayer: this.bubblesLayer
						}, function (e) {
							self.showLegend(e, name);
							$(document.body).removeClass('loading');
						});

						layer.on('click', function (e) {
							self.tooltip(e, name);
						});

						layer.on('beforeDraw', function (e, callback) {
							self.onBeforeDraw(e, callback, name);
						});

						this.indicators[name][id] = layer;
					}
					
					layer.load(['bocoharam', 'fatalities'].indexOf(name) > -1 ?  self.date : null);
				};
			};
			
		};

		Application.prototype.onBeforeDraw = function (e, callback, indicator) {

			var options = e.data;

			switch (indicator) {
				case 'markets':

					var alcohol = $('input[value=alcohol]').parent().find('.custom-checkbox').hasClass('checked');
					var icon = alcohol && options.content['sell alcohol'] == 1 ? 'img/icons_alcohol.png' : 'img/icons_markets.png';
					var product = $('#products').val() * 1;

					if (product > 0) {

						options.visible = false;

						var marker = new MarkerWithLabel({
							position: options.position,
							map: this.map,
							labelContent: options.content[$('#products option[value=' + product + ']').text()],
							labelAnchor: new google.maps.Point(0, 20),
							labelClass: "labels",
							labelStyle: {
								opacity: 0.9
							}
						});

						marker.setIcon(icon);

						this.markers.push(marker);
					}
					else
						options.icon.url = icon;		

					break;

				case 'displaced-persons':

					var conflict = $('input[value=displaced-persons-conflict]').parent().find('.custom-checkbox').hasClass('checked');
					var natural = $('input[value=displaced-persons-natural]').parent().find('.custom-checkbox').hasClass('checked');

					var visible = false;

					if (conflict) {
						if (options.content['Reason of displacement Insurgency_Yes or No'] == 'Yes' || options.content['Reason of displacement Commnunity clash_Yes or No'] == 'Yes')
							visible = true;
					};

					if (natural) {
						if (options.content['Reason of displacement Natural disasters_Yes or No'] != 'No')
							visible = true;
					};

					options.visible = visible;

					break;

				case 'farms':
					if (this.date == '2015 Oct' && options.content['Flag'] == '1') {
						options.strokeColor = '#000';
						options.fillColor = '#f24040';
					};
					break;
			}

			callback(options);
		};		

		Application.prototype.cleanIndicator = function (name) {

			if (!this.indicators[name])
				return;

			this.hideLegend(name);

			var layers = this.getLayers(name);

			if (layers)
				for (var i = 0; i < layers.length; i++) {

					var id = layers[i];
					var layer = this.indicators[name][id];

					if (layer) {

						layer.clean();

						if (name == 'markets' && this.markers) {
							for (var i = 0; i < this.markers.length; i++)
								this.markers[i].setMap(null);
						}
					};
				}

			delete this.indicators[name];
		}

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

		Application.prototype.showLegend = function (e, indicator) {

			switch (indicator) {
				case 'rain2':
					$('#static-legend').html($('<img>', { 'src': 'img/scale2.png' }));
					break;
				case 'density':
					$('#static-legend').html($("#legend-ranges").tmpl({ ranges: e.layer.ranges }));
					$('#legend-background').height(50);
					break;
				case 'ethnicities':
					$('#static-legend').html($('<img>', { 'src': 'img/legend1.png' }));
					break;
				case 'livelihood':
					$('#static-legend').html($("#legend-shape").tmpl({ colors: e.layer.settings.shape.colors }));
					$('#legend-background').height(260);
					break;
				case 'fews':
					$('#static-legend').html($("#legend-shape").tmpl({ colors: e.layer.settings.shape.colors }));
					$('#legend-background').height(70);
					break;
			}

			$('#static-legend').show();
		};

		Application.prototype.hideLegend = function (indicator) {

			if (!indicator)
				$('#static-legend').hide();

			var singleLayers = ['rain2', 'density', 'ethnicities', 'livelihood', 'road', 'railroad', 'fews'];

			if ($.inArray(indicator, singleLayers) > -1)
				$('#static-legend').hide();		
		};

		Application.prototype.formatNumber = function (num, precision) {
			if (num == null)
				return '';

			precision = $.isNumeric(precision) ? precision : "";

			if (typeof num === 'string')
				num = parseFloat(num);

			var format = precision === "" ? null : ("n" + precision);

			return Globalize.format(num, format, undefined, precision);
		},

		Application.prototype.formatTime = function (time, freq) {

			if (freq == 'M')
				return Globalize.format(new Date(time), 'yyyy MMM', 'en-us');

			return time;
		}

		Application.prototype.tooltip = function (event, indicator) {

			this.infoWindow.setPosition(event.data.latLng);

			var data = event.data.tooltip;
			var tooltip;

			switch (indicator) {
				case 'ethnicities':
				case 'density':
				case 'livelihood':
				case 'fews':
				case 'farms':
				case 'churches':
				case 'mosques':
				case 'hospital':
				case 'buildings':
				case 'refineries':
				case 'cities':
				case 'refugee':
					tooltip = $('#tooltip-' + indicator).tmpl({ data: data });
					break;

				case 'markets':
				case 'alcohol':
					tooltip = $("#tooltip-markets").tmpl({ data: data });
					break;

				case 'fatalities':
				case 'bocoharam':
					tooltip = $("#tooltip-bocoharam").tmpl({ data: data });
					break;

				case 'schools':
					var powerSource = 'None';

					if (data['Power Sources.Generator'] == 'TRUE') 
						powerSource = 'Generator';
					
					else if (data['Power Sources.Grid'] == 'TRUE') 
						powerSource = 'Grid';
					
					else if (data['Power Sources.Solar System'] == 'TRUE') 
						powerSource = 'Solar';					

					tooltip = $("#tooltip-schools").tmpl({ data: data });
					break;

				case 'displaced-persons':
					tooltip = $("#tooltip-displaced-persons").tmpl({ data: data });
					break;

				default:

					tooltip = $('<div>', { 'class': 'map-tooltip' });

					var markup = '';
					for (var i in data)
						markup += this.buildTooltipMarkup(i + (data[i] == null ? '' : ':'), data[i]);

					tooltip.html(markup);

					break;
			}

			if (['ethnicities', 'density', 'livelihood', 'fews'].indexOf(indicator) == -1) 
				tooltip.append($('<div style="margin-top: 5px;">Source: <a href="http://knoema.com/' + event.layer.datasetId + '" target="_blank">Knoema.com</a></div>'));
			
			this.infoWindow.setContent($('<div>').append(tooltip).html());
			this.infoWindow.open(this.map);
		};

		Application.prototype.isUrl = function (value) {
			return /https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,}/.test(value);
		}

		Application.prototype.buildTooltipMarkup = function (label, value) {

			if (value != null)
				value = this.isUrl(value) ? ('<a target="_blank" href="' + value + '">' + value + '</a>') : value;

			return '<div><label>' + label + '</label>' + (value == null ? '' : value) + '</div>';
		};	

		Application.prototype.getMarkets = function () {

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
		
		Application.prototype.initRadiusControl = function () {

			var self = this;

			this.drawingManager = new google.maps.drawing.DrawingManager({
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
			this.radiusToolWindow.setContent('<label class="label" style="font-size: 1em; color: #000;">RADIUS, KM</label><input id="radius-spinner" class="form-control input-sm" type="number" min="0" step="0.1"><a href="#" id="goods-list" class="btn btn-primary btn-sm">GO</a>');

			google.maps.event.addListener(this.drawingManager, 'circlecomplete', function (circle) {

				function tradeMarkup(latLng) {
					var tradelist = {
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
						'Fuels': [
							'Gas (regular, unleaded)',
							'Diesel',
							'Cooking Gas (LPG Cylinder)'
						]
					};

					self.infoWindow.setPosition(latLng);
					self.infoWindow.setZIndex(999);

					var date = new Date();
					date.setDate(date.getDate() + 7);

					html = $('#trade-list').tmpl({ tradelist: tradelist, date: date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + (date.getDate() + 1)).slice(-2) });

					self.infoWindow.setContent($('<div>').append(html).html());
					self.infoWindow.open(self.map);

					$('#close-trade-list').on('click', function () {

						$('body').css('cursor', 'default');

						self.infoWindow.close();
						self.radiusToolWindow.close();
						self.radiusToolCircle.setMap(null);
						$('[data-toggle="tooltip1"]').tooltip('destroy');

						return false;
					});


					$('#other-data').on('click', function () {

						$('#other-data').hide();
						
						$('.trade-markup').empty().append($('#trade-request').tmpl());

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

				self.drawingManager.setDrawingMode(null);

				self.radiusToolCircle = circle;
				//self.refreshData();
				self.radiusToolWindow.setPosition(circle.getCenter());
				self.radiusToolWindow.open(self.map);

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
					//self.refreshData();
					self.radiusToolWindow.setPosition(circle.getCenter());
				});

				google.maps.event.addListener(circle, 'radius_changed', function () {
					//self.refreshData();
					if ($radiusSpinner.val() * 1 != circle.getRadius() / 1000) {
						$radiusSpinner.val((circle.getRadius() / 1000).toFixed(2));
					}
				});
			});
		};
		return Application;
	})();

	google.maps.event.addDomListener(window, 'load', function () {
		new Application().run();
	});
})();
