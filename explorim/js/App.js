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

$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});

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
	this._activeDate = null;
	this.byTime = null;
	this._activeRegionalDivision = null;
	this._activeGroupCuid = null;
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

					//TODO Restore this
					//TODO Init it in html somehow
					$modal.modal({
						open: true
					});

					$(window).trigger('resize');

				});

			}, 300);

		});

	}, this));//end onTemplatesLoaded

};

App.prototype.onResize = function () {

	var windowHeight = $(window).height();
	var $sideBar = $('#side-bar');
	$sideBar.height($(window).height());

	$('#map-container').height(windowHeight - $('#timeline').height());

    var filtersHolderHeight = windowHeight - 180;

	$sideBar.find('.filters-holder').height(filtersHolderHeight);

    var mapAndTimelineWidth = $(window).width() - $sideBar.width();

    $('.time-members-holder').width(mapAndTimelineWidth - 50); //50 width of slide-control

	// $('#timeline').width(mapAndTimelineWidth);
	// $('#timeline').css({
	// 	'top': $('#map-container').height()
	// });

    var panelHeadingHeight = $sideBar.find('.panel-heading').first().height();
    var topLevelSectionHeight = filtersHolderHeight - 3 * panelHeadingHeight - 26;//26 for margin/padding

    $sideBar.find('.panel-body').css({
        'max-height': topLevelSectionHeight,
        'height': topLevelSectionHeight
    });

};

App.prototype.switchDivision = function (division, reloadLayer) {
	this._activeRegionalDivision = division;

	var $switcher = $('#regional-division-map-switcher');

	$switcher.find('.active').removeClass('active');
	$switcher.find('a[data-division="' + division + '"]').addClass('active');

    var enabledRegionTypes;
    if (this._activeGroupCuid) {
        var existingLayers = $('#' + this._activeGroupCuid).data('layers');
        enabledRegionTypes = _.map(existingLayers, 'name');
    }

    if (division === 'Nationale') {
        this._map.setZoom(Math.min(5, this._map.getZoom()));
    }

    //TODO Remove enabled....
	if (enabledRegionTypes) {
		$switcher.find('a').each($.proxy(function(i, element) {
			var $a = $(element);
			if (_.indexOf(enabledRegionTypes, $a.data('division')) < 0) {
				$a.addClass('disabled');
			}
		}, this));
	} else {
		$switcher.find('a').removeClass('disabled');
	}

    //TODO Find layerGroup by cuid, get proper layer id and load it
	if (reloadLayer) {
        var $activeGroup = $('#' + this._activeGroupCuid);
        if ($activeGroup.length) {
            var layer = _.find($activeGroup.data().layers, $.proxy(function(layer) {
                return layer.name === division;
            }, this));
            this.loadLayer(layer.layerId, 'region');
        }
    }
};

