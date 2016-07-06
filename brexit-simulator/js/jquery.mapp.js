/// <reference path="../jquery-1.8.1.js" />
/// <reference path="jquery.legendRanges.js" />
/// <reference path="../../tooltip.js" />

jQuery.fn.extend({
	mapp: function (options) {
		return new jQuery.Mapp(this, options)
	}
});

jQuery.Mapp = function ($container, options) {
	this._container = $container.get(0);
	this._map = null;
	this._regionCodeToName = options.regionCodeToName;
	this._timeSeries = options.timeSeries;
	this._tooltip = options.tooltip;
	this._backgroundColor = options.backgroundColor;
	this._url = options.url;
	this._startPosition = options.startPosition;
	this._simpleColorScale = options.simpleColorScale;
	this._noDataColor = options.noDataColor;
	this._hasNoDataCountries = false;
	this._showNoDataInMap = options.showNoDataInMap;
	this._visibleRegion = options.visibleRegion;
	this._selectedRegions = options.selectedRegions;
	this._regionIdsInMap = null;

	this._legendRanges = new jQuery.LegendRanges({
		legendScale: options.legendScale,
		timeSeries: this._timeSeries,
		colors: options.colors || null,
		colorSelection: options.colorSelection,
		legendIntervals: options.legendIntervals
	});

	this._zoomStep = 1.5;
	this._zoomMaxStep = 7;
	this._zoomCurStep = 1;
	this._transX = 0;
	this._transY = 0;
	this._zoom = 1;
	this._transform = options.transform;
	this._graphicsId = null;
	this._moveEndCallback = function () {
	};

	this._loadMap(options.callback)
};

jQuery.Mapp.prototype._loadMap = function (callback) {

	var $container = $(this._container);

	$container.busy($.get(this._url, $.proxy(function (result) {

		var htmlString = result.xml; //IE

		if (!htmlString) {
			if (result.documentElement)
				htmlString = document.importNode(result.documentElement, true); //non-IE
			else if (typeof result.getElementById == 'function')
				htmlString = result.getElementById('svgmapid'); //last resort
			else
				htmlString = result;
		};

		$container.html(htmlString);

		this._map = $container.find("#svgmapid");

		if (this._transform.file != undefined) {

			var index = this._transform.file.indexOf('-');
			if (index > -1)
				this._graphicsId = this._transform.file.substring(0, index);
			else
				this._graphicsId = this._transform.file;
		};

		if (this._transform.scale == undefined)
			this._transform.scale = 1;

		if (this._transform.x == undefined)
			this._transform.x = 0;

		if (this._transform.y == undefined)
			this._transform.y = 0;

		if (this._transform != undefined)
			this._map.find('g#' + this._graphicsId)
				.attr('transform', 'matrix(' + this._transform.scale + ', 0, 0, ' + this._transform.scale + ', ' + this._transform.x + ',' + this._transform.y + ')');

		if (this._startPosition) {
			this._zoom = this._startPosition.zoom;
			this._zoomCurStep = this._startPosition.zoomStep;
			this._transX = this._startPosition.x;
			this._transY = this._startPosition.y;

			this._applyTransform(this._startPosition.zoom, this._startPosition.x, this._startPosition.y);
		}

		this.update();

		if ($.isFunction(callback))
			callback();

		// add zoom
		this._bindZoom();

		// add pan
		this._makeDraggable();

	}, this)));
};

jQuery.Mapp.prototype.on = function(type, callback) {
	switch(type) {
		case 'moveend': 
			if(jQuery.isFunction(callback))
				this._moveEndCallback = callback;
			break;
	};

	return this;
};

jQuery.Mapp.prototype._filterTimeseries = function (timeseries) {
	for (var i = 0; i < timeseries.length; i++)
		timeseries[i].data = this._filterInputData(timeseries[i].data);

	return timeseries;
};

jQuery.Mapp.prototype.refreshLegendRanges = function () {
	return this._legendRanges.refreshLegendRanges();
};

jQuery.Mapp.prototype.setIntervalColor = function (index, color) {
	this._legendRanges.setIntervalColor(index, color);
};

jQuery.Mapp.prototype.getLegendIntervals = function () {
	return this._legendRanges.getLegendIntervals();
};

