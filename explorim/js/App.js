var access_token = '';

var params = Knoema.Helpers.parseHashParams();
if (params == null) {
	Knoema.Helpers.getAccessToken('Ysyd9Tw', window.location, false, 'publish');
}
else {
	if (typeof params["access_token"] !== 'undefined') {
		access_token = params["access_token"];
	}
}

function App() {
	this._map = null;
	this.geoPlaygroundId = 'zabecdg';
	this._layers = {};
    this.infoWindow = new google.maps.InfoWindow();
	this._divisionTypes = [{
		name: 'Nationale',
		className: 'nationale'
	}, {
		name: 'Région',
		className: 'region'
	}, {
		name: 'Département',
		className: 'department'
	}, {
		name: 'Communale',
		className: 'communale'
	}];
	this._activeRegionalDivision = null;
	this._activeAreaLayerId = null;
};

App.prototype.init = function () {

	this.loadTemplates($.proxy(function onTemplatesLoaded() {

		var $topButtons = $.tmpl('regional-divisions.html', {
			divisionTypes: this._divisionTypes,
			className2: 'btn btn-default'
		});

		var $modalButtons = $.tmpl('regional-divisions.html', {
			divisionTypes: this._divisionTypes,
			className2: 'regional-division-type'
		});

		var $modal = $('#regional-division-modal-switcher');
		$modal.find('.regional-division-buttons').empty().append($modalButtons);

        //TODO Restore this
        //TODO Init it in html somehow
		// $modal.modal({
		// 	open: true
		// });

		//top buttons
		$('#regional-division-map-switcher').empty().append($topButtons);

		this._map = new google.maps.Map($('#map-container')[0], {
			mapTypeId: google.maps.MapTypeId.HYBRID,
			mapTypeControl: false,
			zoom: 6,
			center: {
				lat: 20.215167,
				lng: -10.777588
			}
		});

		var self = this;
		//TODO Load all layers
		google.maps.event.addListenerOnce(this._map, 'idle', function () {

			var idleTimeout = window.setTimeout(function () {
				$.get('//knoema.com/api/1.0/frontend/resource/' + self.geoPlaygroundId + '/content', function(content) {

				    _.each(content.layers, function(layer, layerId) {
				        layer.layerId = layerId;
                    });

					var groupedLayers = _.groupBy(_.values(content.layers), function(f) { return f.groupping.groupName });

					var items = [
						{
							title: "Population et Infrastructures",
							className: 'infrastructures',
							children: [
								{
									title: "Infrastructures",
									children: [
										{
											title: "Les centres de santé",
											children: groupedLayers["Health Centers"]
										},
										{
											//'Water points'
											title: "Les points d'eau"
										},
										{
											//"Schools by town"
											title: "Les écoles par la ville"
										},
										{
											//"Roads"
											title: "Routes"
										},
										{
											//"Current projects"
											title: "Projets actuels"
										}
									]
								},
								{
									title: "Population",
									children: [
										{
											title: "Démographie",
											children: groupedLayers["Demography"]
										},
										{
											//"RGPH"
											title: "RGPH"
										},
										{
											//"Education"
											title: "Éducation",
											children: [
												{
													//"Bac results"
													name: "Bac résultats"
												},
												{
													//"Bepc results"
													name: "Bepc résultats"
												}
											]
										}
									]
								}
							]
						},
						{
							title: "La pluie et la végétation",
							className: 'climate',
							children: [
								{
									//"Past"
									title: "Passé",
									children: [
										{
											//"Vegetation"
											title: "Végétation"
										},
										{
											//"Rains"
											title: "Des pluies"
										}
									]
								},
								{
									//"Forecast"
									title: "Prévoir",
									children: [
										{
											//"Rains 7 days"
											title: "Rains 7 jours"
										},
										{
											//"Confidence"
											title: "Confiance"
										}
									]
								}
							]
						},
						{
							title: "Élections",
							className: 'elections',
							children: [
								{
									title: "Social",
									children: [
										{
											//"Actors"
											title: "Acteurs"
										},
										{
											//"Other tables"
											title: "Autres tables"
										}
									]
								},
								{
									//"Electoral roll"
									title: "Liste électorale"
								},
								{
									//"Results"
									title: "Résultats",
									children: [
										{
											title: "Présidentielle 2014",
											children: groupedLayers["Presidential 2014"]
										},
										{
											title: "2013 Parlementaire",
											children: groupedLayers["2013 Parliamentary"]
										}
									]
								}
							]
						}
					];

					var $filtersTree = $.tmpl('filters-tree.html', {
						items: items
					});

					//TODO Setup proper height in filters tree (and add handler in onResize)
					//$filtersTree

					$('#side-bar').find('.filters-holder').append($filtersTree);

					self.bindEvents();

					$(window).trigger('resize');

				});

			}, 300);

		});

	}, this));//end onTemplatesLoaded

};

