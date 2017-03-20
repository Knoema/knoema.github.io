var access_token = '';

var params = Knoema.Helpers.parseHashParams();
if (params == null) {
	Knoema.Helpers.getAccessToken('cV03FzkMGB1YzQ', window.location, false, 'publish');
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
        zIndex: 1000,
        clickable: true
    };
    this._invisibleStyle = {
        strokeWeight: 0,
        strokeColor: 'transparent',
        fillColor: 'transparent',
        zIndex: 0,
        clickable: false
    };

    this._clickableStyle = {
        strokeWeight: 0,
        strokeColor: 'transparent',
        fillColor: 'transparent',
        //zIndex: 1000,
        clickable: true
    };

    this._selectedStyle = {
        strokeWeight: 1,
        fillColor: 'white',
        strokeColor: 'white',
        clickable: true,
        zIndex: 100
    };

	this._divisionTypes = [
        {
            name: 'Région',
            className: 'region'
        },
        {
            name: 'Moughataa',
            className: 'department'
        },
        {
            name: 'Commune',
            className: 'communale'
        }
	];

	this._regions = [];

    /**
     * {
     *   "MR-01": 5,
     *   "MR-01-AR": 12
     * }
     * regionId: index in this._regions
     */
	this._regionIndexByRegionId = {};

	this._activeRegionalDivision = null;
	this._activeGroupCuid = null;

	this._activeAreaLayerId = null;
    this._layerData = {};

    this._dataLayers = {};
    this._layerTitles = {};
    this._selectedFeature = null;
    this._fonctionnaires = [
        "fc3a4fa6-66b2-a30a-c83f-0adbfe8805d7",
        "0a9c5e6a-9562-3866-7261-741c96999e79",
        "36d5d01c-4772-9056-37f3-dd005e894cff",
        "45c2b643-a200-1b64-d8c0-9094472c415d",
        "c5a695b4-05c0-9e51-2288-9187885da5e3",
        "0a0afddd-db7c-b810-1a86-ecfaa67ddb21"
    ];
};