jQuery.Mapp.prototype.getParsedIntervals = function () {
	return this._legendRanges.getParsedIntervals();
};

jQuery.Mapp.prototype.serializeIntervals = function (intervals) {
	return this._legendRanges.serializeIntervals(intervals);
};

jQuery.Mapp.prototype.deserializeIntervals = function (intervals) {
	return this._legendRanges.deserializeIntervals(intervals);
};

jQuery.Mapp.prototype._getColors = function () {
	return this._legendRanges._getColors();
};

jQuery.Mapp.prototype._sortRegionByValue = function (mapCodetoValue) {
	return this._legendRanges._sortRegionByValue(mapCodetoValue);
};

jQuery.Mapp.prototype.getScale = function (scale) {
	scale = scale ? scale : 1;

	switch (scale) {
		case 1:
			return '';
		case 1000:
			return "thousand";
		case 1000000:
			return "million";
		case 1000000000:
			return "billion";
		case 1000000000000:
			return 'trillion';
		default:
			return scale + 's';
	};
};

jQuery.Mapp.prototype.setOption = function (option, value) {
	switch (option) {
		case 'intervalCount':
			this._legendRanges.setOption('intervalCount', value);
			break;
		case 'startColor':
			this._legendRanges.setOption('startColor', value);
			break;
		case 'endColor':
			this._legendRanges.setOption('endColor', value);
			break;
		case 'legendIntervals':
			this._legendRanges.setOption('legendIntervals', value);
			break;
		case 'backgroundColor':
			this._backgroundColor = value;
			break;
		case 'noDataColor':
			this._noDataColor = value;
			break;
		case 'legendScale':
			this._legendRanges.setOption('legendScale', value);
			break;
		case 'timeSeries':
			this._timeSeries = value;
			this._legendRanges.setOption('timeSeries', value);
			break;
		case 'tooltip':
			this._tooltip = value;
			break;
		case 'colorSelection':
			this._legendRanges.setOption('colorSelection', value);
			break;
		case 'colors':
			this._legendRanges.setOption('colors', value);
			break;
		case 'simpleColorScale':
			this._simpleColorScale = value;
			break;
		case 'showNoDataInMap':
			this._showNoDataInMap = value;
			break;
	};
};

jQuery.Mapp.prototype.hasNoDataCountries = function () {
	return this._hasNoDataCountries;
};

jQuery.Mapp.prototype._displayNoDataInMap = function () {
	return this._showNoDataInMap && this._hasNoDataCountries;
};

jQuery.Mapp.prototype.update = function () {
	if (!this._map || this._timeSeries.length === 0)
		return;

	this._regionIdsInMap = this._getRegionIdsInMap();
	this._timeSeries = this._filterTimeseries(this._timeSeries);
	this._legendRanges.setOption('timeSeries', this._timeSeries);

	var allRegionIdsInMap = [];
	
	this._setHasCountriesWithNoData();

	this._createLegend();
	this._fillColor();
	this._addTooltip();
	this._setBackgroundColor();
};

jQuery.Mapp.prototype._setHasCountriesWithNoData = function () {
	var regionsWithData = this._sortRegionByValue(this._timeSeries[0].data);
	this._hasNoDataCountries = false;

	//filter ids that are only countries and filter further those countries which are included for selected ds.
	//Length of country id is 2 (iso)
	//Why countries only? Reverted condition regionId.length == 2
	for (var i = 0; i < this._regionIdsInMap.length; i++) {
		var regionId = this._regionIdsInMap[i].toUpperCase();
		if (regionsWithData.indexOf(regionId) == -1) {
			this._hasNoDataCountries = true;
			break;
		}
	}
};

jQuery.Mapp.prototype._setBackgroundColor = function () {

	var g = this._map.find('g#ocean');

	if (g.length > 0)
		g.attr('fill', '#' + (this._backgroundColor ? this._backgroundColor : 'eaeaea'));
	else
		$(this._container).css('background-color', '#' + (this._backgroundColor ? this._backgroundColor : 'fff'));
};

