/// <reference path="typings/jquery.d.ts"/>
/// <reference path="typings/google.maps.d.ts"/>
var Infrastructure;
(function (Infrastructure) {
	var generateStyle = function (objectTypeName, size, textSize, color, anchor) {
		if (typeof anchor === "undefined") { anchor = undefined; }
		return {
			url: 'img/' + objectTypeName + '-' + size + '.png',
			width: size,
			height: size,
			textSize: textSize,
			textColor: color,
			anchorText: anchor
		};
	};

	var generateStyles = function (objectTypeName, color, anchor32, anchor48, anchor64) {
		if (typeof anchor32 === "undefined") { anchor32 = undefined; }
		if (typeof anchor48 === "undefined") { anchor48 = undefined; }
		if (typeof anchor64 === "undefined") { anchor64 = undefined; }
		return [
            generateStyle(objectTypeName, 32, 10, color, anchor32),
            generateStyle(objectTypeName, 48, 11, color, anchor48),
            generateStyle(objectTypeName, 64, 12, color, anchor64)
		];
	};

	var datasets = {
		'jwheayb': {
			title: 'ATMs',
			styles: generateStyles('ATM', '#ffffff', [9, 0], [13, 0], [17, 0])
		},
		'xbpesrf': {
			title: 'Banks',
			styles: generateStyles('Banks', '#000000', [-9, 0], [-15, 0], [-20, 0])
		},
		'evcxdob': {
			title: 'Hotels',
			styles: generateStyles('Hotels', '#000000', [-9, 0], [-15, 0], [-20, 0])
		},
		// Note: There is no Governorate ID exist in this dataset
		'rxmtikb': {
			title: 'Mosques',
			styles: generateStyles('Mosque', '#ffffff')
		},
		//'idjmamb': {
		//	title: 'Landmark Towns',
		//	styles: generateStyles('LandMarkTowns', '#ffffff')
		//},
		'idjmamb': {
			title: 'Landmark Towns',
			styles: generateStyles('Social', '#000000', [-15, 8], [-23, 10], [-37, 15])
		},
		'btskswg': {
			title: 'New Landmarks',
			styles: generateStyles('NewLandMark', '#000000', [21, 0], [29, 0], [38, 0])
		},
		'okpzn': {
			title: 'Fuel Stations',
			styles: generateStyles('FuelStations', '#ffffff')
		},
		'governorates': {
			title: 'Governorates'
		},
		'towns': {
			title: 'Towns'
		}
	};

	var Application = (function () {
		function Application() {
			this.markerClusters = {};
			this.polygons = [];
		}
		Application.prototype.run = function () {
			this.infoWindow = new google.maps.InfoWindow();

			this.map = new google.maps.Map(document.getElementById('map-canvas'), {
				center: { lat: 21.6044945, lng: 57.0784942 },
				zoom: 7
			});

			$['mockjax']({
				url: /\/data\/details\?.*\&page\_id\=governorates/,
				proxy: 'Governorates.json?t=' + Date.now(),
				contentType: 'text/json'
			});
			$['mockjax']({
				url: /\/data\/details\?.*\&page\_id\=towns/,
				proxy: 'Towns.json?t=' + Date.now(),
				contentType: 'text/json'
			});

			this.initDatasetSelector();

		};

		Application.prototype.initDatasetSelector = function () {
			var _this = this;
			$('.list-elements input[type="checkbox"]').click(function () {
				//var arr = [];
				//for (var i = 0; i < $('.list-elements input[type="checkbox"]').length ; i++) {

				//	if ($($('.list-elements input[type="checkbox"]')[i]).prop('checked') && $($('.list-elements input[type="checkbox"]')[i]).val() != "") {
				//		arr.push($($('.list-elements input[type="checkbox"]')[i]).val())
				//	}
				//	if ($(this).prop('checked')) {
				//		$(this).parent().find('img').attr('src', 'img/left_panel_sectors_ico' + $(this).attr('id').substr(1) + '.png')
				//	} else {
				//		$(this).parent().find('img').attr('src', 'img/left_panel_sectors_unactive_ico' + $(this).attr('id').substr(1) + '.png')
				//	}
				//}
				//_this.showDatasets(arr);
			}).change(function () {
				var arr = [];
				for (var i = 0; i < $('.list-elements input[type="checkbox"]').length ; i++) {

					if ($($('.list-elements input[type="checkbox"]')[i]).prop('checked') && $($('.list-elements input[type="checkbox"]')[i]).val() != "") {
						arr.push($($('.list-elements input[type="checkbox"]')[i]).val())
					}
					if ($(this).prop('checked')) {
						$(this).parent().find('img').attr('src', 'img/left_panel_sectors_ico' + $(this).attr('id').substr(1) + '.png')
					} else {
						$(this).parent().find('img').attr('src', 'img/left_panel_sectors_unactive_ico' + $(this).attr('id').substr(1) + '.png')
					}
				}
				_this.showDatasets(arr);
			});

			$('#select_all').on('click', function (e) {
				$('.list-elements input[type="checkbox"]').prop('checked', true);
				var arr = [];
				for (var i = 0; i < $('.list-elements input[type="checkbox"]').length ; i++) {

					if ($($('.list-elements input[type="checkbox"]')[i]).prop('checked') && $($('.list-elements input[type="checkbox"]')[i]).val() != "") {
						arr.push($($('.list-elements input[type="checkbox"]')[i]).val())
					}
					if ($($('.list-elements input[type="checkbox"]')[i]).prop('checked')) {
						$($('.list-elements input[type="checkbox"]')[i]).parent().find('img').attr('src', 'img/left_panel_sectors_ico' + $($('.list-elements input[type="checkbox"]')[i]).attr('id').substr(1) + '.png')
					} else {
						$($('.list-elements input[type="checkbox"]')[i]).parent().find('img').attr('src', 'img/left_panel_sectors_unactive_ico' + $($('.list-elements input[type="checkbox"]')[i]).attr('id').substr(1) + '.png')
					}
				}
				_this.showDatasets(arr);
			});
			$('#deselect_all').on('click', function (e) {
				$('.list-elements input[type="checkbox"]').prop('checked', false);
				for (var i = 0; i < $('.list-elements input[type="checkbox"]').length ; i++) {
					$($('.list-elements input[type="checkbox"]')[i]).parent().find('img').attr('src', 'img/left_panel_sectors_unactive_ico' + $($('.list-elements input[type="checkbox"]')[i]).attr('id').substr(1) + '.png');
				}
				var arr = [];
				_this.showDatasets(arr);
			});
			$('#c8').click();

			//var datasetSelector = $('#datasetSelector');
			//for (var datasetId in datasets) {
			//	datasetSelector.append($('<option value="' + datasetId + '">' + datasets[datasetId].title + '</option>'));
			//}
			//datasetSelector.on('change', function () {
			//	console.log(datasetSelector.val());
			//	_this.showDatasets(datasetSelector.val());
			//});
			//datasetSelector['selectpicker']();
			//datasetSelector['selectpicker']('val', 'okpzn');
			//datasetSelector.trigger('change', null, null);
		};

		Application.prototype.showDatasets = function (datasetIds) {
			var _this = this;
			if (!datasetIds)
				return;

			$('.site-main').toggleClass('loading', true);

			this.polygons.forEach(function (polygon) {
				return polygon.setMap(null);
			});
			this.polygons = [];

			for (var key in this.markerClusters) {
				this.markerClusters[key].clearMarkers();
			}

			var defs = datasetIds.map(function (datasetId) {
				return _this.getObjects(datasetId).done(function (data) {
					return _this.addObjectsToMap(_this.map, data, datasetId);
				});
			});

			$.when.apply($, defs).done(function () {
				return $('.site-main').removeClass('loading');
			});
		};

		Application.prototype.addObjectsToMap = function (map, data, datasetId) {
			var _this = this;
			console.log(data);
			var rowCount = Math.floor(data.data.length / data.columns.length);
			var shapes = [];

			for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
				var rowOffset = rowIndex * data.columns.length;
				var description = this.generateDescription(rowOffset, data.columns, data.data);

				if (data.columns[0].name === 'WKT') {
					var geometry = data.data[rowOffset].features[0].geometry;
					if (geometry.type === "MultiPolygon") {
						var polygons = geometry.coordinates.map(function (polygonRings) {
							var paths = polygonRings.map(function (ringPoints) {
								return ringPoints.map(function (point) {
									return new google.maps.LatLng(point[1], point[0]);
								});
							});
							var polygon = new google.maps.Polygon({
								paths: paths,
								strokeColor: '#FF0000',
								strokeOpacity: 0.8,
								strokeWeight: 2,
								fillColor: '#FF0000',
								fillOpacity: 0.35,
								map: _this.map,
								desc: description
							});
							shapes.push(polygon);
							_this.polygons.push(polygon);
						});
					}
				} else {
					shapes.push(new google.maps.Marker({
						position: new google.maps.LatLng(data.data[rowOffset + 1], data.data[rowOffset]),
						icon: datasets[datasetId].styles[0].url,
						desc: description
					}));
				}
			}

			var markers = [];
			var self = this;
			shapes.forEach(function (shape) {
				if (shape instanceof google.maps.Marker) {
					markers.push(shape);
				}

				google.maps.event.addListener(shape, 'click', function () {
					if (this instanceof google.maps.Marker) {
						self.infoWindow.setPosition(this.getPosition());
					} else if (this instanceof google.maps.Polygon) {
						var bounds = new google.maps.LatLngBounds();
						this.getPath().forEach(function (point) {
							return bounds.extend(point);
						});
						self.infoWindow.setPosition(bounds.getCenter());
					}
					self.infoWindow.setContent(this.get('desc'));
					self.infoWindow.open(map);

				});
			});

			if (markers.length) {
				if (!(datasetId in this.markerClusters)) {
					// http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/docs/reference.html
					this.markerClusters[datasetId] = new window['MarkerClusterer'](map, markers, { styles: datasets[datasetId].styles });
				}
				this.markerClusters[datasetId].addMarkers(markers);
			}
		};

		Application.prototype.generateDescription = function (rowOffset, columns, data) {
			var html = '<div class="description">';
			html += '<div class="head">100 plus bed super spesialty hospital</div>';
			html += '<div class="body">' +
						'<div class="left-block">' +
							'<img src="img/img/preview.png"/>' +
							'<div class="state-block">' +
								'<div class="title">Status</div>' +
								'<div class="value"><img src="img/map_project_popup_active_ico.png"/><span>Active</span></div>' +
				'			</div>' +
						'</div>' +
						'<div class="right-block">' +
							'<div class="row">' +
								'<div class="item">' +
									'<div class="title">Sector</div>' +
									'<div class="value">Social</div>' +
								'</div>' +
								'<div class="item">' +
									'<div class="title">Subsector</div>' +
									'<div class="value">Health</div>' +
								'</div>' +
							'</div>' +
							'<div class="row">' +
								'<div class="item">' +
									'<div class="title">Project cost</div>' +
									'<div class="value">1,000,000.00 OMR</div>' +
								'</div>' +
								'<div class="item">' +
									'<div class="title">Location</div>' +
									'<div class="value">AI Khoud, Muscat</div>' +
								'</div>' +
							'</div>' +
							'<div class="row">' +
								'<div class="item">' +
									'<div class="title">Period</div>' +
									'<div class="value">31 Jan 2014-1 Jun 2016</div>' +
								'</div>' +
								'<div class="item">' +
									'<div class="value"><input type="checkbox" checked="checked" id="subscribe" /><label for="subscribe"><span>Subscribe</span></label></div>' +
								'</div>' +
							'</div>' +
						'</div>' +
					'</div>';
			html += '<div class="button-holder">' +
						'<button class="button" onclick="document.location=\'openproject.html\'" id="open">OPEN PROJECT PASSPORT</button>' +
					'</div>';
			html += '</div>';
			//var description = '<table>';
			//for (var colIndex = 0; colIndex < columns.length; colIndex++) {
			//	var dataIndex = rowOffset + colIndex;
			//	var value = (columns[colIndex].type === 'Date' ? data[dataIndex].value : data[dataIndex]);
			//	description += '<tr><th>' + columns[colIndex].name + '</th><td>' + value + '</td></tr>';
			//}
			return html;

		};

		Application.prototype.getObjects = function (datasetId) {
			var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=' + datasetId + '&accesskey=vtqxyn';
			var data = {
				Dataset: datasetId,
				Filter: [],
				Frequencies: [],
				Header: [],
				MeasureAggregations: null,
				Stub: []
			};
			return $.post(url, data, null, null, 'json');
		};
		return Application;
	})();

	google.maps.event.addDomListener(window, 'load', function () {
		var greeter = new Application();
		greeter.run();
	});
})(Infrastructure || (Infrastructure = {}));
//# sourceMappingURL=app.js.map
