/// <reference path="/js/vendor/lodash.compat.js" />

jQuery.fn.extend({
	legendRanges: function (options) {
		return new jQuery.LegendRanges(options)
	}
});

jQuery.LegendRanges = function (options) {
	this._legendScale = options.legendScale;
	this._timeSeries = options.timeSeries;
	this._colors = options.colors;
	this._colorSelection = options.colorSelection;
	this._legendIntervals = options.legendIntervals;
};

jQuery.LegendRanges.prototype.setOption = function (option, value) {
	switch (option) {
		case 'intervalCount':
			this._colorSelection.intervalCount = value;
			break;
		case 'startColor':
			this._colorSelection.startColor = value;
			this._legendIntervals = this._updateLegendColors();
			break;
		case 'endColor':
			this._colorSelection.endColor = value;
			this._legendIntervals = this._updateLegendColors();
			break;
		case 'legendIntervals':
			this._legendIntervals = value;
			break;
		case 'legendScale':
			this._legendScale = value;
			this._legendIntervals = this.serializeIntervals(this.refreshLegendRanges());
			break;
		case 'timeSeries':
			this._timeSeries = value;
			break;
		case 'colorSelection':
			this._colorSelection = value;
			break;
		case 'colors':
			this._colors = value;
			break;
	};
};

jQuery.LegendRanges.prototype.serializeIntervals = function (intervals) {
	if (!intervals)
		return null;

	var result = [];

	for (var i = 0; i < intervals.length; i++) {
		result.push(intervals[i].low);
		result.push(intervals[i].color);

		if (i == intervals.length - 1)
			result.push(intervals[i].high);
	};

	return result;
};

jQuery.LegendRanges.prototype.deserializeIntervals = function (intervals) {
	var result = [];

	var i = 1;
	while (i < intervals.length - 1) {
		result.push({
			color: intervals[i],
			low: intervals[i - 1],
			high: intervals[i + 1]
		});

		i += 2;
	};

	return result;
};

jQuery.LegendRanges.prototype._smoothenLegendRange = function (range) {
	var p_low = Math.floor(Math.log(Math.abs(range.low)) / Math.LN10);
	var p_diff = Math.floor(Math.log(Math.abs(range.high - range.low)) / Math.LN10);
	var p_high = Math.floor(Math.log(Math.abs(range.high)) / Math.LN10);

	if (p_low == -Infinity) p_low = 0;
	if (p_diff == -Infinity) p_diff = Infinity;
	if (p_high == -Infinity) p_high = 0;

	var precision = Math.min(p_diff, p_low) - 1;
	var factor = Math.pow(10, precision);

	if (factor) {
		var smoothed = Math.round(range.low / factor) * factor;

		if (smoothed > range.low) {
			range.low -= factor;
			range.low = Math.round(range.low / factor) * factor;
		}
		else
			range.low = smoothed;

		range.low = Math.round(range.low / factor) * factor;
		range.low = Math.round(range.low * 100) / 100;
	}

	p_diff = Math.floor(Math.log(Math.abs(range.high - range.low)) / Math.LN10);
	precision = Math.min(p_diff, p_high) - 1;
	factor = Math.pow(10, precision);

	if (factor) {
		var smoothed = Math.round(range.high / factor) * factor;

		if (smoothed < range.high) {
			range.high += factor;
			range.high = Math.round(range.high / factor) * factor;
		}
		else
			range.high = smoothed;

		range.high = Math.round(range.high * 100) / 100;
	}
};