jQuery.Mapp.prototype._getRegionIdsInMap = function (inputData) {
	var $map = this._map;
	// if (this._transform != undefined)
	// 	$map = $map.find("#" + this._transform.map);

	var idsInMap = [];
	$map.find('*').each(function () {
		var elemId = $(this).attr('id');
		if (elemId && $.inArray(elemId.toLowerCase(), idsInMap) === -1)
			idsInMap.push(elemId.toLowerCase());
	});
	return idsInMap;
}

jQuery.Mapp.prototype._filterInputData = function (inputData) {

	var getKeys = Object.keys || function (obj) {
		if (obj !== Object(obj))
			throw new TypeError('Invalid object');

		var keys = [];
		for (var key in obj)
			if (Object.hasOwnProperty.call(obj, key))
				keys.push(key);

		return keys;
	};

	var inputCodes = getKeys(inputData);
	for (var i = 0; i < inputCodes.length; i++) {
		var found = this._regionIdsInMap.indexOf(inputCodes[i].toLowerCase()) > -1;
		if (!found)
			delete inputData[inputCodes[i]];

	};

	return inputData;
};

jQuery.Mapp.prototype._getTooltipText = function (id, noData) {
	var result = '';
	if (noData) {
		//create tooltip text for No data only if country is selected in dim filter and selected in map includes this country
		if (this._regionIdsInMap.indexOf(id.toLowerCase()) > -1 && this._selectedRegions.indexOf(id) > -1)
			result = '<strong>' + this._regionCodeToName[id] + '</strong></br>' + __R('No data');
	}
	else {
		result = '<strong>' + this._regionCodeToName[id] + '</strong>';
		var showTime = false;
		var time;

		if (this._timeSeries && this._timeSeries[0] && this._timeSeries[0].time) {

			// time is folded
			if (typeof this._timeSeries[0].time == 'object') {

				var times = [];
				for (var i = 0; i < this._timeSeries.length; i++)
					if (this._timeSeries[i].time[id])
						times.push(this._timeSeries[i].time[id]);

				times = $.grep(times, function (v, k) {
					return $.inArray(v, times) === k;
				});

				if (times.length > 1)
					showTime = true;
				else
					time = times[0];
			}
			else
				time = this._timeSeries[0].time;
		}

		var timeLabel = __R('Time:');

		for (var i = 0; i < this._timeSeries.length; i++) {
			if (this._timeSeries[i].data[id]) {
				var unit = this._timeSeries[i].unit && (this._timeSeries[i].id.indexOf(this._timeSeries[i].unit) < 0) ? this._timeSeries[i].unit : '';
				var scale = this.getScale(this._timeSeries[i].scale);
				var scaleAndUnit = (unit.indexOf(scale) > -1) ? unit : scale + ' ' + unit;
				result += '<br />' +
					this._timeSeries[i].id + ': ' +
					//Knoema.Utils.formatNumber(Globalize.parseFloat(this._timeSeries[i].data[id])) + ' ' +

					Globalize.format(Globalize.parseFloat(this._timeSeries[i].data[id])) + ' ' +

					scaleAndUnit +
					(!showTime ? '' : ', ' + timeLabel + '  ' + this._timeSeries[i].time[id]);
			}
		};

		if (!showTime && time)
			result += '<br />' + timeLabel + ' ' + time;
	}

	return result;
};

