(function () {

    var app = function () {
        this.topBarHeight = 75;//height of top bar
        this.timelineHeight = 0;
        this.map = null;
        this.geoPlaygroundId = 'ythydxf';
        this.infoWindow = new google.maps.InfoWindow();
        this.layers = {};
        this.drugSelectList = [];
        this.markers = [];
        this.filters = {
            search: '',
            hide: [],
            activeRegionLayer: '9701156f-4489-f6f6-75ba-535e4cd3e58d'
        };

        this.namesToChange = {};

        $.ajaxSetup({
            data: {
                client_id: 'EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif'
            }
        });
    };

    app.prototype.run = function() {
        var self = this;

        $(window).on('resize', $.proxy(this.onResize, this));

        $('#map-canvas').height($(window).height() - this.topBarHeight - this.timelineHeight);

        this.loadTemplates(function() {});

        $(window).hashchange( function() {
            var hash = location.hash;
            $('.main-menu').find('.active').removeClass('active');
            if (hash === '#dashboard') {
                $('.main-menu').find('a.dashboard').addClass('active');
                $('#region-layer-switcher').hide();
                var h = $(window).height() - self.topBarHeight - 5;//2px bug with embedded resources
                $('#dashboard-holder').find('iframe').css({
                    "height": h
                });
                $('#dashboard-holder')
                    .css({
                        "visibility": "visible"
                    });
                $('#region-layer-switcher').hide();
            } else {
                $('.main-menu').find('a.country-overview').addClass('active');
                $('#region-layer-switcher').show();
                $('#dashboard-holder').css({
                    "visibility": "hidden"
                });
                $('#region-layer-switcher').show();
            }
        });

        self.loadMap();

        $(window).hashchange();
    };

    app.prototype.loadMap = function() {
        var self = this;

        this.map = new google.maps.Map(document.getElementById('map-canvas'), {
            center: {lat: 14.317615218946074, lng: -14.710693093750038},
            zoom: 7,
            streetViewControl: false,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        google.maps.event.addListenerOnce(this.map, 'idle', function () {
            var idleTimeout = window.setTimeout(function () {
                $.get('//knoema.com/api/1.0/frontend/resource/' + self.geoPlaygroundId + '/content', function(content) {
                    self.layersMetadata = content.layers;
                    var layers = [];
                    for (var layerId in content.layers) {
                        if (content.layers[layerId].layerType === 'region') {
                            layers.push({
                                layerId: layerId,
                                label: content.layers[layerId].name.substr(14) //Remove "Population by " from layer name
                            });
                            //TODO Refactor this
                            if (self.filters.activeRegionLayer === layerId) {
                                self.loadLayer(layerId);
                            }
                        } else {
                            self.loadLayer(layerId);
                        }
                    }
                    $('#region-layer-switcher')
                        .html($.tmpl('region-switcher.html', {
                            layers: layers
                        }))
                        .show();
                });
            }, 300);
        });

        function keyupHandler() {
            self.filters.search = $.trim($(this).val().toLowerCase());
            self.reloadLayers();
        };

        $('#region-layer-switcher').off();
        $('#region-layer-switcher').on('change', 'input', function() {
            self.filters.activeRegionLayer = $(this).data('layerId');
            self.reloadLayers();
        });

        $(window).trigger('resize');

    };

    app.prototype.reloadLayers = function () {
        var self = this;
        self.infoWindow.close();

        _.each(_.keys(this.layersMetadata), function(layerId) {
            var layer = self.layers[layerId];
            if (layer && layer.layer && layer.layer.layerType === 'region') {
                if (self.filters.activeRegionLayer === layerId) {
                    self.loadLayer(layerId);
                } else {
                    if (layer.layer.dataLayer) {
                        layer.clean();
                    }
                }
            } else {
                self.loadLayer(layerId);
            }

        });
    };

    app.prototype.hidePricesComparison = function () {
        $('#prices-comparison-tool').animate({
            width: 0
        });
    };

    app.prototype.showPricesComparison = function () {
        $('#prices-comparison-tool').animate({
            width: 470
        });
    };

    app.prototype.onBeforeDraw = function (event, callback, id) {
        var self = this;

        if (!_.isEmpty(this.filters.search)) {
            event.data.visible = event.data.visible && event.data.content['Name of facility'].toLowerCase().indexOf(this.filters.search) >= 0;
        }

        if (!_.isEmpty(this.filters.hide)) {
            _.forIn(event.data.content, function(value, key) {
                if (key === 'Status') {
                    event.data.visible = event.data.visible && _.indexOf(self.filters.hide, event.data.content[key]) < 0;
                }
            });
        }

        if (event.data.visible && !_.isEmpty(this.filters.medicine)) {
            var visible = _.reduce(this.filters.medicine, function(visible, nextFilter) {
                return visible && Boolean(event.data.content[nextFilter]);
            }, event.data.visible);
            event.data.visible = event.data.visible && visible;
        }

        callback(event.data);

    };

    app.prototype.loadLayer = function (layerId) {
        var self = this;
        var layer = this.layers[layerId];

        //TODO $(document.body).addClass('loading');

        //activeRegionLayer
        if (!layer) {

            if (self.layersMetadata[layerId].layerType === 'region' && layerId !== self.filters.activeRegionLayer) {
                return;
            }

            layer = new GeoPlayground.Layer({
                map: self.map,
                layerId: layerId,
                geoPlaygroundId: self.geoPlaygroundId
            }, function(layer2) {
                $(document.body).removeClass('loading');

                $('.nav').find('[disabled]').removeAttr('disabled');
                debugger;
                if (layer2.layer.ranges) {
                    $('#heatmap-legend').remove();
                    $('#map-canvas').append($.tmpl('heatmap-legend.html', {
                        ranges: layer2.layer.ranges
                    }));
                }

            });
            layer.on('click', function (e) {

                if (e.data.tooltip.name) {
                    self.infoWindow.setContent($.tmpl('info-window-content.html', { tooltip: e.data.tooltip })[0].outerHTML);
                    self.infoWindow.setPosition(e.data.latLng);
                    self.infoWindow.open(self.map);
                    return;
                } else {
                    self.infoWindow.close();
                    var $modalHolder = $('#modal-dialog-holder');
                    $modalHolder
                        .html($.tmpl('profile.html', {
                            profileData: self.getProfileData(e.data.tooltip)
                        }));
                    $modalHolder
                        .find('.modal-content')
                        .css({
                            'height': $(window).height() - self.topBarHeight
                        });
                    $modalHolder.modal('show');
                }

            });
            layer.on('beforeDraw', function (e, callback) {
                self.onBeforeDraw(e, callback, layerId);
            });

            self.layers[layerId] = layer;
        }

        layer.load();

    };

    app.prototype.getProfileData = function (data) {
        var self = this;
        var tabNames = [
            'General info',
            'Facilities',
            'Staff',
            'Equipment'
            //,'Additional info'
        ];

        var tabs = _.map(tabNames, function (tabName) {
            var tabDataKeys = [];
            switch (tabName) {
                case 'General info':
                    tabDataKeys = [
                        //This should be "Location"
                        "Place",

                        //This should be "GPS coordinate"
                        "Latitude",
                        "Longitude",

                        "Built in",
                        "Ownership",
                        "Type",
                        "Phone number",
                        "Capacity",
                        "Number of pupils",
                        "Boys",
                        "Girls",
                        "Hours of operation"
                    ];
                    break;
                case 'Facilities':
                    tabDataKeys = [
                        "24 hour Running Water (Y/N)?",
                        "Source of water",
                        "24 hour Electricity (Y/N)?",
                        "Source of energy"
                    ];
                    break;
                case 'Staff':
                    tabDataKeys = [
                        "Head Teacher",
                        "Teacher",
                        "Children attendant",
                        "Administrator",
                        "Assistant administrator",
                        "Secretary",
                        "Cook",
                        "Driver",
                        "Watchman",
                        "Medical Attendant"
                    ];
                    break;
                case 'Equipment':
                    tabDataKeys = [
                        "Computers",
                        "TV",
                        "Overhead projector",
                        "Indoor sports area",
                        "Outdoor sports area",
                        "Pool",
                        "Mosquito nets",
                        "CD player",
                        "Sandbox",
                        "Playground"
                    ];
                    break;
                case 'Additional info':
                    tabDataKeys = [
                        "Passport Page",
                        "Flagship Project ID",
                        "PP Name",
                        "Object Type",
                        "Object Name",
                        "Status",
                        "PPP",
                        "Public, Mds XOF",
                        "PPP, Mds XOF",
                        "Private, Mds XOF",
                        "Notes"
                    ];
                    break;
            }

            var indicators = _.map(tabDataKeys, function (indicatorName) {
                    if (typeof indicatorName === 'object') {
                        return {
                            name: indicatorName.name,
                            children: _.map(indicatorName.children, function(child) {
                                return {
                                    name: child,
                                    value: data[child]
                                }
                            })
                                .filter(function(child) {
                                    return child.value != 0 && child.value != '';
                                })
                        }
                    } else {
                        if (Boolean(data[indicatorName])) {
                            var name = self.namesToChange[indicatorName] ? self.namesToChange[indicatorName] : indicatorName;
                            return {
                                name: name,
                                value: data[indicatorName]
                            }
                        }
                    }
                })
                .filter(function (indicator) {
                    if (!Boolean(indicator)) {
                        return false;
                    }
                    if (indicator.children) {
                        var filtered = _.filter(indicator.children, function(child) {
                            return child.value != 0 && child.value != '';
                        });
                        return filtered.length;
                    } else {
                        return indicator.value != 0 && indicator.value != '';
                    }
                });

            return {
                tabName: tabName,
                indicators: indicators
            };

        }).filter(function(tab) {
            return tab.indicators.length;
        });

        return {
            objectName: data['Object Name'],
            objectType: data['Object Type'],
            tabs: tabs
        };
    };

    app.prototype.onResize = function () {
        var newHeight = $(window).height();
        var sideBarHeight = newHeight - this.topBarHeight - 15 * 2;

        var $mapCanvas = $('#map-canvas');
        var $timeline = $('#timeline');

        $('#side-bar').css({
            'height': sideBarHeight,
            'min-height': sideBarHeight
        });

        $mapCanvas.height(newHeight - this.topBarHeight - this.timelineHeight);
    };

    app.prototype.loadTemplates = function (callback) {
        var self = this;
        function compileTemplate(templateSrc) {
            var templateId = this.url.replace('tmpl/', '');
            templateId = templateId.substring(0, templateId.indexOf('?'))
            $.template(templateId, templateSrc);
        }
        var templates = [
            $.get('tmpl/profile.html', compileTemplate),
            $.get('tmpl/heatmap-legend.html', compileTemplate),
            $.get('tmpl/region-switcher.html', compileTemplate),
            $.get('tmpl/side-bar-content.html', compileTemplate),
            $.get('tmpl/info-window-content.html', compileTemplate)
        ];
        $.when.apply(null, templates).done(function onTemplatesLoaded() {

            $('#side-bar').append($.tmpl('side-bar-content.html'));

            if ($.isFunction(callback)) {
                callback();
            }
        });
    };

    google.maps.event.addDomListener(window, 'load', function () {
        window.app = new app();
        window.app.run();
    });

})();
