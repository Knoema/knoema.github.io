function Application(options) {
    if (typeof options.selector === 'undefined' || typeof options.geoPlaygroundId === 'undefined') {
        throw 'Required options are "selector" and "geoPlaygroundId"';
    }

    this.options = options;
    this.datasetId = options.datasetId;
    this.$element = $(options.selector);

    this.map = null;
    this.infoWindow = new google.maps.InfoWindow();
    this.layerId = options.layerId;
    this.layer = null;

    this.energySources = [];
    this.stations = [];
    this.countries = []; //{ name: 'Algeria', regionId: 'DZ' }
    
    this.filterSettings = {
        showCategories: ['Renewable', 'Non-renewable', 'Other'],
        showTypes: ['Coal', 'Fuel Oil', 'Gas', 'Hydro', 'Nuclear', 'Solar', 'Wind', 'Geothermal', 'Other'],
        capacity: {}
    };

    this.sideBarLoaded = false;

    this.currentRegion = '';
    this.currentCountryId = '';
    this.currentCountryName = '';

    this.initMap();
    this.bindEvents();
    this.initRegionSelector();
    this.initCountrySelector();
};

Application.prototype.initMap = function() {

    var $map = this.$element.find('#map-canvas');

    //TODO Get map capacityFilter from options
    this.map = new google.maps.Map($map.get(0), {
        center: {lat: -3, lng: 30},
        zoom: 3,
        streetViewControl: false,
        zoomControlOptions: { position: google.maps.ControlPosition.LEFT_TOP },
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    this.loadLayer();
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

    var capacities = _.map(self.stations, 'Capacity (MW)');

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

        if ($.isNumeric(value) && value < self.filterSettings.capacity._max && value > self.filterSettings.capacity._min) {
            self.filterSettings.capacity.min = value;
        }
        else {
            self.filterSettings.capacity.min = self.filterSettings.capacity._min;
            min.val(self.filterSettings.capacity.min);
        }

        slider.slider('option', 'values', [self.filterSettings.capacity.min, self.filterSettings.capacity.max]);

        self.refreshFilterSettings();
    });

    max.change(function () {
        var value = parseFloat($(this).val());

        if ($.isNumeric(value) && value < self.filterSettings.capacity._max && value > self.filterSettings.capacity._min) {
            self.filterSettings.capacity.max = value;
        }
        else {
            self.filterSettings.capacity.max = self.filterSettings.capacity._max;
            max.val(self.filterSettings.capacity.max);
        }

        slider.slider('option', 'values', [self.filterSettings.capacity.min, self.filterSettings.capacity.max]);

        self.refreshFilterSettings();
    });

    slider.slider({
        range: true,
        min: self.filterSettings.capacity._min,
        max: self.filterSettings.capacity._max,
        values: [self.filterSettings.capacity._min, self.filterSettings.capacity._max],
        change: function (event, ui) {
            if (event.originalEvent) {

                _.extend(self.filterSettings.capacity, {
                    min: ui.values[0],
                    max: ui.values[1]
                });
                min.val(self.filterSettings.capacity.min);
                max.val(self.filterSettings.capacity.max);
                self.refreshFilterSettings();
            }
        }
    });
}

Application.prototype.initRegionSelector = function () {

    var self = this;

    $('#regions').on('change', function(event) {

        self.resetAreaSelector();

        self.currentRegion = $(event.delegateTarget).val();
        if (self.currentRegion)
            self.updateOverview({ title: self.currentRegion, region: self.currentRegion });
        else if (self.currentCountryId)
            self.updateOverview({ title: self.currentCountryName, countryId: self.currentCountryId });
        else
            self.updateOverview({ title: 'Africa' });
    });
}