jQuery.LegendRanges.prototype._getGradient = function (start, end, count) {
	var invert = false;
	var lowColor, highColor;
	var result = [];

	if (start < end) {
		lowColor = start;
		highColor = end;
		invert = true;
	} else {
		lowColor = end;
		highColor = start;
	};

	for (var i = 0; i < count; i++) {
		var r = highColor >> 16;
		var g = highColor >> 8 & 0xFF;
		var b = highColor & 0xFF;

		var fraction = count == 1 ? 0 : i / (count - 1);

		r += ((lowColor >> 16) - r) * fraction;
		g += ((lowColor >> 8 & 0xFF) - g) * fraction;
		b += ((lowColor & 0xFF) - b) * fraction;

		result[i] = (r << 16 | g << 8 | b).toString(16);

		var zeroes = "";
		for (var j = result[i].length; j < 6; j++)
			zeroes += "0";

		result[i] = zeroes + result[i];
	}

	if (invert)
		result = result.reverse();

	return result;
};

jQuery.LegendRanges.prototype._sortRegionByValue = function (mapCodetoValue) {
	var getKeys = Object.keys || function (obj) {
		if (obj !== Object(obj)) throw new TypeError('Invalid object');
		var keys = [];
		for (var key in obj) if (Object.hasOwnProperty.call(obj, key)) keys[keys.length] = key;
		return keys;
	};

	var regionCodes = getKeys(mapCodetoValue);

	var values = [], i, j = 0;

	for (i in mapCodetoValue)
		values[j++] = mapCodetoValue[i] * 1;

	for (i = 0; i < values.length; i++)
		for (j = i + 1; j < values.length; j++) {
			if (values[i] > values[j]) {
				var temp = values[i];
				values[i] = values[j];
				values[j] = temp;

				temp = regionCodes[i];
				regionCodes[i] = regionCodes[j];
				regionCodes[j] = temp;
			}
		}

	return regionCodes;
};

jQuery.LegendRanges.prototype.getLegendRanges = function (count) {
	if (!this._timeSeries || this._timeSeries.length == 0)
		return [];

	// sort regions: this code works 5 times faster than previous.

	var keys = _.keys(this._timeSeries[0].data);
	var ts = this._timeSeries[0].data;

	var temp = _.chain(keys).map(function (key) {
		return {
			key: key,
			value: parseFloat(ts[key])
		}
	}).uniq('value').value();

	var data = {};

	for (var i = 0; i < temp.length; i++)
		data[temp[i].key] = temp[i].value;	
	
	var regions = this._sortRegionByValue(data);

	var legendRanges = [];
	var min = data[regions[0]];
	var range = { low: min, high: 0 };
	var lowVal = null;

	function addLegendRangeEntry(highVal) {
		range.high = highVal;
		this._smoothenLegendRange(range);
		legendRanges.push({ low: lowVal ? lowVal : range.low, high: range.high });
		range.low = range.high;
		lowVal = range.low;
	};

	if (Object.keys(data).length > 0) {
		if (this._legendScale == 'equalQuantiles') {
			var max = data[regions[regions.length - 1]];
			var valueGap = (max - min) / count;

			for (var i = 1; i <= count; i++)
				addLegendRangeEntry.call(this, min + i * valueGap);
		}
		else {
			var factor = Math.floor(regions.length / count);
			var indexForExtraRegions = count - (regions.length - factor * count);
			var j = -1;

			for (var i = 0; i < count; i++) {
				if (i >= indexForExtraRegions)
					j += 1;

				j += factor;

				if (j > -1 && j < regions.length)
					addLegendRangeEntry.call(this, data[regions[j]]);
			}
		}
	}

	return legendRanges;
};

