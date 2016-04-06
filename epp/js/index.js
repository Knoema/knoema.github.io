function Application(options) {
    if (typeof options.elementId === 'undefined' || typeof options.geoPlaygroundId === 'undefined') {
        throw 'Required options are "elementId" and "geoPlaygroundId"';
    }

    var self = this;

    this.infoWindow = new google.maps.InfoWindow();

    this.options = options;
    this.element = document.getElementById(this.options.elementId);
    this.bubblesLayer = null;
    this.layers = {};
    this.geoPlaygroundContent = null; //Will store whole playground here

    this.sideBarLoaded = false;

    this.filterSettings = {
        showCategories: ['Renewable', 'Non-renewable', 'Other'],
        showTypes: [
            'Gas',
            'Hydro',
            'Coal',
            'Diesel',
            'Solar',
            'Combined',
            'Nuclear',
            'Fuel Oil',
            'Geothermal',
            'Wind',
            'Peat',
            'Biodiesel',
            'Other'
        ]
        /*showTypes: [
            'Coal',
            'Fuel Oil',
            'Gas',
            'Hydro',
            'Nuclear',
            'Solar',
            'Wind',
            'Geothermal',
            'Other'
        ]*/
    };

    this.initMap();
    this.bindEvents();
    this.initRegionSelector();
};