App.prototype.bindEvents = function () {
	var self = this;
	$('#regional-division-map-switcher').on('click', 'a', function(event) {
		self.switchDivision($(event.target).data('division'), true);
	});

	$('#regional-division-modal-switcher').on('click', '.regional-division-type', function() {
		self.switchDivision($(event.target).data('division'), false);
		$('#regional-division-modal-switcher').modal('hide');
	});

    $('#side-bar').on('click', '.clear-filters', $.proxy(function () {
        _.each(this._layers, function (layer) {
            //TODO Consider clear region layer as well
            layer.clean();
        });
        this._activeGroupCuid = null;
        this._activeAreaLayerId = null;
        $('#side-bar').find('input').prop('checked', false);
    }, this));

    $('#filters-tree').on('click', 'label', $.proxy(function(event) {
        if (event.target.tagName === 'INPUT') {
            var $target = $(event.target);
            var layerId, activeRegionalDivision;
            var layerType = $target.data('layerType');

            if (layerType === 'point') {
                layerId = $target.data('layerId');
                $target.prop('disabled', true);
                this.loadLayer(layerId, 'point');
            } else {

                if (this._activeGroupCuid) {
                    $('#' + this._activeGroupCuid).prop('checked', false);
                }

                var layers = $target.data('layers');
                var groupCuid = $target[0].id;
                this._activeGroupCuid = groupCuid;

				var layer = _.find(layers, function(layer) {
					return layer.name === this._activeRegionalDivision;
				}.bind(this));
				if (!layer) {
					layerId = layers[0].layerId;
					activeRegionalDivision = layers[0].name;
				} else {
					layerId = layer.layerId;
					activeRegionalDivision = this._activeRegionalDivision;
				}
				this.switchDivision(activeRegionalDivision, false);
				this.loadLayer(layerId, 'region');
            }
        }
    }, this));

    // show.bs.collapse	This event fires immediately when the show instance method is called.
    // shown.bs.collapse	This event is fired when a collapse element has been made visible to the user (will wait for CSS transitions to complete).
    // hide.bs.collapse	This event is fired immediately when the hide method has been called.
    // hidden.bs.collapse	This event is fired when a collapse element has been hidden from the user (will wait for CSS transitions to complete).

    $('#filters-tree').find('.item-content').on('show.bs.collapse', function() {
        $(this).closest('.item-content-level-0').find('.scroll-content').mCustomScrollbar('destroy');
    });
	//TODO Combine with previous somehow
	$('#filters-tree').find('.item-content').on('hide.bs.collapse', function() {
		$(this).closest('.item-content-level-0').find('.scroll-content').mCustomScrollbar('destroy');
	});

    $('#filters-tree').find('.item-content').on('shown.bs.collapse', function() {
        $(this).closest('.item-content-level-0').find('.scroll-content').mCustomScrollbar({
            theme: 'dark'
        });
    });

	$('#timeline').on('click', '.time-member', $.proxy(function(e) {
		var $timeMember = $(e.target);
		$timeMember.siblings().removeClass('active');
		$timeMember.addClass('active');
		this._activeDate = $timeMember.data('timeMember');
		console.log('%cTODO Reload layer in according to _activeDate', 'color:red;font-size:200%;');
	}, this));

    $('#timeline').on('click', '.slide-control', $.proxy(function(e) {
        var $this = $(e.target);
        var $timeMembers = $('#timeline').find('.time-members');
        var pos = $timeMembers.position();

        if ($this.hasClass('slide-control-left') || $this.parent().hasClass('slide-control-left')) {
            // if (pos.left < 50) {
            // }
            //TODO Add check for width & count of cells

            var mapAndTimelineWidth = $(window).width() - $('#side-bar').width();
            var visibleTimeMembersWIdth = mapAndTimelineWidth - 100;

            //TODO Allow move if one of members hidden (just count how much members can fit to given width)

            if (visibleTimeMembersWIdth + pos.left > 200) {
                $timeMembers.animate({
                    left: pos.left - 100
                });
            } else {
                //TODO Apply shake
            }

        } else if ($this.hasClass('slide-control-right') || $this.parent().hasClass('slide-control-right')) {
            if (pos.left < 50) {
				$timeMembers.animate({
					left: pos.left + 100
				});
            } else {
				//TODO Apply shake
			}
        }

    }, this));

	$(window).on('resize', $.proxy(this.onResize, this));
};

App.prototype.loadLayer = function (layerId, layerType) {
	var self = this;
	//TODO What to do if selected "Communale" but only two layers exist
	if (this._layers[layerId]) {

        if (layerType && layerType === 'region' && this._activeAreaLayerId != null) {
            this._layers[this._activeAreaLayerId].clean();
        }

        //layer.bounds == null means that layer is not displayed on the map
        if (this._layers[layerId].layer.bounds == null) {
            this._layers[layerId].load();
        } else {
            this._layers[layerId].clean();
        }
        $('input[data-layer-id="' + layerId + '"]').prop('disabled', false);
	}
	else {

        if (layerType && layerType === 'region' && this._activeAreaLayerId != null) {
            this._layers[this._activeAreaLayerId].clean();
        }

		var layer = new GeoPlayground.Layer({
			map: self._map,
			layerId: layerId,
			geoPlaygroundId: self.geoPlaygroundId,
			infoWindow: self.infoWindow
		}, $.proxy(function (layerData) {
			if (layerData.layer.layerType === 'point') {
				_.each(this._layers[layerData.layerId].layer.markerClusterer.markers_, function(marker) {
					marker.addListener('click', function() {
						console.log("----------- Marker's content -----------");
						console.log(this);
						console.log(this.content);
						console.log("----------/ Marker's content -----------");
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
			} else {

				//layerData.layer.data is pivotResponse
				this.byTime = _.groupBy(data, function(tuple) {
					//TODO Format using Knoema.Utils & our custom frequencies
					return tuple.Time.substring(0, 4);
				});

				debugger;

                this._activeAreaLayerId = layerData.layerId;
			}

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
