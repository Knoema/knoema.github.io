var access_token = "";

(function () {

	var params = Knoema.Helpers.parseHashParams();
	if (params == null) {
		Knoema.Helpers.getAccessToken('Ysyd9Tw', window.location, false, 'publish');
	}
	else {
		if (typeof params["access_token"] !== 'undefined') {
			access_token = params["access_token"];
		}
	}

	var app = (function () {
		function app() {
			this._map = null;
			this.geoplaygroundId = 'zabecdg';
			this._layers = {};
			this._currentLayer = null;
		}
		app.prototype.init = function () {

			this._map = new google.maps.Map($('#map-container')[0], {
				mapTypeControl: false,
				zoom: 6,
				center: {
					lat: 20.215167,
					lng: -10.777588
				}
			});

			var self = this;
			$('#filters>ul li').on('click', function () {
				$('#filters>ul li').removeClass('active');
				$(this).addClass('active');
			});

			$('.item-content li').on('click', function () {
				var input = $(this).find('input');
				if (input.prop('checked')) {
					input.prop('checked', false);
				}
				else {
					$('.item-content li input').prop('checked', false);
					input.prop('checked', true);

					var layerId = input.val();
					self.loadLayer(layerId);
				}
			});
		};

		return app;
	})();

	app.prototype.loadLayer = function (layerId) {
		var self = this;
		this.cleanLayer(this._currentLayer);

		if (this._layers[layerId]) {
			this._layers[layerId].load();
		}
		else {
			var infoWindow = new google.maps.InfoWindow();
			var layer = new GeoPlayground.Layer({
				map: self._map,
				layerId: layerId,
				geoPlaygroundId: self.geoplaygroundId,
				infoWindow: infoWindow
			}, function (layerData) {
			});

			layer.load();
			this._layers[layerId] = layer;
		}

		this._currentLayer = layerId;
	};

	app.prototype.cleanLayer = function (layerId) {
		if (!this._layers[layerId]) {
			return;
		}
		this._layers[layerId].clean();
	};


	var app = new app();
	app.init();
})();