Application.prototype.initMap = function() {

    var self = this;

    var $map = $(this.element).find('.map-canvas');

    //TODO Get map settings from options
    this.map = new google.maps.Map($map.get(0), {
        center: {lat: -3, lng: 30},
        zoom: 3,
        streetViewControl: false,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        },
        //mapTypeControlOptions: {
        //    position: google.maps.ControlPosition.LEFT_TOP
        //},
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    google.maps.event.addListenerOnce(this.map, 'idle', function () {
        window.setTimeout(function () {
            var url = 'http://knoema.com/api/1.0/frontend/resource/' + self.options.geoPlaygroundId + '/content';
            Knoema.Helpers.get(url, function(content) {
                for (var layerId in content.layers) {
                    self.loadLayer(layerId);
                }
            });
        }, 300);
    });
}

Application.prototype.bindEvents = function () {

    var self = this;

    $(window).on('resize', $.proxy(this.resize, this));
    
    $('#header .menu a').click(function(){

        $('#header').find('.active').removeClass('active');
        $(this).parent().toggleClass('active', true);

        var dashboardId;
        var href = $(this).attr('href');
        switch (href){
            case '#/capacity-heat-map':
                dashboardId = 'oygudke';
                break;
            case '#/power-plants-profile':
                dashboardId = 'hkjntng';
                break;
            case '#/about':
                dashboardId = 'ffutfig';
                break;
        }

        var $dashboard = $('#dashboard');
        if (dashboardId){
            var $iframe = $dashboard.find('iframe');
            $iframe.attr('src', '');
            $dashboard.show();
            $iframe.attr('src', 'http://electricitypowerplants.knoema.com/resource/embed/' + dashboardId + '?noHeader=1');
        }
        else {
            $dashboard.hide();
        }
    });
};

Application.prototype.initRegionSelector = function(){

    var self = this;

    this.map.data.loadGeoJson('world.json');
    this.map.data.setStyle({
        strokeWeight: 1,
        fillColor: '#aeaeae',
        visible: false,
        clickable: false
    });

    $('#regions').on('change', function(event) {
        var regionName = $(event.delegateTarget).val();

        self.map.data.forEach(function(feature) {
            self.map.data.revertStyle(feature);

            var visible = regionName == feature.getProperty('name');
            self.map.data.overrideStyle(feature, { visible: visible });

            if (visible) {
                var bounds = new google.maps.LatLngBounds();
                self._extendBoundsByGeometry(bounds, feature.getGeometry());
                self.map.fitBounds(bounds);
            }
        });
    });

    $('.region-profile-button').click(function () {

        var country = $('#regions').val();
        if (country == -1)
            return false;

        var embedUrl;
        switch (country){
            case 'Comoros':
                embedUrl = '//electricitypowerplants.knoema.com/resource/embed/gbgujnd?noHeader=1&location=Comoros';
                break;
            case 'Equatorial Guinea':
                embedUrl = '//electricitypowerplants.knoema.com/resource/embed/suhkgpg?noHeader=1';
                break;
            case 'Sudan':
            case 'South Sudan':
                embedUrl = '//electricitypowerplants.knoema.com/resource/embed/hoikemg?noHeader=1&location=Sudan and South Sudan';
                break;
            case 'Sao Tome and Principe':
                embedUrl = '//electricitypowerplants.knoema.com/resource/embed/gbgujnd?noHeader=1&location=Sao Tome and Principe';
                break;
            default:
                embedUrl = '//electricitypowerplants.knoema.com/resource/embed/hoikemg?noHeader=1&location=' + country;
        }

        $('#tmpl-region-profile').tmpl({ country: country, embedUrl: embedUrl }).appendTo('#application');

        $('.passport__close').click(function () {
            $('.passport-popup').remove();
        });

        return false;
    });
}

Application.prototype._extendBoundsByGeometry = function (bounds, geometry) {
    var arr = geometry.getArray();
    for (var i = 0; i < arr.length; i++) {
        if (typeof(arr[i].getArray) == 'function') {
            this._extendBoundsByGeometry(bounds, arr[i]);
        } else {
            bounds.extend(arr[i]);
        }
    }
};

Application.prototype.reloadLayers = function () {
    var self = this;
    self.infoWindow.setMap(null);
    _.each(_.keys(this.layers), function(layerId) {
        self.loadLayer(layerId);
    });
};

Application.prototype.onBeforeDraw = function (event, callback, layerId) {
    var self = this;

    var typeData = getDataByType(event.data.content.Type);
    event.data.icon = {
        url: typeData.iconUrl,
        size: new google.maps.Size(30, 41),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(15, 20)
    };

    //event.data.visible = event.data.visible && (typeof _.find(self.filterSettings.showCategories, event.data.content.Category) !== 'undefined');
    //event.data.visible = event.data.visible && (typeof _.find(self.filterSettings.showTypes, pointType) !== 'undefined');

    var pointType = getDataByType(event.data.content.Type).name;

    var category =  (event.data.content.Category == 'Not Defined') ? 'Other' : event.data.content.Category;

    if (self.filterSettings.showCategories.indexOf(category) < 0) {
        event.data.visible = false;
    }

    if (self.filterSettings.showTypes.indexOf(pointType) < 0) {
        event.data.visible = false;
    }

    callback(event.data);
};

Application.prototype.onLayerLoaded = function (loadedLayer) {
    console.log('loadedLayer', loadedLayer);
};

Application.prototype.refreshFilterSettings = function () {
    var self = this;

    var newTypes = [];
    $('#type-filter').find('[data-type-filter]').each(function() {
        var $elem = $(this);
        if ($elem.is(':checked')) {
            newTypes.push($elem.data('type'));
        }
    });
    self.filterSettings.showTypes = newTypes;

    var newCategories = [];
    $('#category-filter').find('[data-category-filter]').each(function() {
        var $elem = $(this);
        if ($elem.is(':checked')) {
            newCategories.push($elem.data('type'));
        }
    });
    self.filterSettings.showCategories = newCategories;

    self.reloadLayers();
};

Application.prototype.loadLayer = function (layerId) {
    var self = this;
    var layer = this.layers[layerId];

    //What for? NO css rules! Add them!
    var $elem = $(this.element);

    $elem.addClass('loading');

    if (!layer) {

        layer = new GeoPlayground.Layer({
            map: self.map,
            layerId: layerId,
            geoPlaygroundId: self.options.geoPlaygroundId,
            bubblesLayer: self.bubblesLayer
        }, function(loadedLayer) {

                //self.map.fitBounds(loadedLayer.layer.bounds);

                 var types = _.groupBy(_.chunk(loadedLayer.layer.data.data, loadedLayer.layer.data.columns.length), function(d) {
                    return d[4];
                });

                var items = _.uniq(_.map(_.keys(types), function(typeKey) {
                    var d = getDataByType(typeKey);
                    return d.name;
                }).filter(function(item) {
                        return item !== 'Other';
                    })
                );

                items.push('Other');

                if (!this.sideBarLoaded) {

                    var sideBarItems = _.map(items, function(item) {
                        var d = getDataByType(item);
                        return {
                            itemName: d.name,
                            itemClassName: d.className
                        };
                    });

                    var $sideBarContent = $('#tmpl-side-bar').tmpl({
                        sideBarItems: sideBarItems
                    });

                    $('#sidebar-holder').html($sideBarContent.html());

                    $('#type-filter, #category-filter').on('click', 'input', function(e) {
                        self.refreshFilterSettings();
                    });
                    this.sideBarLoaded = true;
                }

                $elem.removeClass('loading');

                $(window).trigger('resize');
        });

        layer.on('click', function (e) {
            var data = {
                Name: e.data.tooltip.Name,
                Type: e.data.tooltip.Type,
                Category: e.data.tooltip.Category,
                Capacity: e.data.tooltip['Capacity (MW)'],
                Status: e.data.tooltip['Status, Notes']
            };

            var $tooltipContent = $('#tmpl-tooltip').tmpl({
                data: data
            });

            self.infoWindow.setContent($tooltipContent.html());

            self.infoWindow.setPosition(e.data.latLng);
            self.infoWindow.open(self.map);
        });

        layer.on('beforeDraw', function (e, callback) {
            self.onBeforeDraw(e, callback, layerId);
        });

        self.layers[layerId] = layer;
    }
    layer.load();
};