jQuery.Mapp.prototype._addTooltip = function () {
	if (this._timeSeries.length == 0)
		return;
	var $map = this._map;

	var regions = this._sortRegionByValue(this._timeSeries[0].data);
	var allRegions = this._sortRegionByValue(this._regionCodeToName);
	$map.delegate('g', 'mouseover', $.proxy(function (event) {
		var target = event.target || event.srcElement;
		target = $(target).closest('g')[0];
		var id = target.id;
		if (id != '') {
			var color = $(target).attr('fill');
			var tooltipText = '';
			if (typeof color !== "undefined") {
				var isRegion = $.inArray(id, regions) > -1;

				if (isRegion)
					tooltipText = this._getTooltipText(id);
				else if (this._displayNoDataInMap()) {
					isRegion = id.length == 2 && $.inArray(id, allRegions) > -1;
					if (isRegion)
						tooltipText = this._getTooltipText(id, true);
				}
			}

			if (tooltipText != '') {
				if (this._tooltip == 'sticky')
					this._stickyTooltip(tooltipText, color);
				else
					this._floatTooltip(target, tooltipText, color);
			}
			
		};

	}, this));

	$map.delegate('path, polygon', 'mouseover', $.proxy(function (event) {
		var target = event.target || event.srcElement;
		var id = target.id;
		if (id != '') {
			var color = $(target).attr('fill');
			var tooltipText = '';
			if (typeof color !== "undefined") {
				var isRegion = $.inArray(id, regions) > -1;
				if (isRegion)
					tooltipText = this._getTooltipText(id);
				else if (this._displayNoDataInMap()) {
					isRegion = id.length == 2 && $.inArray(id, allRegions) > -1
					if (isRegion)
						tooltipText = this._getTooltipText(id, true);
				}
					
			}

			if (tooltipText != '') {
				if (this._tooltip == 'sticky')
					this._stickyTooltip(tooltipText, color);
				else
					this._floatTooltip($(target), tooltipText, color);
			}
		};

	}, this));

	$map.delegate('g', 'mouseout', $.proxy(function (event) {

		if (this._tooltip == 'sticky')
			this._hideStickyTooltip();
		else
			this._hideFloatTooltip($(event.target).closest('g')[0]);

	}, this));

	$map.delegate('path, polygon', 'mouseout', $.proxy(function (event) {
		if (event.target.id != '') {
			if (this._tooltip == 'sticky')
				this._hideStickyTooltip();
			else
				this._hideFloatTooltip($(event.target));
		};
	}, this));

};

jQuery.Mapp.prototype.getColor = function (value, intervals) {

	for (var i in intervals) {

		if (jQuery.type(value) === "string")
			value = parseFloat(value);

		if (intervals[i].low == null && value < intervals[i].high)
			return intervals[i].color;

		if (intervals[i].high == null && value > intervals[i].low)
			return intervals[i].color;

		if (value >= intervals[i].low && value <= intervals[i].high)
			return intervals[i].color;

		if (intervals[i].low == intervals[i].high && value == intervals[i].high)
			return intervals[i].color;
	};

	return null;
};

jQuery.Mapp.prototype._fillColor = function () {

	if (this._map) {

		var $map = this._map;
		$map.find("path, g").removeAttr("fill");

		if (this._timeSeries.length == 0)
			return;

		var regionCodes = this._sortRegionByValue(this._timeSeries[0].data);

		if (this._displayNoDataInMap()) {
			var noDataColor = this._noDataColor;
			$map.find('*').each(function () {
				//color only countries with no data color
				if (this.id && this.id.length == 2)
					$(this).attr("fill", '#' + noDataColor)
			});
		}

		if (regionCodes.length > 0) {

			var fillRegionColor = function (regCode, color) {
				//unique Id in dom assumption broken in svg files after they were refactored for zoom task
				//replacing find('#val') selector with find('[id="val"]') to support multiple ids for now
				//svg files need to be fixed to have unique ids since '#val' selector is much faster than '[id="val"]'

				if (color) {
					if (this._transform != null)
						$map.find('g#' + this._transform.map).find('[id="' + regCode + '"]').attr("fill", '#' + color);
					else
						$map.find('[id="' + regCode + '"]').attr("fill", '#' + color);
				};
			};

			var data = this._timeSeries[0].data;
			var intervals = this.getParsedIntervals();
			
			for (var i = 0; i < regionCodes.length; i++)
				fillRegionColor.call(
					this,
					regionCodes[i],
					this.getColor(data[regionCodes[i]], intervals)
				);
		};
	};
};

