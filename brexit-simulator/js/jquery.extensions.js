/// <reference path="../jquery-ui/widgets/jquery.ui.dialog.js" />

jQuery.fn.extend({
	busy: function (deferred) {
		if (!deferred)
			return;

		var $domElement = this;

		var div = $('<div class="loading"></div>');//<img src="./img/loader.gif" />
		
		var initialPosition = $domElement.css("position");
		if (initialPosition == "static") {
			$domElement.css("position", "relative");
		}
		$domElement.append(div);

		var img = div.find("img");
		img.css("position", "relative").css("top", ($domElement.height() - img.height()) / 2);

		deferred.then(function () {
			div.remove();
			if (initialPosition == "static") {
				$domElement.css("position", initialPosition);
			}
		});
	},
	busy2: function (deferred) {
		var $domElement = this;

		$domElement.fadeTo('fast', 0.5);

		deferred.then(function () {
			$domElement.fadeTo('fast', 1, function () {
				$domElement.css("filter", "");
			});
		});
	},

	knDialog: function (options) {
		if (options) {
			var duplicatedOptions = Knoema.Utils.objectClone(options);
			if (options.buttons) {
				duplicatedOptions.buttons = {};
				for (var buttonText in options.buttons) {
					duplicatedOptions.buttons[$.localize(buttonText, "~/Js/jQuery/jquery.extensions.js")] = options.buttons[buttonText];
				}
			}
			this.dialog(duplicatedOptions);
		}
		return this;
	}
});

jQuery.extend({
	displayError: function (jqXHR, thrownError) {
		$("div#site-error-details").attr("title", thrownError);

		var resp = jqXHR.responseText;

		var rxYSOD = /<!--\s*\[(.*?)]:(\s*.*\s(.*[\n\r]*)*?)\s*(at(.*[\n\r]*)*)-->/;
		if (rxYSOD.test(resp)) {
			var ysod = rxYSOD.exec(resp);
			resp = "<h3>" + ysod[1] + ":&nbsp;" + ysod[2] + "</h3><code><pre>" + ysod[4] + "</pre></code>";
			//errObj = { Message: ysod[2], StackTrace: ysod[4], ExceptionType: ysod[1] };
		};

		$("div#site-error-details").html(resp);
		$("div#site-error").slideDown();
	},
	resetError: function () {
		$("div#site-error").slideUp();
	}
});

$(document).ajaxSend(function (event, jqXHR, ajaxSettings) {
	if (ajaxSettings.url && (ajaxSettings.url.indexOf("/mini-profiler-resources/results?") === 0))
		return;
	$.resetError();
});

$(document).ajaxError(function (event, jqXHR, ajaxSettings, thrownError) {
	// Ignore MvcMiniProfiler AJAX requests
	if (ajaxSettings.url.slice(0, 32) == "/mini-profiler-resources/results")
		return;
	// Ignore aborted AJAX requests
	if (ajaxSettings.suppressAjaxError)
		return;
	if ((jqXHR.readyState == 0) && ((thrownError === '') || thrownError && $.inArray(thrownError, ["OK", "ok", "abort"]) > -1 ))
		return;
	// Ignore empty messages
	if (jqXHR.status == 204 && jqXHR.responseText == "")
		return;

	//KN-5634 IE9 fix
	if (jqXHR.status == 12017 && thrownError === '' && ajaxSettings.url.search("/resource/pin/") > -1)
		return;

	//KN-10037
	//See Knoema.SocialBar.prototype._fbCount: both IE8 and IE9 try to download file (it should have .json extension to be treated as json)
	//Paste this to IE8 address bar: http://graph.facebook.com/http%3A%2F%2Fknoema.org%2Fnwnfkne%2Fgdp-ranking-2012-data-and-charts
	//Same for http://knoema.org/resource/GoogleSharesCount?url=http%3A%2F%2Fknoema.org%2Fnwnfkne%2Fgdp-ranking-2012-data-and-charts	
	if (ajaxSettings.url.search("/resource/GoogleSharesCount") > -1)
		return;
	if (ajaxSettings.url.search("http://graph.facebook.com/") > -1)
		return;

	$.displayError(jqXHR, thrownError);
});

$.ajaxSetup({
	headers: { "Knoema-Data-Product": $("#data-product-id").val() }
});

$("a#site-error-hide").click(function () {
	$.resetError();
	return false;
});

$("a#site-error-details").click(function () {
	$.require(['/Js/jQuery/jquery-ui/widgets/jquery.ui.dialog.js'], function () {
		$("div#site-error-details").dialog({
			resizable: false,
			modal: true,
			minWidth: 640,
			maxWidth: 800,
			maxHeight: 600,
			buttons: {
				"Close": function () {
					var dlg = $(this).dialog("close");
				}
			}
		});
		return false;
	});
});

