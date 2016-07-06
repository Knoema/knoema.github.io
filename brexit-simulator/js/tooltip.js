/// <reference path="jQuery/jquery-1.8.1.js" />

$(function () {
	window.tooltip = function () {
		var top = 3, left = -3, maxwidth = 300; //tooltip positioning
		var speed = 10, timer = 20, endalpha = 100, alpha = 0; //tooltip fading
		var height, width;
		var ie = document.all ? true : false;
		var $container = $('body');
		var $tooltip_div;
		return {
			show: function (text, borderColor, argWidth) {
				if ($container.find('.map-tooltip').length == 0) {
					$container.append('<div class="map-tooltip" style="opacity: 0;"/>');
					$container.find('.map-tooltip').append('<div class="map-tooltip-cont" />');
					document.onmousemove = this.pos;
				}
				$tooltip_div = $container.find('.map-tooltip');
				$tooltip_div.css('width', '');
				$tooltip_div.css('display', 'block');
				//$tooltip_div.find('.map-tooltip-cont').css('border-color', borderColor).html(text);
				$tooltip_div.find('.map-tooltip-cont').html(text);
				if (argWidth) {
					$tooltip_div.css('width', argWidth + 'px');
				}
				if (!ie) {
					var width = parseInt($tooltip_div.get(0).offsetWidth);
					if (width > maxwidth) {
						$tooltip_div.css('width', maxwidth + 'px');
					}
				} else {
					if (text.length == 4) {
						$tooltip_div.css('width', '46px');
					} else {
						$tooltip_div.css('width', '150px');
					}
				}
				height = parseInt($tooltip_div.get(0).offsetHeight) + top;
				clearInterval($tooltip_div.get(0).timer);
				$tooltip_div.get(0).timer = setInterval(function () { tooltip.fade(1) }, timer);
			},
			pos: function (e) {
				var gap = 15;
				var x = ie ? event.clientX + gap : e.pageX + gap;
				var y = ie ? event.clientY + gap : e.pageY + gap;
				$tooltip = $container.find('.map-tooltip');
				var parentWidth = $tooltip.parent().width();
				var parentHeight = $tooltip.parent().height();
				var tooltipWidth = $tooltip.width();
				var tooltipHeight = $tooltip.height();
				if ((x + tooltipWidth) > parentWidth) {
					x = x - gap - tooltipWidth;
					if (x < 0)
						x = parentWidth - gap - tooltipWidth;
				}
				if ((y + tooltipHeight) > parentHeight) {
					y = y - gap - tooltipHeight;
					if (y < 0)
						y = parentHeight - gap - tooltipHeight;
				}
				if (ie)
					y = y + document.documentElement.scrollTop;
				$tooltip.css({
					"left": x,
					"top" : y
				});
			},
			fade: function (delay) {
				var a = alpha;
				$tooltip_div = $container.find('.map-tooltip');
				if ((a != endalpha && delay == 1) || (a != 0 && delay == -1)) {
					var i = speed;
					if (endalpha - a < speed && delay == 1) {
						i = endalpha - a;
					} else if (alpha < speed && delay == -1) {
						i = a;
					}
					alpha = a + (i * delay);
					$tooltip_div.css('opacity', alpha * .01);
					$tooltip_div.css('filter', 'alpha(opacity=' + alpha + ')');
				} else {
					clearInterval($tooltip_div.get(0).timer);
					if (delay == -1) { $tooltip_div.css('display', 'none'); }
				}
			},
			hide: function () {
				if ($container.find('.map-tooltip').length == 0) {
					$container.append('<div class="map-tooltip" style="opacity: 0;"/>');
					$container.find('.map-tooltip').append('<div class="map-tooltip-cont" />');
					document.onmousemove = this.pos;
				}
				$tooltip_div = $container.find('.map-tooltip');
				clearInterval($tooltip_div.get(0).timer);
				$tooltip_div.get(0).timer = setInterval(function () { tooltip.fade(-1) }, timer);
			}
		};
	}();
});