App.prototype.switchDivision = function (division) {
	this._activeRegionalDivision = division;

	var $regionalDivisionMapSwitcher = $('#regional-division-map-switcher');

	$regionalDivisionMapSwitcher.find('.active').removeClass('active');
	$regionalDivisionMapSwitcher.find('a[data-division="' + division + '"]').addClass('active');

	//TODO Reload or something
	console.log('%cTODO Reload map (or active layer):', 'font-size:200%;color:red;');
};

App.prototype.onResize = function () {
	var windowHeight = $(window).height();
	var $sideBar = $('#side-bar');
	$sideBar.height($(window).height());
	$sideBar.find('.filters-holder').height(windowHeight - 180);
};

App.prototype.bindEvents = function () {
	var self = this;
	$('#regional-division-map-switcher').on('click', 'a', function(event) {
		self.switchDivision($(event.target).data('division'));
	});

	$('#regional-division-modal-switcher').on('click', '.regional-division-type', function() {
		self.switchDivision($(event.target).data('division'));
		$('#regional-division-modal-switcher').modal('hide');
	});

    $('#filters-tree').on('click', 'label', function(event) {
        if (event.target.tagName === 'INPUT') {
            var $target = $(event.target);
            var layerId = null;
            var layerType = $target.data('layerType');

            if (layerType === 'point') {
                layerId = $target.data('layerId');
                $target.prop('disabled', true);
                self.loadLayer(layerId);
            } else {
                //TODO Remove all other region layers from map
                //TODO Detect actual layerId (depends of this._activeRegionalDivision)
                console.log('===========================================');
                console.log('===========================================');
                console.log('data of region layer:', $target.data());
                console.log('===========================================');
                console.log('===========================================');
                debugger;
            }
        }
    });

	$(window).on('resize', $.proxy(this.onResize, this));

	//TODO Restore this:
	// $('#side-bar').find('.filters-holder').mCustomScrollbar({
	// 	theme: "dark"
	// });
};

App.prototype.loadLayer = function (layerId) {
	var self = this;
	if (this._layers[layerId]) {
        //TODO Add check if it is regional layer or not

        //layer.bounds == null means that layer is not displayed on the map
        if (this._layers[layerId].layer.bounds == null) {
            this._layers[layerId].load();
        } else {
            this._layers[layerId].clean();
        }
        $('input[data-layer-id="' + layerId + '"]').prop('disabled', false);
	}
	else {
		var infoWindow = new google.maps.InfoWindow();
		var layer = new GeoPlayground.Layer({
			map: self._map,
			layerId: layerId,
			geoPlaygroundId: self.geoPlaygroundId,
			infoWindow: infoWindow
		}, $.proxy(function (layerData) {
            _.each(this._layers[layerData.layerId].layer.markerClusterer.markers_, function(marker) {
                marker.addListener('click', function() {

                    var content = _.chain(_.keys(this.content))
                                            .map(function(key) {
                                                return {
                                                    key: key,
                                                    value: this.content[key]
                                                };
                                            }.bind(this))
                                            .value()
                                            .filter(function(entry) {
                                                return entry.value.toString() !== '';
                                            });

                    var $infoWindowContent = $.tmpl('info-window.html', {
                        hashMap: content
                    });
                    self.infoWindow.setContent($infoWindowContent[0].outerHTML);
                    self.infoWindow.setPosition(this.position);
                    self.infoWindow.open(self._map);
                });
            });
            //TODO Add check if it is regional layer or not
            $('input[data-layer-id="' + layerData.layerId + '"]').prop('disabled', false);
        }, this));
		layer.load();
		this._layers[layerId] = layer;
	}
};

App.prototype.loadTemplates = function (callback) {
	var self = this;
	function compileTemplate(templateSrc) {
		var templateId = this.url.replace('tmpl/', '');
		templateId = templateId.substring(0, templateId.indexOf('?'));
		$.template(templateId, templateSrc);
	}
	var templates = [
		$.get('tmpl/regional-divisions.html?random=' + Math.random(), compileTemplate),
		$.get('tmpl/filters-tree.html?random=' + Math.random(), compileTemplate),
        $.get('tmpl/info-window.html?random=' + Math.random(), compileTemplate)
	];
	$.when.apply(null, templates).done(function onTemplatesLoaded() {
		if ($.isFunction(callback)) {
			callback();
		}
	});
};