jQuery.Mapp.prototype._createLegend = function () {
	if (this._map) {
		var self = this;
		var $container = $(this._container);
		$container.parent().find('.map-simple-legend, .map-legend').remove();

		var isRTL = $('html').prop('dir') === 'rtl';
		if (this._simpleColorScale) {
			this._addSimpleLegend();
			return;
		}

		var addAreas = function () {

			content.html('');

			self._map.find('g').each(function () {

				var path = $(this);

				var region = path.attr('region');
				if (region != '' && region != undefined) {

					// var area = $(Knoema.Utils.buildHTML('div', region, {
					// 	'class': 'area',
					// 	'style':
					// 		'font-size: ' + font + 'pt; ' +
					// 		'padding-top: ' + 5 * k + 'px'
					// })).appendTo(content);

					$('<div class="area"></div>').css({
						'font-size': font + 'pt',
						'padding-top': 5 * k + 'px'
					}).appendTo(content);

					if ($('html').prop('dir') == 'rtl')
						area.css('padding-right', 5 * k + 'px');

					area.click(function () {
						self._zoomPolygon(path);
					});
				};
			});

			legend.css({ 'top': $(self._container).height() - legend.height() - 20 });
		};

		var addRanges = function () {

			content.html('');

			var intervals = self.getParsedIntervals();
			if (intervals.length > 0 || self._displayNoDataInMap()) {

				var createLegend = function (interval) {

					var item = $('<div>');

					item.css({
						'line-height': 15 * k + 'px',
						'padding-top':  5 * k + 'px'
					}).appendTo(content);

					// var item = $(Knoema.Utils.buildHTML('div', {
					// 	'style':
					// 		 'line-height:' + 15 * k + 'px; ' +
					// 		 'padding-top: ' + 5 * k + 'px'
					// })).appendTo(content);

					var noData = interval === null;
					var intervalColor = noData ? self._noDataColor : interval.color;
					// var color = $(Knoema.Utils.buildHTML('span', {
					// 	'class': 'color',
					// 	'style':
					// 		'background-color: #' + intervalColor + '; ' +
					// 		'width: ' + 20 * k + 'px; ' +
					// 		'height: ' + 15 * k + 'px; ' +
					// 		'margin-right: ' + 5 * k + 'px; '
					// })).appendTo(item);

					var color = $('<span class="color"></span>');
					color.css({
						'background-color': '#' + intervalColor,
						'width': 20 * k + 'px',
						'height': 15 * k + 'px',
						'margin-right': 5 * k + 'px'
					}).appendTo(item);

					if ($("html").prop("dir") == "rtl")
						color.css("margin-left", 5 * k);
					else
						color.css("margin-right", 5 * k);

					var t = '';
					if (noData)
						t = __R('No data');
					else {
						//var l = Knoema.Utils.formatNumber(interval.low),

						var l = Globalize.format(interval.low),

						//h = Knoema.Utils.formatNumber(interval.high);

						h = Globalize.format(interval.high);

						//Knoema.Utils.formatNumber(interval.high);

						if (interval.low == null)
							t = '< ' + h;
						else if (interval.high == null)
							t = '> ' + l;
						else
							t = l + ' - ' + h;
					}

					// var text = $(Knoema.Utils.buildHTML('span', t, {
					// 	'class': 'text',
					// 	'style':
					// 		'font-size: ' + font + 'pt; ' +
					// 		'left: ' + 35 * k + 'px'
					// })).appendTo(item);

					$('<span class="text"></span>').css({
						'font-size': font + 'pt',
						'left': 35 * k + 'px'
					}).appendTo(item);

				};
				
				for (var i in intervals) {
					createLegend(intervals[i]);
					legend.css({ 'top': $(self._container).height() - legend.height() - 20 });
				};

				if (self._displayNoDataInMap()) {
					createLegend(null);
					legend.css({ 'top': $(self._container).height() - legend.height() - 20 });
				}

				legend.show();
			}
			else
				legend.hide();
		};

		var k = $container.height() / 500;
		var font = 10 * k > 10 ? 10 : 10 * k;

		if ($container.parent().find('.map-legend').length == 0)
			$container.parent().append('<div class="map-legend"><span id="ranges">' + __R('Legend') + '</span><span id="areas">' + __R('Location') + '</span><div id="content"></div></div>');

		var legend = $container.parent().find('.map-legend');
		var content = legend.find('#content');

		if (self._transform != null && self._transform.map == 'world') {

			var ranges = legend.find('#ranges');
			ranges.css({ 'font-size': font + 'pt', 'padding-right': 5 * k + 'px' });
		
			if (isRTL)
				ranges.css('padding-left', 5 * k + 'px');

			ranges.click(addRanges);
			ranges.show();

			var areas = legend.find('#areas');
			areas.css('font-size', font + 'pt');

			if (isRTL)
				areas.css('padding-right', 5 * k + 'px');
			else
				areas.css('padding-left', 5 * k + 'px');

			//legend.find('#content').css('margin-top', '20px');
			areas.click(addAreas);
			areas.show();
		} else if (self._transform.map !== 'world' && isRTL) {
			legend.find('#content').css('margin-top', 0);
		};

		addRanges();
	}
};