Application.prototype.initCountrySelector = function(){

    var self = this;

    this.map.data.loadGeoJson('world.json');
    this.map.data.setStyle({
        strokeWeight: 1,
        fillColor: '#aeaeae',
        visible: false,
        clickable: false
    });
    
    var url = 'http://knoema.com/api/1.0/meta/dataset/' + self.datasetId + '/dimension/country';

    Knoema.Helpers.get(url, function(response) {
        if (response && response.items && response.items.length) {

            self.countries = _.map(response.items, function(i){
                return {
                    countryName: i.name,
                    countryId: i.fields.regionid
                };
            })

            var $selectorContent = $('#tmpl-country-selector').tmpl({
               countries: self.countries
            });
            
            $('#country-selector').append($selectorContent);

            $('#countries').on('change', function(event) {

                self.resetAreaSelector();
                self.currentCountryId = $(event.delegateTarget).val();

                if (self.currentCountryId) {
                    self.currentCountryName = $(event.delegateTarget).find(':selected').text();

                    self.map.data.forEach(function (feature) {
                        self.map.data.revertStyle(feature);

                        var visible = self.currentCountryId == feature.getId();

                        //do not show region because borders are rough
                        //self.map.data.overrideStyle(feature, { visible: visible });

                        if (visible) {
                            var bounds = new google.maps.LatLngBounds();
                            self.extendBoundsByGeometry(bounds, feature.getGeometry());
                            self.map.fitBounds(bounds);
                        }
                    });

                    self.updateOverview({ title: self.currentCountryName, countryId: self.currentCountryId });
                }
                else if (self.currentRegion)
                    self.updateOverview({ title: self.currentRegion, region: self.currentRegion });
                else
                    self.updateOverview({ title: 'Africa' });
            });
        }
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

    google.maps.event.addListener(drawingManager, 'circlecomplete', function(circle) {
        drawingManager.setDrawingMode(null);

        self.radiusToolCircle = circle;

        var updateArea = function(circle){
            var itemsInArea = [];
            _.each(self.stations, function(item) {
                var distance = google.maps.geometry.spherical.computeDistanceBetween(circle.getCenter(), new google.maps.LatLng(item['Latitude'], item['Longitude']));
                if (distance < circle.getRadius())
                    itemsInArea.push(item);
            });

            self.updateOverview({ title: 'Selected area', stations: itemsInArea });
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

        if (this.currentCountryId)
            this.updateOverview({ title: this.currentCountryName, countryId: this.currentCountryId });
        else if (this.currentRegion)
            this.updateOverview({ title: this.currentRegion, region: this.currentRegion });
        else
            this.updateOverview({ title: 'Africa' });
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

/*
options = {
    title: '',
    countryId: ''
    region: '', //SADC, COMESA, ECOWAS, EAC, AMU, ECCAS, Africa
    stations: '' //stations is used for selected area
}
 */

Application.prototype.updateOverview = function (options) {

    var self = this;

    var stations = self.stations;
    
    if (options.stations)
        stations = options.stations;

    if (options.countryId) {
        stations = _.filter(stations, function (s) {
            return s['RegionId'] == options.countryId;
        });
    }
    else if (options.region) {
        var countries = getCountriesByRegion(options.region);
        if (countries && countries.length)
            stations = _.filter(stations, function (s) {
                return _.indexOf(countries, s['Country']) > -1;
            });
    }

    var opt = {
        title: options.title,
        countryId: options.countryId,
        types: self.energySources,
        stationsByType: _.mapValues(_.groupBy(stations, 'Type'), function(g) {
            return g.length;
        }),
        stations: _.chain(stations).filter(function(s) { return s['Capacity (MW)']; }).sortBy('Capacity (MW)').reverse().value()
    };

    var $overviewHolder = $('#overview-holder').empty().html($('#tmpl-overview').tmpl(opt));

    $overviewHolder.find('.country-profile-button').click(function () {
        self.showCountryProfile(options.title);
    });
}

Application.prototype.showCountryProfile = function(country) {
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

    $('#tmpl-country-profile').tmpl({ country: country, embedUrl: embedUrl }).appendTo('#application');

    $('.passport-close').click(function () {
        $('.passport-popup').remove();
    });

    return false;
}

Application.prototype.loadLayer = function () {
    var self = this;
    var $elem = this.$element;

    if (!this.layer) {

        $elem.addClass('loading');

        this.layer = new GeoPlayground.Layer({
            map: self.map,
            layerId: self.layerId,
            geoPlaygroundId: self.options.geoPlaygroundId,
        }, function(loadedLayer) {

            var columns = _.map(loadedLayer.layer.data.columns, function(i) { return i['name']; });
            var data = _.chunk(loadedLayer.layer.data.data, loadedLayer.layer.data.columns.length);

            self.stations = _.map(data, function(item){
               var station = {};
                _.each(item, function(prop, i) {
                    if (columns[i] == 'Type')
                        station[columns[i]] = getDataByType(prop).name;
                    else
                        station[columns[i]] = prop;
                });
                return station;
            });

            var types = _.uniq(_.map(self.stations, 'Type')).filter(function(type) { return type != 'Other'});
            types.push('Other'); //should be in the end

            self.energySources = _.map(types, function (type) {
                return getDataByType(type);
            });

            if (!self.sideBarLoaded) {

                var $sideBarContent = $('#tmpl-side-bar').tmpl({
                    sideBarItems: self.energySources
                });

                $('#sidebar-holder').html($sideBarContent.html());

                $('#type-filter, #category-filter').on('click', 'input', function(e) {
                    self.refreshFilterSettings();
                });

                self.initCapacityFilter();
                self.initAreaSelector();
                self.updateOverview({ title: 'Africa' });

                self.sideBarLoaded = true;
            }

            $elem.removeClass('loading');
        });

        this.layer.on('click', function (e) {
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

        this.layer.on('beforeDraw', function (e, callback) {
            self.onBeforeDraw(e, callback);
        });
    }

    this.layer.load();
};

Application.prototype.onBeforeDraw = function (event, callback) {
    var self = this;

    var typeData = getDataByType(event.data.content.Type);
    event.data.icon = {
        url: typeData.iconUrl,
        size: new google.maps.Size(30, 41),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(15, 20)
    };

    if (self.filterSettings.showTypes.indexOf(typeData.name) < 0) {
        event.data.visible = false;
    }

    var category =  (event.data.content.Category == 'Not Defined') ? 'Other' : event.data.content.Category;
    if (self.filterSettings.showCategories.indexOf(category) < 0) {
        event.data.visible = false;
    }

    if (self.filterSettings.capacity) {
        if (!event.data.content['Capacity (MW)'])
            event.data.visible = false;



        if (typeof(self.filterSettings.capacity.min) !== "undefined" && self.filterSettings.capacity.min !== null && event.data.content['Capacity (MW)'] < self.filterSettings.capacity.min)
            event.data.visible = false;

        if (typeof(self.filterSettings.capacity.max) !== "undefined" && self.filterSettings.capacity.max !== null && event.data.content['Capacity (MW)'] > self.filterSettings.capacity.max)
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

    self.loadLayer();
};
