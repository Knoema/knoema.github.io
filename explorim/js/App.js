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
    this._fonctionnairesDetails = null;

    this._activeRegionId = null;

    this.content = null;

    this.timePoint = null;

    this._visibleStyle = {
        strokeColor: 'white',
        strokeWeight: 1,
        fillColor: 'transparent',
        clickable: true
    };

    this._invisibleStyle = {
        strokeWeight: 0,
        strokeColor: 'transparent',
        fillColor: 'transparent',
        clickable: false
    };

	this._divisionTypes = [
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
    this._dataLayers = {};
    this._layerTitles = {};
}

App.prototype.init = function () {

    $('[data-toggle="tooltip"]').tooltip();

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

            $.getJSON('mauritania-regions.json').then(function(regions) {

                var regionsWithKeys = _.filter(data.items, function(item) {
                    return item.key < 1003410;
                });

                _.each(regions, function(region) {
                    var sameRegion = _.find(regionsWithKeys, function(r) {
                        return r.fields.regionid === region.fields.regionid;
                    });
                    if (sameRegion) {
                        //TODO Find key in regionsWithKeys by region Id
                        region.key = sameRegion.key;
                    }
                });

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
                    geoJsonFile: 'mauritania.json'
                });

                $('#top-map-buttons').find('.dropdown-holder').append($regionsDropdown);
                $regionsDropdown.selectpicker({
                    liveSearch: true
                });

                $('#select-region').on('hidden.bs.select', $.proxy(function(event, isRegion) {
                    if (isRegion) {
                        var newDivision;
                        switch ($('#regional-division-map-switcher').find('.active').data('division')) {
                            case 'Région':
                                newDivision = 'Région';
                                break;
                            case 'Département':
                                newDivision = 'Région';
                                break;
                            case 'Communale':
                                newDivision = 'Département';
                                break;
                        }
                        this.switchDivision(newDivision, true, this._activeAreaLayerId);
                    }
                    this.selectRegion(event, isRegion);
                }, this));

            }.bind(this));

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

                $.when.apply(null, [
                    $.getJSON('mauritaniaCommunes.json'),
                    $.getJSON('mauritaniaDepartments.json'),
                    $.getJSON('mauritaniaGovernorates.json')
                ]).done(function onGeoJsonLoaded(communes, departments, governorates) {

                    //White layers
                    self._dataLayers['Région'] = new google.maps.Data();
                    self._dataLayers['Région'].setMap(self._map);
                    self._dataLayers['Région'].addGeoJson(governorates[0]);
                    self._dataLayers['Région'].setStyle(self._invisibleStyle);


                    self._dataLayers['Département'] = new google.maps.Data();
                    self._dataLayers['Département'].setMap(self._map);
                    self._dataLayers['Département'].addGeoJson(departments[0]);
                    self._dataLayers['Département'].setStyle(self._invisibleStyle);

                    self._dataLayers['Communale'] = new google.maps.Data();
                    self._dataLayers['Communale'].setMap(self._map);
                    self._dataLayers['Communale'].addGeoJson(communes[0]);
                    self._dataLayers['Communale'].setStyle(self._invisibleStyle);

                    self._dataLayers['Région'].addListener('click', self.selectRegion.bind(self));
                    self._dataLayers['Département'].addListener('click', self.selectRegion.bind(self));
                    self._dataLayers['Communale'].addListener('click', self.selectRegion.bind(self));
                });

				$.get('//knoema.com/api/1.0/frontend/resource/' + self.geoPlaygroundId + '/content', function(content) {

                    self.content = content;

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
                                        {
                                            title: "Routes"
                                        },
                                        {
                                            title: "Projets actuels",
                                            children: [
                                                {
                                                    title: "Education, Anticipated",
                                                    children: groupedLayers["Education, Anticipated"]
                                                },
                                                {
                                                    title: "Education, Finalised",
                                                    children: groupedLayers["Education, Finalised"]
                                                },
                                                {
                                                    title: "Electricity, Anticipated",
                                                    children: groupedLayers["Electricity, Anticipated"]
                                                },
                                                {
                                                    title: "Electricity, Finalised",
                                                    children: groupedLayers["Electricity, Finalised"]
                                                },
                                                {
                                                    title: "Health, Anticipated",
                                                    children: groupedLayers["Health, Anticipated"]
                                                },
                                                {
                                                    title: "Health, Finalised",
                                                    children: groupedLayers["Health, Finalised"]
                                                },
                                                {
                                                    title: "Other, Anticipated",
                                                    children: groupedLayers["Other, Anticipated"]
                                                },
                                                {
                                                    title: "Other, Finalised",
                                                    children: groupedLayers["Other, Finalised"]
                                                },
                                                {
                                                    title: "Social (Boutique Emel), Anticipated",
                                                    children: groupedLayers["Social (Boutique Emel), Anticipated"]
                                                },
                                                {
                                                    title: "Social (Boutique Emel), Finalised",
                                                    children: groupedLayers["Social (Boutique Emel), Finalised"]
                                                },
                                                {
                                                    title: "Water, Anticipated",
                                                    children: groupedLayers["Water, Anticipated"]
                                                },
                                                {
                                                    title: "Water, Finalised",
                                                    children: groupedLayers["Water, Finalised"]
                                                }
                                            ]
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
                                            title: "Démographie",
                                            children: [
                                                {
                                                    title: "Population, mâle",
                                                    children: groupedLayers["Demography. Male Population"]
                                                },
                                                {
                                                    title: "Population, femelle",
                                                    children: groupedLayers["Demography. Female Population"]
                                                },
                                                {
                                                    title: "Population totale",
                                                    children: groupedLayers["Demography. Total Population"]
                                                }
                                            ]
                                        },
                                        {
                                            //title: "RGPH",
                                            title: "Recensement Général de la Population et de l'Habitat (RGPH)",
                                            children: [
                                                {
                                                    title: "Habitat",
                                                    children: groupedLayers["Habitat"]
                                                },
                                                {
                                                    title: "Équipments de la maison",
                                                    children: groupedLayers["Équipments de la maison"]
                                                },
                                                {
                                                    title: "Cuisine eclairage eau",
                                                    children: groupedLayers["Cuisine eclairage eau"]
                                                },
                                                {
                                                    title: "Assainissement",
                                                    children: groupedLayers["Assainissement"]
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
                                    title: "Pêches",
                                    children: groupedLayers["Peches"]
                                },
                                {
                                    title: "Immigration illégale"
                                },
                                {
                                    title: "Zones agricoles",
                                    children: groupedLayers['Agriculture potentielle']
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
                                                    title: "Esclavage, sexe"
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
                                    children: groupedLayers["Terrorisme et les conflits"]
                                }
                            ]
                        },
                        {
                            title: "Pluies",
                            className: "climate",
                            children: [
                                {
                                    title: 'Stations de pluie',
                                    children: groupedLayers['Stations de pluie']
                                },
                                {
                                    title: 'Historique',
                                    children: groupedLayers['Historique']
                                },
                                {
                                    title: "Prévoir",
                                    children: [
                                        {
                                            title: "Prévision des précipitations de 10 jours (mm)"
                                        }
                                    ]
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
                                    title: "Tribus",
                                    children: groupedLayers["Tribus"]
                                },
                                {
                                    title: "Social",
                                    children: [
                                        {
                                            title: "Forces armées"
                                        },
                                        {
                                            title: "Cadres"
                                        },
                                        {
                                            title: "Fonctionnaires",
                                            children: [
                                                {
                                                    title: "Fonctionnaires par lieu de inscription",
                                                    children: groupedLayers["Fonctionnaires. Code Inscription"]
                                                },
                                                {
                                                    title: "Fonctionnaires par lieu de naissance",
                                                    children: groupedLayers["Fonctionnaires. Code Naissance"]
                                                }
                                            ]
                                        },
                                        {
                                            title: "Hommes d'affaires"
                                        },
                                        {
                                            title: "Acteurs politiques"
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
                                                        }
                                                        // {
                                                        //     title: "Bulletins Blanc",
                                                        //     children: groupedLayers["Presidential Election. Bulletins Blanc"]
                                                        // },
                                                        // {
                                                        //     title: "Bulletins Nulls",
                                                        //     children: groupedLayers["Presidential Election. Bulletins Nulls"]
                                                        // }
                                                    ]
                                                },
                                                {
                                                    title: "2013 Parlementaire",
                                                    children: [
                                                        {
                                                            title: "Total",
                                                            children: groupedLayers["Parliamentary Election. Total"]
                                                        },
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
                                                        },
                                                        {
                                                            title: "APP + Tawassul",
                                                            children: groupedLayers["Parliamentary Election. APP + Tawassul"]
                                                        },
                                                        {
                                                            title: "Popular Front (FP)",
                                                            children: groupedLayers["Parliamentary Election. Popular Front (FP)"]
                                                        },
                                                        {
                                                            title: "The People's Progressive Alliance (APP)",
                                                            children: groupedLayers["Parliamentary Election. The People's Progressive Alliance (APP)"]
                                                        },
                                                        {
                                                            title: "El Islah Party",
                                                            children: groupedLayers["Parliamentary Election. El Islah Party"]
                                                        },
                                                        {
                                                            title: "Ravah Party",
                                                            children: groupedLayers["Parliamentary Election. Ravah Party"]
                                                        },
                                                        {
                                                            title: "Party of Unity and Development (PUD)",
                                                            children: groupedLayers["Parliamentary Election. Party of Unity and Development (PUD)"]
                                                        },
                                                        {
                                                            title: "Party of the Union for the Republic (UPR)",
                                                            children: groupedLayers["Parliamentary Election. Party of the Union for the Republic (UPR)"]
                                                        },
                                                        {
                                                            title: "Dignity and Action Party (PDA)",
                                                            children: groupedLayers["Parliamentary Election. Dignity and Action Party (PDA)"]
                                                        },
                                                        {
                                                            title: "Democratic Party of the People (PPD)",
                                                            children: groupedLayers["Parliamentary Election. Democratic Party of the People (PPD)"]
                                                        },
                                                        {
                                                            title: "El Karam Party",
                                                            children: groupedLayers["Parliamentary Election. El Karam Party"]
                                                        },
                                                        {
                                                            title: "EL VADILA Party",
                                                            children: groupedLayers["Parliamentary Election. EL VADILA Party"]
                                                        },
                                                        {
                                                            title: "EL WIAM Party",
                                                            children: groupedLayers["Parliamentary Election. EL WIAM Party"]
                                                        },
                                                        {
                                                            title: "Rally for Unity Party (MAJD)",
                                                            children: groupedLayers["Parliamentary Election. Rally for Unity Party (MAJD)"]
                                                        },
                                                        {
                                                            title: "Republican Party for Democracy and Renewal (RDRP)",
                                                            children: groupedLayers["Parliamentary Election. Republican Party for Democracy and Renewal (RDRP)"]
                                                        },
                                                        {
                                                            title: "RibatDémocratique Party and Social (RDS)",
                                                            children: groupedLayers["Parliamentary Election. RibatDémocratique Party and Social (RDS)"]
                                                        },
                                                        {
                                                            title: "Sawab Party",
                                                            children: groupedLayers["Parliamentary Election. Sawab Party"]
                                                        },
                                                        {
                                                            title: "Third Generation Party (PTG)",
                                                            children: groupedLayers["Parliamentary Election. Third Generation Party (PTG)"]
                                                        },
                                                        {
                                                            title: "National Rally for Reform and Development (tawassul)",
                                                            children: groupedLayers["Parliamentary Election. National Rally for Reform and Development (tawassul)"]
                                                        },
                                                        {
                                                            title: "Democratic Renewal (RD)",
                                                            children: groupedLayers["Parliamentary Election. Democratic Renewal (RD)"]
                                                        },
                                                        {
                                                            title: "Sawab + WIAM",
                                                            children: groupedLayers["Parliamentary Election. Sawab + WIAM"]
                                                        },
                                                        {
                                                            title: "Startle Youth for the Nation (SURSAUT)",
                                                            children: groupedLayers["Parliamentary Election. Startle Youth for the Nation (SURSAUT)"]
                                                        },
                                                        {
                                                            title: "Union of the Democratic Centre (U.C.D)",
                                                            children: groupedLayers["Parliamentary Election. Union of the Democratic Centre (U.C.D)"]
                                                        },
                                                        {
                                                            title: "Union for Democracy and Progress (UDP)",
                                                            children: groupedLayers["Parliamentary Election. Union for Democracy and Progress (UDP)"]
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

App.prototype.export = function () {
    var $form = $('#export-form');

    $.get('css/style.css').then(function(css) {

        var $content = $('<html></html>');

        var $head = $('<head><style>' + css + '</style></head>');

        $content.append($head);

         var $header = $('#right-side-bar').find('.header').clone();

        $header.find('#view-profile').remove();

        var regionName = $header.text();

        $content.append('<h2>' + regionName + '</h2>');
        $content.append($('#right-side-bar').find('.side-bar-content').clone().prop("style", ""));

        $form.find('.content').val($content[0].outerHTML);
        $form.find('.fileName').val(regionName + ' - passport');
        $('#export-form [name=landscape]').val('False');
        $form.submit();
    });
};

App.prototype.isRightSideBarVisible = function () {
    return $('#right-side-bar').position().left <= $(window).width();
};

App.prototype.onResize = function () {

    var $timeline = $('#timeline');

    var timelineHeight = $timeline.is(':visible') ? $timeline.height() : 0;

	var windowHeight = $(window).height();
	var $sideBar = $('#side-bar');
	$sideBar.height($(window).height());

    var filtersHolderHeight = windowHeight - 180;

	$sideBar.find('.filters-holder').height(filtersHolderHeight);

    var mapAndTimelineWidth = $(window).width() - $sideBar.width();

    if (this.isRightSideBarVisible()) {
        mapAndTimelineWidth = mapAndTimelineWidth - $('#right-side-bar').width() - 20;
    }

    $('#map-container').css({
        "height": windowHeight - timelineHeight,
        "width": mapAndTimelineWidth
    });

    $('#profile-modal-2').css({
        "width": mapAndTimelineWidth - 20
    });

    $timeline.find('.scroll-content').css({
        "width": mapAndTimelineWidth
    });

    //$('.time-members-holder').width(mapAndTimelineWidth - 50); //50 width of slide-control

    var panelHeadingHeight = $sideBar.find('.panel-heading').first().height();
    var topLevelSectionHeight = filtersHolderHeight - $sideBar.find('.panel-heading').length * panelHeadingHeight - 26;//26 for margin/padding

    $sideBar.find('.panel-body').css({
        'max-height': topLevelSectionHeight,
        'height': topLevelSectionHeight
    });

    var $rightSideBar = $('#right-side-bar');

    $rightSideBar.css({
        "height": windowHeight - timelineHeight
    });

    $rightSideBar.find('.side-bar-content').css({
        "height": windowHeight - timelineHeight - 110
    });

    google.maps.event.trigger(this._map, "resize");

};

App.prototype.switchDivision = function (division, reloadLayer, layerId, availableLayers) {
	this._activeRegionalDivision = division;

    $('#filters').html(division);

    for (var d in this._dataLayers) {
        if (d == division) {
            this._dataLayers[d].setStyle(this._visibleStyle);
        } else {
            this._dataLayers[d].setStyle(this._invisibleStyle);
        }
    }

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
            }
        }
    }
};

App.prototype.selectRegionFromDataLayer = function (e) {
    if (!this.isRightSideBarVisible()) {
        var mapAndTimelineWidth = $(window).width() - $('#side-bar').width() - $('#right-side-bar').width() - 20;
        $('.map-and-timeline').width(mapAndTimelineWidth);
        google.maps.event.trigger(this._map, "resize");
    }

    //this._map.setCenter(e.latLng);

    var division = this._activeRegionalDivision;

    var newDivision;

    switch (division) {
        case 'Région':
            newDivision = 'Département';
            break;
        case 'Département':
            newDivision = 'Communale';
            break;
        case 'Communale':
            newDivision = 'Communale';
            break;
    }

    this.selectRegion(e, true);

    this.switchDivision(newDivision, true, this._activeAreaLayerId);
};

App.prototype._extendBoundsByGeometry = function (bounds, geometry) {
    var arr = geometry.getArray();
    for (var i = 0; i < arr.length; i++) {
        var childArr = arr[i];
        if ($.isFunction(childArr.getArray)) {
            this._extendBoundsByGeometry(bounds, childArr);
        }
        else {
            bounds.extend(arr[i]);
        }
    }
};

App.prototype.selectRegion = function (e, isRegion) {
    var self = this;
    var regionId, regionName, key, level;

    var $selectRegion = $('#select-region');
    var $selected = $selectRegion.find(':selected');

    if (e.feature) {
        regionId = e.feature.getId();
        regionName = e.feature.getProperty('name');
        key = $selectRegion.find('[data-region-id="' + regionId + '"]').val();
        level = $selectRegion.find('[data-region-id="' + regionId + '"]').data('level');
        $selectRegion.selectpicker('val', key);
    } else {
        regionId = $selected.data('regionId');
        regionName = $selected.data('name');
        level = $selected.data('level');
        key = $selectRegion.val();
    }

    if (!regionId) {
        this._activeRegionId = null;
        return;
    }

    this._activeRegionId = regionId;

    this.infoWindow.close();

    $('#map-container').css({
        "width": $(window).width() - 400 - 400
    });

    google.maps.event.trigger(this._map, "resize");

    if (!isRegion) {
        this._regionsComponent.select(regionId);
        _.each(this._dataLayers, function(dataLayer, key) {
            dataLayer.forEach(function(feature) {
                var featureRegionId = feature.getId();
                dataLayer.overrideStyle(feature, featureRegionId && featureRegionId.startsWith(regionId) ? self._visibleStyle : self._invisibleStyle);
            });
        });
    } else {
        var f;
        if (e.feature) {
            f = e.feature;
        } else {
            _.each(this._dataLayers, function(dataLayer, key) {
                dataLayer.forEach(function(feature) {
                    var featureRegionId = feature.getId();
                    if (featureRegionId === regionId) {
                        f = feature;
                    }
                });
            });
        }
        var bounds = new google.maps.LatLngBounds();
        this._extendBoundsByGeometry(bounds, f.getGeometry());
        this._map.fitBounds(bounds);
    }

    var $rightSideBar = $('#right-side-bar');

    $rightSideBar.find('.header').html(regionName);
    $rightSideBar.find('.header').append('<a href="javascript:void 0;" class="export-button" title="Export to PDF"></a><div style="text-align: center"><a style="margin-top: 10px;" href="#" class="btn" id="view-profile">     Voir le profil régional </a></div>');
    $rightSideBar.find('.side-bar-content').empty().append($('<span class="glyphicon glyphicon-cog fa-spin" aria-hidden="true" title="Loading..."></span>'));
    $rightSideBar.animate({
        "right": 0
    });

    dataDescriptors.old.Filter[0].Members = [key];

    dataDescriptors.economics0.Filter[0].Members = [key];
    dataDescriptors.economics1.Filter[0].Members = [key];

    //TODO Set proper key (find by regionId)
    dataDescriptors.politics0.Filter[0].Members = [key];
    dataDescriptors.politics1.Filter[0].Members = [key];

    //ftqbdwb dataset used
    //Economique et social
    var economics0 = $.Deferred();
    Knoema.Helpers.post('//explorim.knoema.com/api/1.0/data/pivot', dataDescriptors.economics0, function(pivotResponse) {
        economics0.resolve(pivotResponse);
    });
    var economics1 = $.Deferred();
    Knoema.Helpers.post('//explorim.knoema.com/api/1.0/data/pivot', dataDescriptors.economics1, function(pivotResponse) {
        economics1.resolve(pivotResponse);
    });

    //jflytqc dataset used (need find proper key)
    var politics0 = $.Deferred();
    Knoema.Helpers.get('//explorim.knoema.com/api/1.0/meta/dataset/jflytqc/dimension/region', function(data) {

        var item = _.find(data.items, function(it) {
            return it.fields.regionid === regionId;
        });

        if (item) {
            dataDescriptors.politics0.Filter[0].Members[0] = item.key.toString();
            Knoema.Helpers.post('//explorim.knoema.com/api/1.0/data/details', dataDescriptors.politics0, function(pivotResponse) {
                politics0.resolve(pivotResponse);
            });
        } else {
            politics0.resolve(null);
        }

    });

    //ftqbdwb dataset used
    var politics1 = $.Deferred();
    Knoema.Helpers.post('//explorim.knoema.com/api/1.0/data/pivot', dataDescriptors.politics1, function(pivotResponse) {
        politics1.resolve(pivotResponse);
    });

    var zone0 = $.Deferred();
    Knoema.Helpers.get('//explorim.knoema.com/api/1.0/meta/dataset/kymrtcc/dimension/region', function(data) {

        var item = _.find(data.items, function(it) {
            return it.fields.regionid === regionId;
        });

        if (item) {
            dataDescriptors.zone0.Filter[0].Members[0] = item.key.toString();
            Knoema.Helpers.post('//explorim.knoema.com/api/1.0/data/pivot', dataDescriptors.zone0, function(pivotResponse) {
                zone0.resolve(pivotResponse);
            });
        } else {
            zone0.resolve(null);
        }

    });

    $.when.apply(null, [
        economics0,
        economics1,
        politics0,
        politics1,
        zone0
    ]).done(function onPivotRequestsFinished(economics0, economics1, politics0, politics1, zone0Resp) {

        if (economics0.data.length) {
            //$table1
            var $table1 = $.tmpl('simple-table.html', {
                headerMembers: economics0.header[0].members,
                rows: _.chunk(economics0.data, economics0.header[0].members.length)
            });
        }

        //$table2
        var rows = _.chunk(economics1.data, 2);
        rows.unshift([
            {
                indicator: '',
                Value: 'Anticipé'
            },
            {
                indicator: '',
                Value: 'Finalisé'
            }
        ]);
        if (rows[rows.length - 1].length == 1) {
            rows[rows.length - 1].push({
                Value: ''
            });
        }
        var $table2 = $.tmpl('complex-table.html', {
            rows: rows
        });

        var $sideBarContent = $('#right-side-bar').find('.side-bar-content');

        $sideBarContent.empty();

        $sideBarContent.append('<h4>Economique et social</h4>');

        if ($table1) {
            $sideBarContent.append($table1);
            $sideBarContent.append('<hr />');
        }

        $sideBarContent.append($table2);

        $sideBarContent.append($.tmpl('zone-de-vie.html'));

        $sideBarContent.append('<h4>Politique</h4>');

        if (politics0 != null) {
            $sideBarContent.append('<h5>Tribus</h5>');
            var table = '<table>' + _.map(_.chunk(politics0.data, politics0.columns.length), function(d) {
                return '<tr><td>' + d[1] + '</td></tr>';
            }).join('') + '</table>';
            $sideBarContent.append(table);
        }

        $sideBarContent.append('<h5>Élections</h5>');

        $sideBarContent.append($.tmpl('simple-table.html', {
            headerMembers: politics1.header[0].members,
            rows: _.chunk(politics1.data, politics1.header[0].members.length)
        }));

    });
};

App.prototype.loadFonctionnaires = function () {
    var loadedDeferred = $.Deferred();
    var self = this;
    var url = '//explorim.knoema.com/api/1.0/meta/dataset/hfydzlc/dimension/region?access_token=' + access_token ;
    if (!this._fonctionnairesDetails) {
        $.getJSON(url).then(function (data) {
            self._fonctionnairesDetails = data;
            loadedDeferred.resolve(self._fonctionnairesDetails);
        });
    } else {
        loadedDeferred.resolve(this._fonctionnairesDetails);
    }
    return loadedDeferred;
};

App.prototype.showFonctionnaires = function (regionId, layerId) {
    var self = this;
    this.loadFonctionnaires().then(function (data) {

        var region = _.find(data.items, function (d) {
            return d.fields.regionid === regionId;
        });
        if (region) {

            var $modal = $('#fonctionnaires-modal');

            $modal.find('.modal-body').html('<span class="glyphicon glyphicon-cog fa-spin" aria-hidden="true" title="Loading..."></span>');
            $modal.show();

            dataDescriptors.fonctionnaires.Filter[2].Members[0] = region.key.toString();
            Knoema.Helpers.post('//explorim.knoema.com/api/1.0/data/details', dataDescriptors.fonctionnaires, function(details) {
                var ddd = _.chunk(details.data, details.columns.length);

                var columns;

                //Previous version
                //var columns = ["NNI", "NOM", "PRÉNOM", "Date De Naissance", "Code Naissance", "Fonction", "Minister", "Code Inscription"];

                if (self.content.layers[layerId].groupping.groupName === 'Fonctionnaires. Code Naissance') {
                    columns = [
                        "NNI",
                        "NOM",
                        "PRÉNOM",
                        "Date De Naissance",
                        //"Commune De Naissance",
                        "Fonction",
                        "Minister",
                        "Commune Inscription"
                    ];
                } else if (self.content.layers[layerId].groupping.groupName === 'Fonctionnaires. Code Inscription') {
                    columns = [
                        "NNI",
                        "NOM",
                        "PRÉNOM",
                        "Date De Naissance",
                        "Commune De Naissance",
                        "Fonction",
                        "Minister"
                    ];
                }

                var table = '<table class="display" cellspacing="0" width="100%"><thead><tr>' + _.map(columns, function(column) {
                        return '<th>' + column + '</th>'
                    }).join('') + '</tr></thead>';

                var tt = _.map(ddd, function(row) {

                    var rowContent = '<tr>';

                    for (var i = 0; i < details.columns.length; i++) {
                        if (columns.indexOf(details.columns[i].name) > -1) {
                            rowContent = rowContent + '<td>' + row[i] + '</td>';
                        }
                    }

                    rowContent = rowContent + '</tr>';

                    return rowContent;

                }).join('');

                table = table + '<tbody>' + tt + '</tbody></table>';

                $modal.find('.modal-body').html(table);
                $modal.find('.modal-body').find('table').DataTable({
                    "lengthChange": false,
                    "paging": false,
                    "language": {
                        "url": "js/vendor/French.json"
                    }
                });

            });
        } else {
            //alert(regionId + ' missing in dataset');
        }
    });
};

App.prototype.bindEvents = function () {
	var self = this;

    $('#zoom-to-country').on('click', function() {
        this._map.setZoom(Math.min(6, this._map.getZoom()));
    }.bind(this));

    $('#jump-to-parent-region').on('click', function() {
        var regionId = this._activeRegionId.substr(0, _.lastIndexOf(this._activeRegionId, '-'));
        var regionName = $('#select-region').find('[data-region-id="' + regionId + '"]').val();
        $('#select-region').selectpicker('val', regionName);
        $('#select-region').trigger('hidden.bs.select', true);
    }.bind(this));

	$('#regional-division-map-switcher').on('click', 'a', function(event) {
		self.switchDivision($(event.target).data('division'), true, $(event.target).data('layerId'));
	});

	$('#regional-division-modal-switcher').on('click', '.regional-division-type', function(event) {
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

    var $filtersTree = $('#filters-tree');

    $filtersTree.on('click', 'label', $.proxy(function(event) {

        if (event.target.tagName === 'INPUT') {

            var $target = $(event.target);
            var layerId, activeRegionalDivision;
            var layerType = $target.data('layerType');

            if (layerType === 'point') {
                layerId = $target.data('layerId');
                $target.prop('disabled', true);
                this.loadLayer(layerId, 'point');
            } else if (layerType === 'shape') {
                layerId = $target.data('layerId');
                this.loadLayer(layerId, 'shape');
            }
            else {

                $(event.target).closest('.item-content').find('input[data-layer-type="region"]').prop('disabled', true);

                if (this._activeAreaLayerId) {
                    $('[data-layer-id="' + this._activeAreaLayerId + '"]').prop('checked', false);
                }

                layerId = $target.data('layerId');
                var layers = $target.data('layers');

                if (layerId) {
                    //Simple region layer (no sublayers like Regionale, Department, Communale)

                    if ($target.is(':checked')) {
                        this.loadLayer(layerId, 'region', function() {
                            $(event.target).closest('.item-content').find('input[data-layer-type="region"]').prop('disabled', false);
                        });
                    } else {
                        this._layers[layerId].clean();
                        this.hideLegend();
                        $(event.target).closest('.item-content').find('input[data-layer-type="region"]').prop('disabled', false);
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
                        this.hideLegend();
                    }

                }
            }
        }
    }, this));

    // show.bs.collapse	This event fires immediately when the show instance method is called.
    // hide.bs.collapse	This event is fired immediately when the hide method has been called.
    $filtersTree.find('.item-content').on('show.bs.collapse hide.bs.collapse', function() {
        $(this).closest('.item-content-level-0').find('.scroll-content').mCustomScrollbar('destroy');
    });

    // shown.bs.collapse	This event is fired when a collapse element has been made visible to the user (will wait for CSS transitions to complete).
    $filtersTree.find('.item-content').on('shown.bs.collapse', function() {
        $(this).closest('.item-content-level-0').find('.scroll-content').mCustomScrollbar({
            theme: 'dark'
        });
    });

    $('#profile-modal-2').on('click', '.close-modal-2', function() {
        $('#profile-modal-2').hide();
    });

    var $modal = $('#fonctionnaires-modal');

    $modal.on('click', '.close-modal-2', function() {
        $('#fonctionnaires-modal').hide();
    });
    $modal.on('click', '.export-button', function(e) {
        var $a = $(e.target);

        var $form = $('#export-form');

        $.get('css/style.css').then(function(css) {

            var $content = $('<html></html>');

            var $head = $('<head><style>' + css + '</style></head>');

            $content.append($head);

            $content.append($a.closest('.custom-modal').find('table')[0].outerHTML);

            $form.find('.content').val($content[0].outerHTML);
            $form.find('.fileName').val('fonctionnaires');
            $('#export-form').find('[name=landscape]').val('False');
            $form.submit();
        });
    });

    var $rightSideBar = $('#right-side-bar');

    $rightSideBar.on('click', '#view-profile', function() {
        $('#profile-modal-2').css({
            "top": 10,
            "bottom":  $('#timeline').is(':visible') ? $('#timeline').height() + 51 : 51, //for padding of .close button
            "width": $('#map-container').width() - 20,
            "left": 10
        }).show();
    });

    $rightSideBar.on('click', '.export-button', function() {
        self.export();
    });

    $rightSideBar.on('click', '.close', function() {
        $('#map-container').css({
            "width": $(window).width() - 400
        });
        google.maps.event.trigger(self._map, "resize");

        $('#profile-modal-2').hide();

        $rightSideBar.animate({
            "right": -1 * ($rightSideBar.width() + 30)
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

    $('#map-legend-holder').css('bottom', $('#timeline').is(':visible') ? 100 : 30);

    _.each(this._dataLayers, function(dataLayer) {
        dataLayer.setStyle(this._invisibleStyle);
    }.bind(this));

};

App.prototype.hideLegend = function () {
    $('#map-legend-holder').empty().hide();
    this.infoWindow.close();
    this._dataLayers[this._activeRegionalDivision].setStyle(this._visibleStyle);
};

App.prototype.loadLayer = function (layerId, layerType, callback) {
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
            $('[data-layer-type="region"]').prop('checked', false);
            this._layers[layerId].clean();
        }
        $('input[data-layer-id="' + layerId + '"]').prop('disabled', false);
	}
	else {

        if (layerType && layerType === 'region' && this._activeAreaLayerId != null) {
            this.hideLegend();
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

                var propsToDisplay = _.filter(_.keys(this._layers[layerData.layerId].layer.tooltip), function (key) {
                    return self._layers[layerData.layerId].layer.tooltip[key].state === "visible";
                });

                var markers = this._layers[layerData.layerId].layer.markerClusterer ? this._layers[layerData.layerId].layer.markerClusterer.markers_ : this._layers[layerData.layerId].layer.markers;

                _.each(markers, function (marker) {
                    marker.addListener('click', function () {
                        var content = _.chain(_.keys(this.content))
                            .map(function (key) {
                                if (self._layers[layerData.layerId].layer.tooltip[key]) {
                                    var value;
                                    if (key === 'YEAR' || key === 'Year') {
                                        value = Globalize.format(new Date(Date.parse(this.content[key])), 'yyyy');
                                    } else if (key === 'Time' || self._layers[layerData.layerId].layer.tooltip[key].text === 'EVENT DATE' || key === 'Date of realisation') {
                                        value = Globalize.format(new Date(Date.parse(this.content[key])), 'd MMMM yyyy');
                                    } else {
                                        value = _.isNaN(parseFloat(this.content[key])) ? this.content[key] : Globalize.format(parseFloat(this.content[key]));
                                    }
                                    return {
                                        originalKey: key,
                                        key: self._layers[layerData.layerId].layer.tooltip[key].text || key,
                                        value: value
                                    };
                                }
                            }.bind(this))
                            .value()
                            .filter(function (entry) {
                                return entry && propsToDisplay.indexOf(entry.originalKey) > -1;
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
            } else if (layerData.layer.layerType === 'shape') {
                this.hideLegend();

                //Hide data layer if it is enabled
                if (this._activeAreaLayerId != null) {
                    this.hideLegend();
                    this._layers[this._activeAreaLayerId].clean();
                }

                if ($('[data-layer-id="' + layerData.layerId + '"]').is(':checked')) {
                    var month = null;
                    var isMonthStart = true;
                    var timeMembers = _.map(layerData.layer.data.data, function(entry, index) {
                        var newMonth = Globalize.format(new Date(Date.parse(entry.date.value)), 'MMM');
                        var timeMember = {
                            "timePoint": entry.date.value
                        };
                        if (newMonth != month) {
                            month = newMonth;
                            timeMember.month = month;
                        }
                        if (layerData.layer.dataToDisplay[0].data.Date === entry.date.value) {
                            timeMember.isActive = true;
                        }
                        return timeMember;
                    });

                    self.createTimeline(timeMembers, layerData.layerId);

                } else {
                    self._layers[layerData.layerId].clean();
                    self.hideTimeline();
                }
			} else {

			    this.hideTimeline();

                var rainsLayerId = $('[data-layer-type="shape"]').data('layerId');

                if (rainsLayerId && this._layers[rainsLayerId]) {
                    this._layers[rainsLayerId].clean();
                    $('[data-layer-type="shape"]').prop('checked', false);
                    this.hideTimeline();
                }

                this.showLegend(this._layers[layerId].layer.ranges);

                layerData.layer.dataLayer.addListener('click', $.proxy(this.selectRegionFromDataLayer, this));

                // layerData.layer.dataLayer.addListener('click', function (e) {
                //     var data = e.feature.getProperty('tooltipData');
                //
                //     var showFonctionnairesLink = [
                //             //Layers under "Fonctionnaires"
                //             "fc3a4fa6-66b2-a30a-c83f-0adbfe8805d7",
                //             "0a9c5e6a-9562-3866-7261-741c96999e79",
                //             "36d5d01c-4772-9056-37f3-dd005e894cff",
                //             "45c2b643-a200-1b64-d8c0-9094472c415d",
                //             "c5a695b4-05c0-9e51-2288-9187885da5e3",
                //             "0a0afddd-db7c-b810-1a86-ecfaa67ddb21"
                //         ].indexOf(layerData.layerId) > -1;
                //
                //     var regionId = e.feature.getId();
                //
                //     var $infoWindowContent = $.tmpl('info-window.html', {
                //         title: data.name,
                //         regionId: regionId,
                //
                //         showFonctionnairesLink: showFonctionnairesLink,
                //
                //         layerId: layerData.layerId,
                //         content: Globalize.format(parseFloat(data.value))
                //     });
                //
                //     self.infoWindow.setContent($infoWindowContent[0].outerHTML);
                //     self.infoWindow.setPosition(e.latLng);
                //     self.infoWindow.open(self._map);
                // });

                this._activeAreaLayerId = layerData.layerId;
			}

            $('input[data-layer-id="' + layerData.layerId + '"]').prop('disabled', false);

            if ($.isFunction(callback)) {
                callback();
            }

        }, this));

		layer.load();
		this._layers[layerId] = layer;

	}
};

App.prototype.hideTimeline = function () {
    $('#timeline').find('.scroll-content').mCustomScrollbar('destroy');
    $('#timeline').find('.scroll-content').empty();
    $('#timeline').hide();

    $('#map-legend-holder').empty().hide();
    this.onResize();
};

App.prototype.createTimeline = function (timeMembers, layerId, scrollToRight) {
    var $scrollContent = $('#timeline').find('.scroll-content');

    if ($scrollContent.html() === '') {
        $scrollContent.mCustomScrollbar('destroy');

        $scrollContent.empty().append($.tmpl('time-members.html', {
            timeMembers: timeMembers
        }));

        $scrollContent.mCustomScrollbar({
            theme: "dark",
            axis:"x",
            advanced:{
                autoExpandHorizontalScroll:true
            }
        });

        $scrollContent.on('click', 'a.timepoint', function(e) {
            this._layers[layerId].load(null, $(e.target).data('timePoint'));
        }.bind(this));

        $('#timeline').show();

        setTimeout(function() {
            $scrollContent.mCustomScrollbar('scrollTo', 'right');
        }, 100);

    } else {
        $scrollContent.find('.active').removeClass('active');
        $scrollContent.find('[data-time-point="' + _.find(timeMembers, function(d) {return d.isActive}).timePoint + '"]').addClass('active');
    }
    $('#map-legend-holder')
        .css('bottom', 100)
        .html('<img src="img/rains-legend.png">').show();
    this.onResize();
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
        $.get('tmpl/complex-table.html?random=' + Math.random(), compileTemplate),
		$.get('tmpl/filters-tree.html?random=' + Math.random(), compileTemplate),
        $.get('tmpl/simple-table.html?random=' + Math.random(), compileTemplate),
        $.get('tmpl/time-members.html?random=' + Math.random(), compileTemplate),
        $.get('tmpl/info-window.html?random=' + Math.random(), compileTemplate),
        $.get('tmpl/zone-de-vie.html?random=' + Math.random(), compileTemplate),
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
