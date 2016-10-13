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
	this._divisionTypes = [
        // {
        //     name: 'Nationale',
        //     className: 'nationale'
        // },

        {
            name: 'Région',
            className: 'region'
        },
        {
            name: 'Département',
            className: 'department'
        },
        {
            name: 'Communale',
            className: 'communale'
        }
	];
	this._activeDate = null;
	this.byTime = null;
	this._activeRegionalDivision = null;
	this._activeGroupCuid = null;
    this._activeAreaLayerId = null;
    this._regionsComponent = null;
    this._layerTitles = {};
};

App.prototype.init = function () {

	this.loadTemplates($.proxy(function onTemplatesLoaded() {

	    var self = this;

		var $modalButtons = $.tmpl('regional-divisions.html', {
			divisionTypes: this._divisionTypes,
			className2: 'regional-division-type'
		});

		var $modal = $('#regional-division-modal-switcher');
		$modal.find('.regional-division-buttons').empty().append($modalButtons);

        var url = '//explorim.knoema.com/api/1.0/meta/dataset/ftqbdwb/dimension/region?access_token=' + access_token ;

        $.getJSON(url).then(function(data) {

            //TODO Restore filter
            // var regions = _.filter(data.items, function(item) {
            //     return item.level > 0 && item.key < 1000660 && !_.isUndefined(item.fields.regionid);
            // });

            var regions = data.items;

            var $regionsDropdown = $.tmpl('regions-dropdown.html', {
                regions: regions
            });

            this._regionsComponent = new GeoPlayground.Components.Regions({
                map: self._map,
                style: {
                    strokeWeight: 1,
                    strokeColor: 'white',
                    fillColor: 'white',
                    visible: true,
                    clickable: false
                },
                geoJsonFile: 'mauritania.json',
                onSelectRegion: function(regionId, dataLayer, feature) {
                    //mapsObject.panBy(200, 100)
                    //panTo(latLng:LatLng|LatLngLiteral)
                }
            });

            $('#top-map-buttons').find('.dropdown-holder').append($regionsDropdown);
            $regionsDropdown.selectpicker();

        }.bind(this));

		this._map = new google.maps.Map($('#map-container')[0], {
			mapTypeId: google.maps.MapTypeId.HYBRID,
			mapTypeControl: false,
			zoom: 6,
			center: {
				lat: 20.215167,
				lng: -10.777588
			}
		});

		google.maps.event.addListenerOnce(this._map, 'idle', function () {

			var idleTimeout = window.setTimeout(function () {
				$.get('//knoema.com/api/1.0/frontend/resource/' + self.geoPlaygroundId + '/content', function(content) {

				    _.each(content.layers, function(layer, layerId) {
				        layer.layerId = layerId;
                        if (layer.tooltip) {
                            _.each(_.keys(layer.tooltip), function(entry) {
                                if (layer.tooltip[entry].state === 'title') {

                                    layer.tooltip[entry].titleField = layer.tooltip[entry].text;

                                    layer.titleField = layer.tooltip[entry].text;
                                    self._layerTitles[layerId] = layer.tooltip[entry].text;
                                }
                            });
                        }
                    });

					var groupedLayers = _.groupBy(_.values(content.layers), function(f) { return f.groupping.groupName });

					var items = [
                        {
                            title: "Economique et social",
                            className: "infrastructures",
                            children: [
                                {
                                    title: "Infrastructures",
                                    children: [

                                        //TODO Remove this ===============================================
                                        //TODO Remove this ===============================================
                                        //TODO Remove this ===============================================
                                        // {
                                        //     title: "Routes DDDDD",
                                        //     children: [
                                        //         {
                                        //             title: "Routes 1",
                                        //             children: [
                                        //                 {
                                        //                     title: "Routes 1-1",
                                        //                     children: [
                                        //                         {
                                        //                             title: "Routes 1-1-1"
                                        //                         },
                                        //                         {
                                        //                             title: "Schools",
                                        //                             children: [
                                        //                                 {
                                        //                                     title: "Primary Schools",
                                        //                                     children: groupedLayers["Primary Schools"]
                                        //                                 },
                                        //                                 {
                                        //                                     title: "Secondary Schools",
                                        //                                     children: groupedLayers["Secondary Schools"]
                                        //                                 }
                                        //                             ]
                                        //                         }
                                        //                     ]
                                        //                 },
                                        //                 {
                                        //                     title: "Routes 1-2"
                                        //                 }
                                        //             ]
                                        //         },
                                        //         {
                                        //             title: "Routes 2"
                                        //         }
                                        //     ]
                                        // },
                                        //TODO Remove this ===============================================
                                        //TODO Remove this ===============================================
                                        //TODO Remove this ===============================================

                                        {
                                            title: "Routes"
                                        },
                                        {
                                            title: "Projets actuels"
                                        },
                                        {
                                            title: "Télécommunications"
                                        },
                                        {
                                            title: "Electricité"
                                        },
                                        {
                                            title: "Les écoles par la ville",
                                            children: [
                                                {
                                                    title: "École Primaire",
                                                    children: groupedLayers["Primary Schools"]
                                                },
                                                {
                                                    title: "École Secondaire",
                                                    children: groupedLayers["Secondary Schools"]
                                                }
                                            ]
                                        },
                                        {
                                            title: "Les points d'eau",
                                            children: groupedLayers["Water Wells"]
                                        },
                                        {
                                            title: "Les centres de santé",
                                            children: groupedLayers["Health Centers"]
                                        },
                                        {
                                            title: "Autres services publics"
                                        }
                                    ]
                                },
                                {
                                    title: "Population",
                                    children: [
                                        {
                                            //title: "RGPH",
                                            title: "Recensement Général de la Population et de l'Habitat (RGPH)",
                                            children: [
                                                {
                                                    title: "Habitat"
                                                },
                                                {
                                                    title: "Équipments de la maison"
                                                },
                                                {
                                                    title: "Cuisine eclairage eau"
                                                },
                                                {
                                                    title: "Assainissement"
                                                }
                                            ]
                                        },
                                        {
                                            title: "Éducation",
                                            children: [
                                                {
                                                    name: "Bac résultats"
                                                },
                                                {
                                                    name: "Bepc résultats"
                                                }
                                            ]
                                        },
                                        {
                                            title: "Santé"
                                        },
                                        {
                                            title: "Male Population",
                                            children: groupedLayers["Demography. Male Population"]
                                        },
                                        {
                                            title: "Female Population",
                                            children: groupedLayers["Demography. Female Population"]
                                        },
                                        {
                                            title: "Total Population",
                                            children: groupedLayers["Demography. Total Population"]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            title: "Zone de vie",
                            className: "zone-de-ville",
                            children: [
                                {
                                    title: "Pêches"
                                },
                                {
                                    title: "Immigration illégale"
                                },
                                {
                                    title: "Zones agricoles"
                                },
                                {
                                    title: "Elevage"
                                },
                                {
                                    title: "Végétation"
                                },
                                {
                                    title: "Trafic",
                                    children: [
                                        {
                                            title: "Humains",
                                            children: [
                                                {
                                                    title: "Esclavage, employé"
                                                },
                                                {
                                                    title: "Exclavage, sexe"
                                                }
                                            ]
                                        },
                                        {
                                            title: "Stupéfiants"
                                        },
                                        {
                                            title: "Armes"
                                        }
                                    ]
                                },
                                {
                                    title: "Terrorisme et les conflits",
                                    children: [
                                        {
                                            title: "Incidents de terrorisme"
                                        },
                                        {
                                            title: "Les conflits armés"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            title: "Pluies",
                            className: "climate",
                            children: [
                                {
                                    title: "Pluies #0"
                                },
                                {
                                    title: "Pluies #1"
                                }
                            ]
                        },
                        {
                            title: "Politique",
                            className: "politics",
                            children: [
                                {
                                  title: "Mahadras"
                                },
                                {
                                    title: "Tribus"
                                },
                                {
                                    title: "Social",
                                    children: [
                                        {
                                            title: "FA et Sec"
                                        },
                                        {
                                            title: "Cadres"
                                        },
                                        {
                                            title: "Fonctionnaires",

                                            //TODO Refactor Fonctionnaires
                                            children: groupedLayers["Fonctionnaires"]

                                            //     [
                                            //     {
                                            //         title: "Actif dans la région"
                                            //     },
                                            //     {
                                            //         title: "De la région"
                                            //     },
                                            //     {
                                            //         title: "Affecté"
                                            //     },
                                            //     {
                                            //         title: "Originaire de"
                                            //     },
                                            //     {
                                            //         title: "Fonction actuelle"
                                            //     },
                                            //     {
                                            //         title: "NNI"
                                            //     },
                                            //     {
                                            //         title: "prénom"
                                            //     },
                                            //     {
                                            //         title: "Date de naissance"
                                            //     },
                                            //     {
                                            //         title: "Lieu de naissance"
                                            //     },
                                            //     {
                                            //         title: "Crédit"
                                            //     }
                                            // ]
                                        },
                                        {
                                            title: "Hommes d'affaires",
                                            children: [
                                                {
                                                    title: "Actif dans la région"
                                                },
                                                {
                                                    title: "De la région"
                                                },
                                                {
                                                    title: "NNI"
                                                },
                                                {
                                                    title: "Prénom"
                                                },
                                                {
                                                    title: "Date de naissance"
                                                },
                                                {
                                                    title: "Lieu de naissance"
                                                },
                                                {
                                                    title: "Crédit"
                                                }
                                            ]
                                        },
                                        {
                                            title: "Acteurs politiques",
                                            children: [
                                                {
                                                    title: "Mandat"
                                                },
                                                {
                                                    title: "Parti politique"
                                                },
                                                {
                                                    title: "NNI"
                                                },
                                                {
                                                    title: "Prénom"
                                                },
                                                {
                                                    title: "Date de naissance"
                                                },
                                                {
                                                    title: "Lieu de naissance"
                                                },
                                                {
                                                    title: "Crédit"
                                                }
                                            ]
                                        },
                                        {
                                            title: "Notable"
                                        }
                                    ]
                                },
                                {
                                    title: "Élections",
                                    children: [
                                        {
                                            title: "Résultats Elections",
                                            children: [
                                                {
                                                    title: "Présidentielle 2014",
                                                    children: [
                                                        {
                                                            title: "Mohamed Ould Abdel Aziz",
                                                            children: groupedLayers["Presidential Election. Mohamed Ould Abdel Aziz"]
                                                        },
                                                        {
                                                            title: "Boïdiel Ould Houmeit",
                                                            children: groupedLayers["Presidential Election. Boïdiel Ould Houmeit"]
                                                        },
                                                        {
                                                            title: "Laila Maryam Mint Moulaye Idriss",
                                                            children: groupedLayers["Presidential Election. Laila Maryam Mint Moulaye Idriss"]
                                                        },
                                                        {
                                                            title: "Biram Dah Abeid",
                                                            children: groupedLayers["Presidential Election. Biram Dah Abeid"]
                                                        },
                                                        {
                                                            title: "Ibrahima Moctar Sarr",
                                                            children: groupedLayers["Presidential Election. Ibrahima Moctar Sarr"]
                                                        },
                                                        {
                                                            title: "Votants Total",
                                                            children: groupedLayers["Presidential Election. Votants Total"]
                                                        },
                                                        {
                                                            title: "Inscrits Total",
                                                            children: groupedLayers["Presidential Election. Votants Total"]
                                                        },
                                                        {
                                                            title: "Bulletins Blanc",
                                                            children: groupedLayers["Presidential Election. Bulletins Blanc"]
                                                        },
                                                        {
                                                            title: "Bulletins Nulls",
                                                            children: groupedLayers["Presidential Election. Bulletins Nulls"]
                                                        }
                                                    ]
                                                },
                                                {
                                                    title: "2013 Parlementaire",
                                                    children: [
                                                        {

                                                            title: "APP + Tawassul",
                                                            children: groupedLayers["Parliamentary Election. APP + Tawassul"]
                                                        },
                                                        {
                                                            title: "Alliance for Democracy in Mauritania (ADM)",
                                                            children: groupedLayers["Parliamentary Election. Alliance for Democracy in Mauritania (ADM)"]
                                                        },
                                                        {
                                                            title: "Alliance for Justice and Democracy / Movement for Renovation (AJD / MR)",
                                                            children: groupedLayers["Parliamentary Election. Alliance for Justice and Democracy / Movement for Renovation (AJD / MR)"]
                                                        },{
                                                            title: "APP + Tawassul",
                                                            children: groupedLayers["Parliamentary Election. APP + Tawassul"]
                                                        },{
                                                            title: "Popular Front (FP)",
                                                            children: groupedLayers["Parliamentary Election. Popular Front (FP)"]
                                                        },{
                                                            title: "The People's Progressive Alliance (APP)",
                                                            children: groupedLayers["Parliamentary Election. The People's Progressive Alliance (APP)"]
                                                        },{
                                                            title: "El Islah Party",
                                                            children: groupedLayers["Parliamentary Election. El Islah Party"]
                                                        },{
                                                            title: "Ravah Party",
                                                            children: groupedLayers["Parliamentary Election. Ravah Party"]
                                                        },{
                                                            title: "Party of Unity and Development (PUD)",
                                                            children: groupedLayers["Parliamentary Election. Party of Unity and Development (PUD)"]
                                                        },{
                                                            title: "Party of the Union for the Republic (UPR)",
                                                            children: groupedLayers["Parliamentary Election. Party of the Union for the Republic (UPR)"]
                                                        },{
                                                            title: "Dignity and Action Party (PDA)",
                                                            children: groupedLayers["Parliamentary Election. Dignity and Action Party (PDA)"]
                                                        },{
                                                            title: "Democratic Party of the People (PPD)",
                                                            children: groupedLayers["Parliamentary Election. Democratic Party of the People (PPD)"]
                                                        },{
                                                            title: "El Karam Party",
                                                            children: groupedLayers["Parliamentary Election. El Karam Party"]
                                                        },{
                                                            title: "EL VADILA Party",
                                                            children: groupedLayers["Parliamentary Election. EL VADILA Party"]
                                                        },{
                                                            title: "EL WIAM Party",
                                                            children: groupedLayers["Parliamentary Election. EL WIAM Party"]
                                                        },{
                                                            title: "Rally for Unity Party (MAJD)",
                                                            children: groupedLayers["Parliamentary Election. Rally for Unity Party (MAJD)"]
                                                        },{
                                                            title: "Republican Party for Democracy and Renewal (RDRP)",
                                                            children: groupedLayers["Parliamentary Election. Republican Party for Democracy and Renewal (RDRP)"]
                                                        },{
                                                            title: "RibatDémocratique Party and Social (RDS)",
                                                            children: groupedLayers["Parliamentary Election. RibatDémocratique Party and Social (RDS)"]
                                                        },{
                                                            title: "Sawab Party",
                                                            children: groupedLayers["Parliamentary Election. Sawab Party"]
                                                        },{
                                                            title: "Third Generation Party (PTG)",
                                                            children: groupedLayers["Parliamentary Election. Third Generation Party (PTG)"]
                                                        },{
                                                            title: "National Rally for Reform and Development (tawassul)",
                                                            children: groupedLayers["Parliamentary Election. National Rally for Reform and Development (tawassul)"]
                                                        },{
                                                            title: "Democratic Renewal (RD)",
                                                            children: groupedLayers["Parliamentary Election. Democratic Renewal (RD)"]
                                                        },{
                                                            title: "Sawab + WIAM",
                                                            children: groupedLayers["Parliamentary Election. Sawab + WIAM"]
                                                        },{
                                                            title: "Startle Youth for the Nation (SURSAUT)",
                                                            children: groupedLayers["Parliamentary Election. Startle Youth for the Nation (SURSAUT)"]
                                                        },{
                                                            title: "Union of the Democratic Centre (U.C.D)",
                                                            children: groupedLayers["Parliamentary Election. Union of the Democratic Centre (U.C.D)"]
                                                        },{
                                                            title: "Union for Democracy and Progress (UDP)",
                                                            children: groupedLayers["Parliamentary Election. Union for Democracy and Progress (UDP)"]
                                                        },{
                                                            title: "Total",
                                                            children: groupedLayers["Parliamentary Election. Total"]
                                                        }
                                                    ]
                                                },
                                                {
                                                    title: "2013 Municipale",
                                                    children: [

                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            title: "Listes électorales",
                                            children: [
                                                {
                                                    title: "Les députés",
                                                    children: groupedLayers["Liste électorale. Number of MPs"]
                                                },
                                                {
                                                    title: "Conseillers",
                                                    children: groupedLayers["Liste électorale. Number of councilors"]
                                                },
                                                {
                                                    title: "Maires",
                                                    children: groupedLayers["Liste électorale. Number of mayors"]
                                                },
                                                {
                                                    title: "Bureaux de vote",
                                                    children: groupedLayers["Liste électorale. Number of polling stations"]
                                                },
                                                {
                                                    title: "Électeurs",
                                                    children: groupedLayers["Liste électorale. Number of voters"]
                                                },
                                                {
                                                    title: "Poids",
                                                    children: groupedLayers["Liste électorale. Weight"]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
					];

					var $filtersTree = $.tmpl('filters-tree.html', {
						items: items
					});

					$('#side-bar').find('.filters-holder').append($filtersTree);

					self.bindEvents();

                    $modal.modal('show');

                    $('.map-and-timeline').find('.loading').css({
                        "z-index": 0
                    });

					$(window).trigger('resize');

				});

			}, 300);

		});

	}, this));//end onTemplatesLoaded

};

App.prototype.onResize = function () {

    var timelineHeight = $('#timeline').height();

	var windowHeight = $(window).height();
	var $sideBar = $('#side-bar');
	$sideBar.height($(window).height());

	$('#map-container').height(windowHeight - $('#timeline').height());

    var filtersHolderHeight = windowHeight - 180;

	$sideBar.find('.filters-holder').height(filtersHolderHeight);

    var mapAndTimelineWidth = $(window).width() - $sideBar.width();

    $('.time-members-holder').width(mapAndTimelineWidth - 50); //50 width of slide-control

    var panelHeadingHeight = $sideBar.find('.panel-heading').first().height();
    var topLevelSectionHeight = filtersHolderHeight - $sideBar.find('.panel-heading').length * panelHeadingHeight - 26;//26 for margin/padding

    $sideBar.find('.panel-body').css({
        'max-height': topLevelSectionHeight,
        'height': topLevelSectionHeight
    });

    $('#right-side-bar').css({
        "height": windowHeight - timelineHeight
    });

};

App.prototype.switchDivision = function (division, reloadLayer, layerId, availableLayers) {
	this._activeRegionalDivision = division;

	var $switcher = $('#regional-division-map-switcher');

	$switcher.find('.active').removeClass('active');
    $switcher.find('.disabled').removeClass('disabled');
	$switcher.find('a[data-division="' + division + '"]').addClass('active');

    $('#regional-division-modal-switcher').modal('hide');

    var enabledRegionTypes;
    if (this._activeGroupCuid) {
        var existingLayers = $('#' + this._activeGroupCuid).data('layers');
        enabledRegionTypes = _.map(existingLayers, 'name');
    }

    if (availableLayers) {
        enabledRegionTypes = availableLayers;
    }

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

	if (reloadLayer) {
        var $activeGroup = $('#' + this._activeGroupCuid);
        if ($activeGroup.length) {
            var layer = _.find($activeGroup.data().layers, $.proxy(function(layer) {
                return layer.name === division;
            }, this));

            if (layer) {
                this.loadLayer(layer.layerId, 'region');
            } else {
                //this.loadLayer(layer.layerId, 'region');
            }

        }
    }
};

App.prototype.bindEvents = function () {
	var self = this;

    $('#zoom-to-country').on('click', function() {
        this._map.setZoom(Math.min(5, this._map.getZoom()));
    }.bind(this))

	$('#regional-division-map-switcher').on('click', 'a', function(event) {
		self.switchDivision($(event.target).data('division'), true, $(event.target).data('layerId'));
	});

	$('#regional-division-modal-switcher').on('click', '.regional-division-type', function() {
		self.switchDivision($(event.target).data('division'), false);
	});

    $('#side-bar').on('click', '.clear-filters', $.proxy(function () {
        _.each(this._layers, function (layer) {
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

                layerId = $target.data('layerId');
                var layers = $target.data('layers');

                if (layerId) {
                    //Simple region layer (no sublayers like Regionale, Department, Communale)

                    if ($target.is(':checked')) {
                        this.loadLayer(layerId, 'region');
                    } else {
                        this._layers[layerId].clean();
                        this.hideLegend();
                    }

                } else {
                    //"Grouped" data layer (one layer consists of Regionale, Department, Communale)
                    if (this._activeGroupCuid) {
                        $('#' + this._activeGroupCuid).prop('checked', false);
                    }

                    var groupCuid = $target[0].id;

                    var layer = _.find(layers, function(layer) {
                        return layer.name === this._activeRegionalDivision;
                    }.bind(this));

                    var availableLayers = _.map(layers, function(layer) {
                        return layer.name;
                    });

                    if (!layer && layers[0]) {
                        layerId = layers[0].layerId;
                        activeRegionalDivision = layers[0].name;
                    } else if (layer) {
                        layerId = layer.layerId;
                        activeRegionalDivision = layer.name;
                    }

                    if (layerId && this._activeGroupCuid != groupCuid) {
                        this.switchDivision(activeRegionalDivision, false, null, availableLayers);
                        this._activeGroupCuid = groupCuid;

                        $('#regional-division-map-switcher').find('a').each(function(i, a) {
                            var $a = $(a);
                            var layer  = _.find(layers, function(layer) {return layer.name == $a.data('division')});
                            var layerId = layer ? layer.layerId : null;
                            $a.data('layerId', layerId);
                        });

                        this.loadLayer(layerId, 'region');
                    } else if (layerId && this._activeGroupCuid == groupCuid) {
                        this._activeGroupCuid = null;
                        $('#regional-division-map-switcher').find('a').data('layer-id', null);
                        this._layers[layerId].clean();
                    }

                }
            }
        }
    }, this));

    // show.bs.collapse	This event fires immediately when the show instance method is called.
    // hide.bs.collapse	This event is fired immediately when the hide method has been called.
    $('#filters-tree').find('.item-content').on('show.bs.collapse hide.bs.collapse', function() {
        $(this).closest('.item-content-level-0').find('.scroll-content').mCustomScrollbar('destroy');
    });

    // shown.bs.collapse	This event is fired when a collapse element has been made visible to the user (will wait for CSS transitions to complete).
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

    $('#select-region').on('hidden.bs.select', function (e) {

        var $selected = $('#select-region').find(':selected');

        var regionId = $selected.data('regionId');
        var regionName = $selected.data('name');

        dataDescriptor.Filter[0].Members = [$('#select-region').val()];

        $('#map-container').css({
            "width": $(window).width() - 400 - 350
        });

        google.maps.event.trigger(this._map, "resize");

        this._regionsComponent.select(regionId);

        $('#right-side-bar').find('.header').html(regionName);
        $('#right-side-bar').find('.side-bar-content').empty().append($('<span class="glyphicon glyphicon-cog fa-spin" aria-hidden="true" title="Loading..."></span>'));

        $('#right-side-bar').animate({
            "right": 0
        });

        Knoema.Helpers.post('//mauritania.opendataforafrica.org/api/1.0/data/pivot', dataDescriptor, function(pivotResponse) {
            if (pivotResponse.data.length) {
                $('#right-side-bar').find('.side-bar-content').empty().append($.tmpl('region-details.html', {
                    headerMembers: pivotResponse.header[0].members,
                    rows: _.chunk(pivotResponse.data, pivotResponse.header[0].members.length)
                }));
                $('#right-side-bar').find('.header').append('<a href="javascript:void 0;" class="export-button" title="Export to PDF"></a>');
            } else {
                $('#right-side-bar').find('.side-bar-content').empty().append($('<div>No data</div>'));
            }
        });

    }.bind(this));

    $('#right-side-bar').on('click', '#view-profile', function() {
        $('#profile-modal').modal({
            open: true
        });
    });

    $('#right-side-bar').on('click', '.export-button', function() {
        alert('TODO Implement export');
        //TODO Implement export
        //$('#export-form').submit();
    });

    $('#right-side-bar').on('click', '.close', function() {
        $('#map-container').css({
            "width": $(window).width() - 400
        });
        google.maps.event.trigger(self._map, "resize");

        $('#right-side-bar').animate({
            "right": -1 * ($('#right-side-bar').width() + 20)
        }, function() {
            $('#select-region').selectpicker('val', 'not-selected');
            self._regionsComponent.select(null);
        });
    });

	$(window).on('resize', $.proxy(this.onResize, this));
};

App.prototype.showLegend = function (ranges) {
    $('#map-legend-holder').empty()
        .append($.tmpl('map-legend.html', { ranges: ranges }))
        .show();
};

App.prototype.hideLegend = function () {
    $('#map-legend-holder').empty().hide();
};

App.prototype.loadLayer = function (layerId, layerType) {
	var self = this;

	if (this._layers[layerId]) {

        if (layerType && layerType === 'region' && this._activeAreaLayerId != null) {
            this.hideLegend();
            this._layers[this._activeAreaLayerId].clean();
        }

        //layer.bounds == null means that layer is not displayed on the map
        if (this._layers[layerId].layer.bounds == null) {
            this.showLegend(this._layers[layerId].layer.ranges);
            this._layers[layerId].load();
        } else {
            this.hideLegend();
            this._layers[layerId].clean();
        }
        $('input[data-layer-id="' + layerId + '"]').prop('disabled', false);
	}
	else {

        if (layerType && layerType === 'region' && this._activeAreaLayerId != null) {
            this._layers[this._activeAreaLayerId].clean();
        }

        $('.map-and-timeline').find('.loading').css({
            "z-index": 1000000
        });

		var layer = new GeoPlayground.Layer({
			map: self._map,
			layerId: layerId,
			geoPlaygroundId: self.geoPlaygroundId,
			infoWindow: self.infoWindow
		}, $.proxy(function (layerData) {

            $('.map-and-timeline').find('.loading').css({
                "z-index": 0
            });

			if (layerData.layer.layerType === 'point') {
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
							title: this.content[self._layerTitles[layerData.layerId]],
							content: content
						});
						self.infoWindow.setContent($infoWindowContent[0].outerHTML);
						self.infoWindow.setPosition(this.position);
						self.infoWindow.open(self._map);
					});
				});
			} else {

                this.showLegend(this._layers[layerId].layer.ranges);

                layerData.layer.dataLayer.addListener('click', function (e/*: google.maps.Data.MouseEvent*/) {
                    var data = e.feature.getProperty('tooltipData');
                    var $infoWindowContent = $.tmpl('info-window.html', {
                        title: data.name,
                        content: data.value.toString()
                    });
                    self.infoWindow.setContent($infoWindowContent[0].outerHTML);
                    self.infoWindow.setPosition(e.latLng);
                    self.infoWindow.open(self._map);
                });

			    //TODO Implement timeline
				//layerData.layer.data is pivotResponse
				// this.byTime = _.groupBy(layerData.layer.data, function(tuple) {
				// 	//TODO Format using Knoema.Utils & our custom frequencies
				// 	return tuple.Time.substring(0, 4);
				// });

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
        $.get('tmpl/regions-dropdown.html?random=' + Math.random(), compileTemplate),
        $.get('tmpl/region-details.html?random=' + Math.random(), compileTemplate),
		$.get('tmpl/filters-tree.html?random=' + Math.random(), compileTemplate),
        $.get('tmpl/info-window.html?random=' + Math.random(), compileTemplate),
        $.get('tmpl/map-legend.html?random=' + Math.random(), compileTemplate)
	];

    //This "tree-item-template.html" should be defined before "filters-tree.html" loaded
    $.get('tmpl/tree-item-template.html?random=' + Math.random(), compileTemplate).then(function () {
        $.when.apply(null, templates).done(function onTemplatesLoaded() {
            if ($.isFunction(callback)) {
                callback();
            }
        });
    });

};
