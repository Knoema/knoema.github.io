/// <reference path="typings/jquery.d.ts"/>
/// <reference path="typings/google.maps.d.ts"/>

var access_token = "";

$(function () {
	/* Authentication via access token  */
	//var params = Knoema.Helpers.parseHashParams();
	//if (params == null)
	//	Knoema.Helpers.getAccessToken('Ysyd9Tw', window.location, false, 'read_resources');
	//else {
	//	if (params["access_token"] != undefined)
	//		access_token = params["access_token"];
	//}
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
		this._currentIndicator = -1;
		this._currentIndicatorData = {};
		this._map = null;
		this._layers = {};

		var _this = this;

		$('a[data-toggle="tab"]').on('click', function () {

			var href = $(this).attr('href');
			window.location = '' + href;
		});

		// init map
		var map = new google.maps.Map(document.getElementById('map-canvas'), {
			mapTypeControl: false,
			zoom: 6,
			center: { lat: 20.215167, lng: -10.777588 }
		});
		_this._map = map;
		
		this._infoWindow = new google.maps.InfoWindow();

		var markers;
		var popMarkers = [];
		

		this.getRegionInfo().done(function (provinces, departments, communes) {

			_this._regions = provinces;
			_this._departments = departments;
			_this._communes = communes;

			_this.getPopulationIndicators().done(function (dimItems) {

				_this.displayPopulationItems(dimItems);

				var key = '1000000';
				_this.getPopulationData(key).done(function (indicatorData) {

					$('.data-item:first').addClass('active');

					_this._currentIndicatorData[key] = indicatorData;
					_this.fillMap('regions', indicatorData);
				});
			});

			$('#optionDepartments, #optionProvinces, #optionCommunities').on('change', function () {

				var mapName = $(this).data('map-name');
				var key = $('.data-item.active').data('key');

				if (key == _this._currentIndicator && key > 0) {
					_this.fillMap(mapName, _this._currentIndicatorData[key]);
				}
				else{
					_this._currentIndicator = key;

					if (key > 0) {
						if (_this._currentIndicatorData[key]) {
							_this.fillMap(mapName, _this._currentIndicatorData[key]);
						}
						else {
							_this.getPopulationData(key).done(function (indicatorData) {

								_this._currentIndicatorData[key] = indicatorData;
								_this.fillMap(mapName, indicatorData);
							});
						}
					}
					else {
						_this.clearMap();
					}
				}
			});

			$('#social-objects-legend li').on('click', function () {
				var checked = $(this).find('input').attr('checked');

				var layerId = $(this).find('input').data('layer-id');

				if (checked) {
					$(this).find('input').removeAttr('checked');

					if (layerId)
						_this.removeLayer(layerId);
				}
				else {
					$(this).find('input').attr('checked', 'checked');

					if (layerId)
						_this.loadLayer(layerId);
				}
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
	App.refreshSidebar = function (data, currentDate) {};
	App.loadLayer = function (layerId) {
		var _this = this;

		var infoWindow = new google.maps.InfoWindow();
		var layer = new GeoPlayground.Layer({
			map: _this._map,
			layerId: layerId,
			geoPlaygroundId: 'itucrlg',
			infoWindow: infoWindow
		}, function (layerData) {
		});

		layer.on('beforeDraw', function (layer, callback) {

			layer.data.icon.url = layer.data.icon.url.replace('//knoema.com', '');

			callback(layer.data);
		});
		layer.on('click', function (e, callback) {
			callback();
		});

		layer.load();

		this._layers[layerId] = layer;
	};
	App.removeLayer = function (layerId) {
		
		if (!this._layers[layerId])
			return;

		this._layers[layerId].clean();
	};
	App.clearMap = function() {

		var _this = this;
		this._map['data'].forEach(function (feature) {
			_this._map['data'].remove(feature);
		});
	};
	App.fillMap = function (mapName, data) {

		this._map['data'].loadGeoJson('./Scripts/mauritania-' + mapName + '.json');

		var regions = []
		switch(mapName){
			case 'regions':
				regions = this._regions;
				break;
			case 'departments':
				regions = this._departments;
				break;
			case 'communes':
				regions = this._communes;
				break;
		}

		this.clearMap();

		var valIndex = 9;
		var regionIdIndex = 1;

		var count = data.columns.length;
		var pdata = data.data;

		var popMarkerInfo = {};
		for (var i = count; i < pdata.length; i += count) {
			var value = pdata[i + valIndex];
			var regionName = pdata[i + regionIdIndex];

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
		
		this.setLegendValues('0', '', (max / 1000).toFixed(1) + 'k', true);
		
		var _this = this;
		
		this._map['data'].setStyle(function (feature) {
			var fId = feature.getId();

			if (popMarkerInfo[fId]) {
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
		
		this._infoWindow.close();
		
		this._map['data'].addListener('click', function (event) {
			
			var region = event.feature.getProperty('name');
			var val = popMarkerInfo[event.feature.getId()];
			
			if (val == undefined)
				return;
			
			
			_this._infoWindow.setPosition(event.latLng);
			_this._infoWindow.setContent("<b>" + region + "</b><br/>" + "Value: " + val);
			_this._infoWindow.open(_this._map);
			
		});
		

	};
	App.displayPopulationItems = function (dimItems, selectedItem) {

		var _this = this;
		var $items = [];
		for (var i = 0; i < dimItems.length; i++) {
			var item = dimItems[i];

			if (item.hasData) {
				var $li = $('<li>', {
					'data-key': item.key,
					'class': 'data-item',
					text: item.name
				});

				$items.push($li);
			}
			else {
				$items.push($('<li>', {
					'class': 'without-data-item',
					text: item.name
				}));
			}
		}

		$('#overviewFilter ul').append($items);

		$('.data-item').off();
		$('.data-item').on('click', function () {
			$('.data-item').removeClass('active');
			$(this).addClass('active');

			var key = $(this).data('key');
			var mapName = $('.btn-group .btn.active input').data('map-name');
			_this._currentIndicator = key;

			if (key > 0) {
				if (_this._currentIndicatorData[key]) {
					_this.fillMap(mapName, _this._currentIndicatorData[key]);
				}
				else {
					_this.getPopulationData(key).done(function (indicatorData) {

						_this._currentIndicatorData[key] = indicatorData;
						_this.fillMap(mapName, indicatorData);
					});
				}
			}
			else {
				_this.clearMap();
			}
		});
	};
	App.getPopulationIndicators = function () {

		var self = this;
		var def = $.Deferred();
		var datasetId = 'MRHHSCL2016';
		$.get('http://knoema.com/api/1.0/meta/dataset/' + datasetId + '/dimension/indicator?page_id=' + datasetId + '&access_token=' + access_token, {
		}).done(function (data) {
			return def.resolve(data.items);
		});

		return def;
	};
	App.getPopulationData = function (memberId) {
		var self = this;
		var def = $.Deferred();
		var datasetId = 'MRHHSCL2016';
		$.post('http://knoema.com/api/1.0/data/details?page_id=' + datasetId + '&access_token=' + access_token, {
			"Header": [],
			"Stub": [],
			"Filter": [{
				"DimensionId": "indicator",
				"Members": [memberId],
				"DimensionName": "Indicator",
				"DatasetId": datasetId
			}, {
				"DimensionId": "measure",
				"Members": ['1000000'],
				"DimensionName": "Measure",
				"DatasetId": datasetId
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
	App.getRegionInfo = function () {
		var _this = this;
		var def = $.Deferred();
		$.getJSON('./Scripts/regions.json').done(function (senegal) {
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

			def.resolve(regions, departments, communes);
		});
		return def;
	};
	App.showQuestionStat = function (map, columnIndex, data, currentDate, departments, regionColumnIndex) {};
	App.showAnswerStat = function (map, columnIndex, targetAnswers, data, currentDate, departments, regionColumnIndex, regionNameIndex) {};
	App.datasetColumnNames = {};

	return App;
})();