function Application(options) {
    if (typeof options.selector === 'undefined' || typeof options.geoPlaygroundId === 'undefined') {
        throw 'Required options are "selector" and "geoPlaygroundId"';
    }

    this.datasetId = '';
    
    this.infoWindow = new google.maps.InfoWindow();

    this.options = options;
    this.$element = $(options.selector);
    this.layers = {};
    this.sideBarLoaded = false;

    this.countries = []; //{ name: 'Algeria', regionId: 'DZ' }
    
    this.filterSettings = {
        showCategories: ['Renewable', 'Non-renewable', 'Other'],
        showTypes: ['Coal', 'Fuel Oil', 'Gas', 'Hydro', 'Nuclear', 'Solar', 'Wind', 'Geothermal', 'Other'],
        capacity: {}
    };
    
    this.initMap();
    this.bindEvents();
    this.initRegionSelector();

};

Application.prototype.initMap = function() {

    var self = this;
    var $map = this.$element.find('#map-canvas');

    //TODO Get map capacityFilter from options
    this.map = new google.maps.Map($map.get(0), {
        center: {lat: -3, lng: 30},
        zoom: 3,
        streetViewControl: false,
        zoomControlOptions: { position: google.maps.ControlPosition.LEFT_TOP },
        //mapTypeControlOptions: { position: google.maps.ControlPosition.LEFT_TOP },
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

Application.prototype.initCapacityFilter = function(){
    var self = this;

    var layer = this.layers[Object.keys(this.layers)[0]];
    var capacities = _.map(layer.data, function (i) { return i[layer.columns.indexOf('Capacity (MW)')]; });

    self.filterSettings.capacity = {
        _min: Math.round(_.min(capacities)),
        _max: Math.round(_.max(capacities)),
        min: Math.round(_.min(capacities)),
        max: Math.round(_.max(capacities))
    }

    var container = $('.capacity');
    var min = container.find('.min');
    var max = container.find('.max');
    var slider = container.find('.slider');

    min.val(self.filterSettings.capacity.min);
    max.val(self.filterSettings.capacity.max);

    min.change(function () {
        var value = parseFloat($(this).val());

        if ($.isNumeric(value) && value <= self.filterSettings.capacity._max && value >= self.filterSettings.capacity._min) {
            self.filterSettings.capacity.min = value;
            slider.slider('option', 'values', [self.filterSettings.capacity.min, self.filterSettings.capacity.max]);
        }

        min.val(self.filterSettings.capacity.min);

        self.reloadLayers();
    });

    max.change(function () {
        var value = parseFloat($(this).val());

        if ($.isNumeric(value) && value <= self.filterSettings.capacity._max && value >= self.filterSettings.capacity._min) {
            self.filterSettings.capacity.max = value;
            slider.slider('option', 'values', [self.filterSettings.capacity.min, self.filterSettings.capacity.max]);
        }

        max.val(self.filterSettings.capacity.max);

        self.reloadLayers();
    });

    slider.slider({
        range: true,
        min: self.filterSettings.capacity._min,
        max: self.filterSettings.capacity._max,
        values: [self.filterSettings.capacity._min, self.filterSettings.capacity._max],
        change: function (event, ui) {

            _.extend(self.filterSettings.capacity, {
                min: ui.values[0],
                max: ui.values[1]
            });

            min.val(self.filterSettings.capacity.min);
            max.val(self.filterSettings.capacity.max);

            self.reloadLayers();
        }
    });
}

Application.prototype.initRegionSelector = function(){

    var self = this;

    this.map.data.loadGeoJson('world.json');
    this.map.data.setStyle({
        strokeWeight: 1,
        fillColor: '#aeaeae',
        visible: false,
        clickable: false
    });
    
    var url = 'http://knoema.com/api/1.0/meta/dataset/' + self.options.datasetId + '/dimension/country';
    Knoema.Helpers.get(url, function(response) {
        if (response && response.items && response.items.length) {
            self.countries = _.map(response.items, function(i){
                return { name: i.name, regionid: i.fields.regionid };
            })

            var $selectorContent = $('#tmpl-regions-control').tmpl({
               regions: self.countries 
            });
            
            $('#region-selector').append($selectorContent);

            $('#regions').on('change', function(event) {

                self.resetAreaSelector();

                var regionId = $(event.delegateTarget).val();
                var regionName = $(event.delegateTarget).find(':selected').text();

                self.map.data.forEach(function(feature) {
                    self.map.data.revertStyle(feature);

                    var visible = regionId == feature.getId();

                    //do not show region because borders are rough
                    //self.map.data.overrideStyle(feature, { visible: visible });

                    if (visible) {
                        var bounds = new google.maps.LatLngBounds();
                        self.extendBoundsByGeometry(bounds, feature.getGeometry());
                        self.map.fitBounds(bounds);
                    }
                });

                var layer = self.layers[Object.keys(self.layers)[0]];
                var items = _.filter(layer.data, function(i) {
                    return i[layer.columns.indexOf('Country')] == regionName
                });

                self.showOverview(regionName, items);
            });
        }
    });

    $('.region-profile-button').click(function () {

        var regionId = $('#regions').val();
        var country = $('#regions :selected').text();
        if (!regionId)
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

Application.prototype.initAreaSelector = function () {
    var $radiusButton = $('.area-profile-button');
    if ($radiusButton.length == 0) return;

    var drawingManager = new google.maps.drawing.DrawingManager({
        map: this.map,
        drawingMode: null,
        drawingControl: false,
        circleOptions: {
            fillColor: 'black',
            fillOpacity: 0.2,
            strokeWeight: 4,
            strokeColor: 'orange',
            clickable: false,
            editable: true,
            zIndex: 1
        }
    });

    var self = this;

    var layer = this.layers[Object.keys(this.layers)[0]];

    google.maps.event.addListener(drawingManager, 'circlecomplete', function(circle) {
        drawingManager.setDrawingMode(null);

        self.radiusToolCircle = circle;

        var updateArea = function(circle){
            var itemsInArea = [];
            _.each(layer.data, function(item) {
                var distance = google.maps.geometry.spherical.computeDistanceBetween(circle.getCenter(), new google.maps.LatLng(item[9], item[10]));
                if (distance < circle.getRadius())
                    itemsInArea.push(item);
            });

            self.showOverview('Selected area', itemsInArea);
        }

        updateArea(circle);

        google.maps.event.addListener(circle, 'center_changed', function () {
            updateArea(circle);
        });

        google.maps.event.addListener(circle, 'radius_changed', function() {
            updateArea(circle);
        });
    });

    $radiusButton.on('click', function() {
        $radiusButton.toggleClass('active');
        if ($radiusButton.hasClass('active')) {
            drawingManager.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
        } else {
            drawingManager.setDrawingMode(null);
            self.resetAreaSelector();
        }
    });
};

Application.prototype.resetAreaSelector = function () {
    $('.area-profile-button').removeClass('active');
    if (this.radiusToolCircle) {
        this.radiusToolCircle.setMap(null);
        this.radiusToolCircle = null;
        this.hideOverview();
    }
}

Application.prototype.extendBoundsByGeometry = function (bounds, geometry) {
    var arr = geometry.getArray();
    for (var i = 0; i < arr.length; i++) {
        if (typeof(arr[i].getArray) == 'function')
            this.extendBoundsByGeometry(bounds, arr[i]);
        else
            bounds.extend(arr[i]);
    }
};

Application.prototype.showOverview = function (regionName, items) {

    var options = {
        regionName: regionName
        /*
        stationsByType:
        {
        'Coal': 123,
        'Fuel Oil': 45
        },
        stations: [
        { name: 'Station1', capacity: 300000 },
        { name: 'Station2', capacity: 550000 },
        { name: 'Station3', capacity: 12500 }
        ]
        */
    }

    var layer = this.layers[Object.keys(this.layers)[0]];

    var countryStations = items;

    countryStations = _.each(countryStations, function(i){
        i[layer.columns.indexOf('Type')] = getDataByType(i[layer.columns.indexOf('Type')]).name;
    });

    _.extend(options, {
        types: _.map(layer.types, function(item) {
            var d = getDataByType(item);
            return {
                itemName: d.name,
                itemClassName: d.className
            };
        }),
        stationsByType: _.mapValues(_.groupBy(countryStations, function(i) {
            return i[layer.columns.indexOf('Type')];
        }), function(i) {
            return i.length;
        }),
        stations: _.map(countryStations, function(i) {
            return {
                name: i[layer.columns.indexOf('Name')],
                capacity: i[layer.columns.indexOf('Capacity (MW)')]
            }
        })
    });

    var $overviewContent = $('#tmpl-overview').tmpl(options);
    var $overviewHolder = $('#overview-holder').html($overviewContent);
    //if (!$overviewHolder.is(':visible'))
    //    $overviewHolder.animate({width:'toggle'}, 400);
    $overviewHolder.show();
}

Application.prototype.hideOverview = function (options) {
    $('#overview-holder').empty();
}

Application.prototype.loadLayer = function (layerId) {
    var self = this;
    var layer = this.layers[layerId];

    var $elem = this.$element;
    $elem.addClass('loading');

    if (!layer) {

        layer = new GeoPlayground.Layer({
            map: self.map,
            layerId: layerId,
            geoPlaygroundId: self.options.geoPlaygroundId,
        }, function(loadedLayer) {

            //self.map.fitBounds(loadedLayer.layer.bounds);

            layer.columns = _.map(loadedLayer.layer.data.columns, function(i) { return i['name']; });
            layer.data = _.chunk(loadedLayer.layer.data.data, loadedLayer.layer.data.columns.length);

            var types = _.groupBy(layer.data, function(d) {
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

            layer.types = items;

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

                /* INIT */
                self.initCapacityFilter();
                self.initAreaSelector();
            }

            $elem.removeClass('loading');
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

Application.prototype.onBeforeDraw = function (event, callback, layerId) {
    var self = this;

    var typeData = getDataByType(event.data.content.Type);
    event.data.icon = {
        url: typeData.iconUrl,
        size: new google.maps.Size(30, 41),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(15, 20)
    };

    var category =  (event.data.content.Category == 'Not Defined') ? 'Other' : event.data.content.Category;
    if (self.filterSettings.showCategories.indexOf(category) < 0) {
        event.data.visible = false;
    }

    var pointType = getDataByType(event.data.content.Type).name;
    if (self.filterSettings.showTypes.indexOf(pointType) < 0) {
        event.data.visible = false;
    }

    if (self.filterSettings.capacity) {
        if (!event.data.content['Capacity (MW)'])
            event.data.visible = false;

        if (self.filterSettings.capacity.min && event.data.content['Capacity (MW)'] < self.filterSettings.capacity.min)
            event.data.visible = false;

        if (self.filterSettings.capacity.max && event.data.content['Capacity (MW)'] > self.filterSettings.capacity.max)
            event.data.visible = false;
    }

    callback(event.data);
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

Application.prototype.reloadLayers = function () {
    var self = this;
    self.infoWindow.setMap(null);
    _.each(_.keys(this.layers), function(layerId) {
        self.loadLayer(layerId);
    });
};