jQuery.LegendRanges.prototype._getColors = function () {

	if (this._colors && this._colors.length > 0 && this._colors.length == this._colorSelection.intervalCount)
		return this._colors.map(function (item) { return item.replace('#', '') });

	if (this._colors && this._colors.length > 0 && this._colorSelection.intervalCount) {
		var colors = this._colors;
		switch (parseInt(this._colorSelection.intervalCount)) {
			case 2:
				colorCodes = [colors[0], colors[5]];
				break;
			case 4:
				colorCodes = [colors[0], colors[2], colors[3], colors[5]];
				break;
			case 5:
				colorCodes = [colors[0], colors[1], colors[2], colors[3], colors[4]];
				break;
			case 6:
				colorCodes = colors;
				break;
			default:
			case 3:
				colorCodes = [colors[0], colors[3], colors[5]];
				break;
		}
		return colorCodes.map(function (item) { return item.replace('#', '') });
	}
	else if (this._colorSelection != null && (this._colorSelection.intervalCount)) {
		var colorSelection = this._colorSelection;
		var intervals = colorSelection.intervalCount;
		var color1 = '0x' + colorSelection.startColor;
		var color2 = '0x' + (colorSelection.endColor || colorSelection.startColor);
	}
	else {

		//TODO Move this to Knoema.ThemePicker
		function getAppColor(colorName) {
			var appColors = {
				green: '#76933c',
				blue: '#366092',
				orange: '#e26b0a',
				gray: '#262626',
				violet: '#60497a',
				pink: '#993366',
				red: '#cc0000',
				maroon: '#800000'
			};
			if (colorName)
				return appColors[colorName.toLowerCase()];
			else
				return colorName;
		};

		color1 = getAppColor('gray').replace('#', '0x');
		color2 = getAppColor('blue').replace('#', '0x');
		intervals = 3;
	}

	var colors = this._getGradient(color1, color2, intervals);
	var regions = [];

	if (this._timeSeries)
		regions = this._sortRegionByValue(this._timeSeries[0].data);
	else
		return [];

	if (regions.length < colors.length)
		colors.splice(regions.length, colors.length - regions.length);

	return colors;
};

jQuery.LegendRanges.prototype.refreshLegendRanges = function () {
	if (this._legendIntervals) {
		var intervals = this.deserializeIntervals(this._legendIntervals);

		for (var i = 0; i < intervals.length; i++) {
			intervals[i].low = null;
			intervals[i].high = null;
		}

		return intervals;
	}

	return null;
};

jQuery.LegendRanges.prototype.getParsedIntervals = function () {
	if (this._legendIntervals) {
		var intervals = this.deserializeIntervals(this._legendIntervals);
		var ranges = this.getLegendRanges(intervals.length);

		var emptyRange = false;

		for (var i = 0; i < intervals.length; i++)
			if (!intervals[i].low && !intervals[i].high)
				emptyRange = true;

		if (emptyRange) {
			if (ranges.length > 0) {

				intervals.splice(ranges.length, intervals.length - ranges.length);

				for (var i = 0; i < intervals.length; i++)
					if (ranges[i]) {
						intervals[i].low = ranges[i].low;
						intervals[i].high = ranges[i].high;
					}
			}
			else
				intervals = [];
		}

		return intervals;
	}
	else {
		var colors = this._getColors();
		var ranges = this.getLegendRanges(colors.length);
		var result = [];

		colors.splice(ranges.length, colors.length - ranges.length);

		for (var i = 0; i < colors.length; i++)
			result.push({
				color: colors[i],
				low: ranges[i].low,
				high: ranges[i].high
			});

		return result;
	}
};

jQuery.LegendRanges.prototype._updateLegendColors = function () {
	if (this._legendIntervals) {
		var intervals = this.deserializeIntervals(this._legendIntervals);
		var colors = this._getColors();

		for (var i = 0; i < colors.length; i++)
			intervals[i].color = colors[i];

		return this.serializeIntervals(intervals);
	};

	return null;
};

jQuery.LegendRanges.prototype.getLegendIntervals = function () {
	return this._legendIntervals;
};

jQuery.LegendRanges.prototype.setIntervalColor = function (index, color) {
	var intervals = [];

	if (this._legendIntervals) {
		intervals = this.deserializeIntervals(this._legendIntervals);

		if (index < intervals.length)
			intervals[index].color = color;
	}
	else {
		var colors = this._getColors();

		for (var i = 0; i < colors.length; i++)
			intervals.push({
				color: i == index ? color : colors[i],
				low: null,
				high: null
			});
	}

	this._legendIntervals = this.serializeIntervals(intervals);
};