jQuery.Mapp.prototype._stickyTooltip = function (text, color) {

	var container = $(this._container).siblings('div.sticky-tooltip');
	container.css('border-color', color);
	container.html(text);
	container.show();
};

jQuery.Mapp.prototype._hideStickyTooltip = function (id) {
	$(this._container).siblings('div.sticky-tooltip').empty().hide();
};

jQuery.Mapp.prototype._floatTooltip = function (targets, mouseovertext, color) {
	$(targets).attr("opacity", 0.5);
	tooltip.show(mouseovertext, color);
};

jQuery.Mapp.prototype._hideFloatTooltip = function (targets) {
	$(targets).attr("opacity", 1);
	tooltip.hide();
};

jQuery.Mapp.prototype._bindZoom = function () {

	var map = this;

	var width = map._map.first().get(0).viewBox.baseVal.width;
	var height = map._map.first().get(0).viewBox.baseVal.height;

	var zoomIn = function () {

		if (map._zoomCurStep < map._zoomMaxStep) {

			map._transX -= (width / map._zoom - width / (map._zoom * map._zoomStep)) / 2;
			map._transY -= (height / map._zoom - height / (map._zoom * map._zoomStep)) / 2;
			map._zoom = Math.pow(map._zoomStep, map._zoomCurStep);
			map._zoomCurStep++;

			map._applyTransform(map._zoom, map._transX, map._transY);

			map._moveEndCallback({ zoom: map._zoom, zoomStep: map._zoomCurStep, x: map._transX, y: map._transY });
		};
	};

	var zoomOut = function () {
		if (map._zoomCurStep > 1) {

			map._transX += (width / (map._zoom / map._zoomStep) - width / map._zoom) / 2;
			map._transY += (height / (map._zoom / map._zoomStep) - height / map._zoom) / 2;
			map._zoom = map._zoom / map._zoomStep;
			map._zoomCurStep--;

			map._applyTransform(map._zoom, map._transX, map._transY);
		};

		if (map._zoomCurStep == 1) {
			map._transX = map._transY = 0;
			map._zoom = 1;
		
			map._applyTransform(map._zoom, map._transX, map._transY);

			if (map._transform != undefined)
				map._map.find('g#' + map._graphicsId)
					.attr('transform', 'matrix(' + map._transform.scale + ', 0, 0, ' + map._transform.scale + ', ' + map._transform.x + ',' + map._transform.y + ')');

			var ghost = $(map._container).parent().find('#map-transform');
			ghost.css({ 'left': '0px', 'top': '0px', 'height': '1em' });
		};

		map._moveEndCallback({ zoom: map._zoom, zoomStep: map._zoomCurStep, x: map._transX, y: map._transY });
	};

	var $mparent = $(map._container).parent();
	if ($mparent.find('.map-zoomin').length == 0) { //add zoom controls
		$mparent.append('<div class="map-zoomin">+</div>');
		$mparent.append('<div class="map-zoomout">-</div>');
		$mparent.append('<div id="map-transform"></div>');
		$mparent.append('<div class="sticky-tooltip"></div>');
	}

	// zoom on click
	$mparent.find('.map-zoomin').click(zoomIn);
	$mparent.find('.map-zoomout').click(zoomOut);

	// zoom on scroll
	$(map._container).bind("mousewheel", function (event, delta) {

		if (delta > 0)
			zoomIn()
		else
			zoomOut();

		return false;
	});

	// zoom on double click
	$(map._map).delegate('path', 'dblclick', function (event) {

		if (event.target.id != '') {
			map._zoomPolygon($(event.target), true)
		};
	});
};