App.prototype.init = function () {
    var self = this;

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

                _.each(regions, function(region, index) {

                    this._regionIndexByRegionId[region.fields.regionid] = index;

                    var sameRegion = _.find(regionsWithKeys, function(r) {
                        return r.fields.regionid === region.fields.regionid;
                    });
                    if (sameRegion) {
                        region.key = sameRegion.key;
                    }
                }.bind(this));

                this._regions = regions;

                var $regionsDropdown = $.tmpl('regions-dropdown.html', {
                    regions: regions
                });

                $('#top-map-buttons').find('.dropdown-holder').append($regionsDropdown);
                $regionsDropdown.selectpicker({
                    liveSearch: true
                });

                $('#select-region').on('hidden.bs.select', $.proxy(function(event, isRegion) {
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
                    $.getJSON('mauritaniaGovernorates.json'),
                    $.getJSON('mauritaniaDepartments.json'),
                    $.getJSON('mauritaniaCommunes.json')
                ]).done(function onGeoJsonLoaded(governorates, departments, communes) {

                    self._dataLayers['Région'] = new google.maps.Data();
                    self._dataLayers['Région'].setMap(self._map);
                    self._dataLayers['Région'].addGeoJson(governorates[0]);
                    self._dataLayers['Région'].setStyle(self._invisibleStyle);

                    self._dataLayers['Moughataa'] = new google.maps.Data();
                    self._dataLayers['Moughataa'].setMap(self._map);
                    self._dataLayers['Moughataa'].addGeoJson(departments[0]);
                    self._dataLayers['Moughataa'].setStyle(self._invisibleStyle);

                    self._dataLayers['Commune'] = new google.maps.Data();
                    self._dataLayers['Commune'].setMap(self._map);
                    self._dataLayers['Commune'].addGeoJson(communes[0]);
                    self._dataLayers['Commune'].setStyle(self._invisibleStyle);

                    self._dataLayers['Région'].addListener('click', self.selectRegion.bind(self));
                    self._dataLayers['Moughataa'].addListener('click', self.selectRegion.bind(self));
                    self._dataLayers['Commune'].addListener('click', self.selectRegion.bind(self));
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

					var items = getTreeItems(groupedLayers);

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

App.prototype.getDivisionByRegionId = function(regionId) {
    var index = this._regions[this._regionIndexByRegionId[regionId]].level - 1;
    return this._divisionTypes[index].name;
};

App.prototype.getParentRegionId = function (regionId) {
    var index = this._regionIndexByRegionId[regionId];
    var region = this._regions[index];
    var parentLevel = region.level - 1;
    //Top level is "1"
    if (parentLevel) {
        var i = index - 1;
        while(i > -1) {
            if (parentLevel === this._regions[i].level) {
                return this._regions[i].fields.regionid;
            }
            i--;
        }
    }
    return null;
};

App.prototype.getChildRegions  = function (regionId) {
    var index = this._regionIndexByRegionId[regionId];
    var region = this._regions[index];
    var childrenLevel = region.level + 1;
    var i = index + 1;
    var childRegionIds = [];
    while (i < this._regions.length) {
        if (this._regions[i].level === childrenLevel) {
            childRegionIds.push(this._regions[i].fields.regionid);
        }
        else if (region.level === this._regions[i].level) {
            break;
        }
        i++;
    }
    return childRegionIds;
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
    var self = this;
	this._activeRegionalDivision = division;

    $('#filters').html(division);

    this.resetDataLayers();

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
        this.hideRightSideBar();
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

    this.resetDataLayers();

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
        this.hideRightSideBar();
        this.setInitialView();
        return;
    }

    this._activeRegionId = regionId;

    this.infoWindow.close();

    $('#map-container').css({
        "width": $(window).width() - 400 - 400
    });

    google.maps.event.trigger(this._map, "resize");

    if (!isRegion && !e.feature) {
        this.selectRegion(e, true);
    }

    if (e.feature) {
        this._selectedFeature = e.feature;
    } else {
        _.each(this._dataLayers, function(dataLayer, key) {
            dataLayer.forEach(function(feature) {
                var featureRegionId = feature.getId();
                if (featureRegionId === regionId) {
                    self._selectedFeature = feature;
                }
            });
        });
    }

    var newDivision = this.getDivisionByRegionId(regionId);
    this.switchDivision(newDivision, false);

    this.highlightFeature();

    //console.log('%cTODO Restore fitBounds', 'color:red;font-size:200%;');
    var bounds = new google.maps.LatLngBounds();

    if (this._selectedFeature) {
        this._extendBoundsByGeometry(bounds, this._selectedFeature.getGeometry());
        this._map.fitBounds(bounds);

        this.populateSidebar(regionId);
    } else {
        this.hideRightSideBar();
    }
};

App.prototype.highlightFeature = function () {
    var self = this;

    self._dataLayers[self._activeRegionalDivision].forEach(function(feature) {
        self._dataLayers[self._activeRegionalDivision].overrideStyle(feature, self._clickableStyle);
    });

    self._dataLayers[self._activeRegionalDivision].overrideStyle(self._selectedFeature, {
        strokeWeight: 1,
        fillColor: 'white',
        strokeColor: 'white',
        zIndex: 0,
        clickable: false
    });

    if (this._selectedFeature) {
        var childRegionIds = this.getChildRegions(this._selectedFeature.getId()) || [];

        _.forIn(this._dataLayers, function (dataLayer) {
            dataLayer.forEach(function(feature) {
                var featureId = feature.getId();
                if (_.includes(childRegionIds, featureId)) {
                    var style = self._selectedStyle;
                    style.zIndex = 1000;
                    dataLayer.overrideStyle(feature, style);
                }
            });
        });
    }
};

App.prototype.populateSidebar2 = function(regionId, layerData) {
    var self = this;
    var regionName, key, level;

    var $selected = $('#select-region').find(':selected');

    regionName = $selected.data('name');
    key = $selected.val();
    level = $selected.data('level');

    var $rightSideBar = $('#right-side-bar');

    $rightSideBar.find('.header').html(regionName);
    $rightSideBar.find('.header').append('<a href="javascript:void 0;" class="export-button" title="Export to PDF"></a><a style="margin-top: 10px;" href="#" class="btn profile-button" id="view-profile">     Voir le profil régional </a>');
    $rightSideBar.find('.side-bar-content').empty().append($('<span class="glyphicon glyphicon-cog fa-spin" aria-hidden="true" title="Loading..."></span>'));
    $rightSideBar.animate({
        "right": 0
    });

    dataDescriptors.old.Filter[0].Members = [key];

    dataDescriptors.economics0.Filter[0].Members = [key];
    dataDescriptors.economics1.Filter[0].Members = [key];

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

    var tribus = $.Deferred();
    Knoema.Helpers.post('//explorim.knoema.com/api/1.0/data/details', dataDescriptors.tribus, function(details) {
        var tribusByRegion = _.filter(_.chunk(details.data, details.columns.length), function(row) {
            return row[2] === regionId;
        });
        var sorted = _.sortBy(tribusByRegion, function(d) {
            return d[3];
        });
        var tribusColumn = _.map(sorted, function(d) {
            return d[1];
        });
        tribus.resolve(tribusColumn);
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
        politics1,
        zone0,
        tribus
    ]).done(function onPivotRequestsFinished(economics0, economics1, politics1, zone0Resp, tribus) {

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

        if (layerData) {

            //this._regions[this._regionIndexByRegionId[regionId]].name -> TINTANE
            // var regionName = this._regions[this._regionIndexByRegionId[regionId]].name;
            // var regionDimensionId = layerData.layer.dataDescriptor.RegionDimensionId;

            //layerData.layer.dataDescriptor.RegionDimensionId -> moughatta
            // var regionData = _.find(layerData.layer.data.data, function(d) { return d[regionDimensionId] === regionName });

            var feature;
            layerData.layer.dataLayer.forEach(function(f) {
                if (f.getId() === regionId) {
                    feature = f;
                }
            });

            if (feature) {
                var $passport = $('<div>');
                $passport.append('<h4>Passeport</h4>');
                $passport.append($('<table border="0"><tbody></tbody></table>'));
                if (feature.getProperty('tooltipData').value) {
                    $passport.find('tbody').append($('<tr><td>' + layerData.layer.groupping.groupName + '</td><td>' + Globalize.format(parseFloat(feature.getProperty('tooltipData').value)) + '</td></tr>'));
                }
                if (this._fonctionnaires.indexOf(this._activeAreaLayerId) > -1) {
                    $passport.find('tbody').append($('<tr><td><a href="javascript:void(0)" onclick="app.showFonctionnaires(\'' + regionId + '\', \'' + layerData.layerId + '\')">Montrent les fonctionnaires</a></td><td>&nbsp;</td></tr>'));
                }
                $rightSideBar.find('.side-bar-content').prepend($passport);
            }
        }

        $sideBarContent.append('<h4>Economique et social</h4>');

        if ($table1) {
            $sideBarContent.append($table1);
        }

        $sideBarContent.append($('<h5>Projets Actuels</h5>'));

        $sideBarContent.append($table2);

        $sideBarContent.append($.tmpl('zone-de-vie.html'));

        $sideBarContent.append('<h4>Politique</h4>');

        if (tribus != null) {
            $sideBarContent.append('<h5>Tribus</h5>');
            var table = '<table>' + _.map(tribus, function(t) {
                    return '<tr><td>' + t + '</td></tr>';
                }).join('') + '</table>';
            $sideBarContent.append(table);
        }

        $sideBarContent.append('<h4>Élections</h4>');
        $sideBarContent.append($.tmpl('simple-table.html', {
            headerMembers: politics1.header[0].members,
            rows: _.chunk(politics1.data, politics1.header[0].members.length)
        }));

    }.bind(this));
};

App.prototype.populateSidebar = function(regionId) {
    if (this._activeAreaLayerId) {
        this._layerData[this._activeAreaLayerId].then(this.populateSidebar2.bind(this, regionId));
    } else {
        this.populateSidebar2(regionId);
    }
};

App.prototype.loadFonctionnaires = function () {
    var loadedDeferred = $.Deferred();
    var self = this;

    var dimensionId = 'region';
    if (this._activeRegionalDivision === 'Commune') {
        dimensionId = 'commune';
    } else if (this._activeRegionalDivision === 'Moughataa') {
        dimensionId = 'mougataa';
    }

    var datasetId = this._layers[this._activeAreaLayerId].layer.data.dataset;
    var url = '//explorim.knoema.com/api/1.0/meta/dataset/' + datasetId + '/dimension/' + dimensionId + '?access_token=' + access_token ;

    $.getJSON(url).then(function (data) {
        self._fonctionnairesDetails = data;
        loadedDeferred.resolve(self._fonctionnairesDetails);
    });

    // if (!this._fonctionnairesDetails) {
    //     $.getJSON(url).then(function (data) {
    //         self._fonctionnairesDetails = data;
    //         loadedDeferred.resolve(self._fonctionnairesDetails);
    //     });
    // } else {
    //     loadedDeferred.resolve(this._fonctionnairesDetails);
    // }

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

            $('#fonctionnaires-region').html(region.name);

            $modal.find('.modal-body').html('<span class="glyphicon glyphicon-cog fa-spin" aria-hidden="true" title="Loading..."></span>');
            $modal.show();

            var datasetId = self._layers[self._activeAreaLayerId].layer.data.dataset;
            var dataDescriptor = dataDescriptors.fonctionnaires[datasetId];

            dataDescriptor.Filter[0].Members = [region.key.toString()];
            dataDescriptor.Filter[0].DimensionId = self._layers[layerId].layer.dataDescriptor.RegionDimensionId;

            Knoema.Helpers.post('//explorim.knoema.com/api/1.0/data/details', dataDescriptor, function(details) {
                var ddd = _.chunk(details.data, details.columns.length);

                var columns;

                if (self.content.layers[layerId].groupping.groupName === 'Fonctionnaires. Code Naissance') {
                    columns = [
                        "NNI",
                        "NOM",
                        "PRÉNOM",
                        "Date De Naissance",
                        "Commune De Naissance",
                        "Fonction",
                        "Minister"
                    ];
                } else if (self.content.layers[layerId].groupping.groupName === 'Fonctionnaires. Code Inscription') {
                    columns = [
                        "NNI",
                        "NOM",
                        "PRÉNOM",
                        "Date De Naissance",
                        "Commune Inscription",
                        "Fonction",
                        "Minister"
                    ];
                }

                var table = '<table class="display" cellspacing="0" width="100%"><thead><tr>' + _.map(columns, function(column) {
                        return '<th>' + column + '</th>'
                    }).join('') + '</tr></thead>';

                var tt = _.map(ddd, function(row) {
                    var rowContent = '<tr>';
                    var flag = false;//"Commune Inscription" comes twice in dataset "uvvmucg"
                    for (var i = 0; i < details.columns.length; i++) {
                        if (columns.indexOf(details.columns[i].name) > -1) {
                            if (details.columns[i].name === "Commune Inscription" || details.columns[i].name === "Commune De Naissance") {
                                if (!flag) {
                                    flag = true;
                                    rowContent = rowContent + '<td>' + row[i] + '</td>';
                                }
                            } else {
                                rowContent = rowContent + '<td>' + row[i] + '</td>';
                            }
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
        }
    });
};

App.prototype.setInitialView = function() {
    this._map.setCenter({
        lat: 20.215167,
        lng: -10.777588
    });
    this._map.setZoom(Math.min(6, this._map.getZoom()));
};

App.prototype.bindEvents = function () {
	var self = this;

    $('#zoom-to-country').on('click', this.setInitialView.bind(this));

    $('#jump-to-parent-region').on('click', function() {
        if (this._activeRegionId) {
            var parentRegionId = this.getParentRegionId(this._activeRegionId);
            var regionKey = parentRegionId == null ? 'not-selected' : $('#select-region').find('[data-region-id="' + parentRegionId + '"]').val();
            $('#select-region').selectpicker('val', regionKey);
            $('#select-region').trigger('hidden.bs.select', true);
        }
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
        this.hideTimeline();
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

                $('#select-region').selectpicker('val', 'not-selected');
                $('#select-region').trigger('hidden.bs.select', true);

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

    $rightSideBar.on('click', '.close', $.proxy(this.hideRightSideBar, this));

	$(window).on('resize', $.proxy(this.onResize, this));
};

App.prototype.hideRightSideBar = function() {
    var self = this;

    var $rightSideBar = $('#right-side-bar');

    $('#map-container').css({
        "width": $(window).width() - 400
    });
    google.maps.event.trigger(self._map, "resize");

    $('#profile-modal-2').hide();

    $rightSideBar.animate({
        "right": -1 * ($rightSideBar.width() + 30)
    }, function() {
        $('#select-region').selectpicker('val', 'not-selected');
        self.resetDataLayers();
    });
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

    this._layerData[layerId] = $.Deferred();

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

            // var TINTANE_DATA = _.find(layerData.layer.data.data, function(d) { return d.mougataa === 'TINTANE' });
            // console.log('TINTANE_DATA', TINTANE_DATA);

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
            }
            else if (layerData.layer.layerType === 'shape') {
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
                            if (timeMember.month === 'Jan') {
                                timeMember.month = Globalize.format(new Date(Date.parse(entry.date.value)), 'MMM yyyy');
                            }
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
			}
			else {

			    this.hideTimeline();

                var rainsLayerId = $('[data-layer-type="shape"]').data('layerId');

                if (rainsLayerId && this._layers[rainsLayerId]) {
                    this._layers[rainsLayerId].clean();
                    $('[data-layer-type="shape"]').prop('checked', false);
                    this.hideTimeline();
                }

                this.showLegend(this._layers[layerId].layer.ranges);

                this._activeAreaLayerId = layerData.layerId;

                this._layerData[this._activeAreaLayerId].resolve(layerData);

                //No click handlers for layers from tree
                //layerData.layer.dataLayer.addListener('click', $.proxy(this.selectRegionFromDataLayer, this));

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

App.prototype.resetDataLayers = function () {
    var self = this;
    _.forIn(this._dataLayers, function (dataLayer, division) {
        var style = division === self._activeRegionalDivision ? self._visibleStyle : self._invisibleStyle;
        dataLayer.forEach(function(feature) {
            dataLayer.overrideStyle(feature, style);
        });
    });
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