jQuery.Mapp.prototype._makeDraggable = function () {

	var mouseDown = false;
	var oldPageX, oldPageY;
	var self = this;

	$(self._container).mousemove(function (e) {

		if (mouseDown) {

			self._transX -= (oldPageX - e.pageX) / self._zoom;
			self._transY -= (oldPageY - e.pageY) / self._zoom;

			if (self._transX > 0) {
				self._transX = 0;
				e.pageX = 0;
			}

			if (self._transY > 0) {
				self._transY = 0;
				e.pageY = 0;
			}

			self._applyTransform(self._zoom, self._transX, self._transY);

			oldPageX = e.pageX;
			oldPageY = e.pageY;

			self._moveEndCallback({ zoom: self._zoom, zoomStep: self._zoomCurStep, x: self._transX, y: self._transY });
		};
	}).mousedown(function (e) {

		oldPageX = e.pageX;
		oldPageY = e.pageY;

		if (self._zoom > 1) {
			$(this).css('cursor', 'move');
			mouseDown = true;
		};

		return false;

	}).mouseup(function () {

		$(this).css('cursor', 'default');

		mouseDown = false;
		return false;
	});

	$(window).mouseup(function () {
		mouseDown = false;
	});
};

jQuery.Mapp.prototype._zoomPolygon = function (polygon, doubleClick) {

	var self = this;

	if (this._transform != null) {

		var animate = function animate(scale, x, y) {
			ghost.animate({ left: x, top: y, height: scale + "em" }, {
				duration: 700, easing: "swing", step: function (now, fx) {
					prop[fx.prop] = now;
					prop.count++;
					if (prop.count == 3) {
						self._applyTransform(prop.height, prop.left, prop.top);
						prop.count = 0;
					};
				}
			});
		};

		var gWidth = self._map.find('g#' + self._graphicsId).get(0).getBBox().width;
		var gHeight = self._map.find('g#' + self._graphicsId).get(0).getBBox().height;

		var containerWidth = $(self._container).width();
		var containerHeight = $(self._container).height();

		var svgWidth = self._map.get(0).viewBox.baseVal.width;
		var svgHeight = self._map.get(0).viewBox.baseVal.height;

		// compute scale
		var viewboxScale;
		if (containerWidth >= svgWidth && containerHeight >= svgHeight)
			viewboxScale = Math.min(containerWidth / svgWidth, containerHeight / svgHeight);
		else
			viewboxScale = Math.min(
					svgWidth > containerWidth
						? containerWidth / svgWidth
						: svgWidth / containerWidth,

					svgHeight > containerHeight
						? containerHeight / svgHeight
						: svgHeight / containerHeight
			);

		var scale = viewboxScale * self._transform.scale;

		// get polygon parameters 
		var box = polygon.get(0).getBBox();

		// set scaling and transform	
		if (!doubleClick) {

			var zoom = Math.min(
				containerWidth / (box.width * scale),
				containerHeight / (box.height * scale)
			);

			self._zoomCurStep = Math.min(Math.floor(Math.log(zoom) / Math.log(self._zoomStep)), self._zoomMaxStep);
			self._zoom = Math.pow(self._zoomStep, self._zoomCurStep);
		}
		else {
			self._zoomCurStep = Math.min(self._zoomMaxStep, self._zoomCurStep + 1);
			self._zoom = Math.pow(self._zoomStep, self._zoomCurStep);
		};

		// center zoomed-in polygon
		gWidth = gWidth > containerWidth ? containerWidth : gWidth * scale;
		gHeight = gHeight > containerHeight ? containerHeight : gHeight * scale;

		var dx = (gWidth - box.width * scale * self._zoom) / 2 / self._zoom;
		var dy = (gHeight - box.height * scale * self._zoom) / 2 / self._zoom;

		// translate to position
		self._transY = -box.y * self._transform.scale - self._transform.y + dy;
		self._transX = -box.x * self._transform.scale - self._transform.x + dx;

		// animate map
		var ghost = $(self._container).parent().find('#map-transform');
		var prop = {
			left: ghost.css("left"),
			top: ghost.css("top"),
			height: ghost.css("height"),
			count: 0
		};
		animate(self._zoom, self._transX, self._transY);

		self._moveEndCallback({ zoom: self._zoom, zoomStep: self._zoomCurStep, x: self._transX, y: self._transY });
	};
};

jQuery.Mapp.prototype._applyTransform = function (scale, transX, transY) {
	$(this._map).find('g').first().attr('transform', 'scale(' + scale + ') translate(' + transX + ', ' + transY + ')');
};

jQuery.Mapp.prototype._addRangeColorToLegend = function (color, pos, $legend) {
	var $rangeColor = $('<div class="range-color" style="background-color: ' + color + '"></div>');
	var rectWidth, rectHeight;
	rectWidth = rectHeight = 12;
	$rangeColor.css({
		width: rectWidth + 'px',
		height: rectWidth + 'px',
		top: pos * rectHeight - 1
	});

	$legend.append($rangeColor);
};

jQuery.Mapp.prototype._addLabelsToLegend = function (text, pos, $legend) {
	var rectWidth, rectHeight;
	var isRTL = $('html').prop('dir') === 'rtl';
	rectWidth = rectHeight = 12;
	var $rangeLabel = $('<span class="range-text"></span>')
			.html(text)
			.css({
				"left": isRTL ? 0 : rectWidth + 4,
				"top": pos * rectHeight,
				"font-family": "Calibri",
				"font-size": rectHeight + "px"
			})
			.appendTo($legend);
};

jQuery.Mapp.prototype._addSimpleLegend = function () {
	var self = this;
	var $container = $(self._container);
	var $legend = $('<div class="map-simple-legend"></div>');

	var ranges = self._getRangesData();
	var intervals = self.getParsedIntervals();

	if (intervals.length == 0)
		return;

	var text1 = intervals[0].low == null ? ranges[0].rangeText : intervals[0].low;
	var text2 = intervals[intervals.length - 1].high == null ? ranges[ranges.length - 1].rangeText : intervals[intervals.length - 1].high;

	
	var rectWidth, rectHeight;
	var isRTL = $('html').prop('dir') === 'rtl';
	rectWidth = rectHeight = 12;
	
	for (var i = 0; i < ranges.length; i++) {

		var $rangeColor = $('<div class="range-color" style="background-color: ' + ranges[i].rangeColor + '"></div>');
		this._addRangeColorToLegend(ranges[i].rangeColor, i, $legend);

		if (i === 0 || i === (ranges.length - 1)) {
			var text;
			if (i === 0) {
				text = (intervals[0].low == null) ? "< " + intervals[0].high : intervals[0].low;
			} else {
				text = (intervals[intervals.length - 1].high == null) ? "> " + intervals[intervals.length - 1].low : intervals[intervals.length - 1].high;
			}
			this._addLabelsToLegend(text, i, $legend);
		}
	}

	if (this._displayNoDataInMap()) {
		this._addRangeColorToLegend('#' + this._noDataColor, ranges.length, $legend);
		this._addLabelsToLegend(__R('No data'), ranges.length, $legend);
	}

	var rangeColorCount = this._displayNoDataInMap() ? ranges.length + 1 : ranges.length;

	//debugger;
	$legend.css({
		"top": -50,
		//"top": $container.height() - rectHeight * rangeColorCount - 10,
		"left": isRTL ? "10px" : $($container).parent().css('left'),
		//"left": "10px",
		"height": rangeColorCount * (rectHeight + 1)
	});

	$container.parent().append($legend);

	if (isRTL) {
		var $maxWidthElement = null;
		var width = -1;
		var ranges = $legend.find('.range-text');
		var rangesCount = ranges.length;
		for (var i = 0; i < rangesCount; i++) {
			var width2 = $(ranges[i]).width();
			if (width2 > width)
				width = width2;
		}
		$legend.find('.range-text').css({
			"left": -14,
			"text-align": "right"
		});
		$legend.find('.range-color').css({
			"left": width - 9
		});
	}
};

jQuery.Mapp.prototype._getRangesData = function () {
	var self = this;
	var ranges = [];
	var intervals = self.getParsedIntervals();
	if (intervals.length > 0) {
		for (var i in intervals) {
			var intervalText = '',
				low =  Globalize.format(intervals[i].low),
				high = Globalize.format(intervals[i].high);

			if (intervals[i].low == null)
				intervalText = '< ' + high;
			else if (intervals[i].high == null)
				intervalText = '> ' + low;
			else
				intervalText = low + ' - ' + high;
			ranges.push({
				rangeColor: '#' + intervals[i].color,
				rangeText: intervalText
			});
		};
	};
	return ranges;
};
