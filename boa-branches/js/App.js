function App() {
    this.map = null;
    this.datasetId = 'evbhfsc';
};

App.prototype.run = function () {
    var self = this;
    this.map = new google.maps.Map(document.getElementById('map-canvas'), {
        center: { lat: 6.363070, lng: 6.795044 },
        zoom: 7,
        streetViewControl: false,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        },
        mapTypeId: google.maps.MapTypeId.HYBRID
    });

    this.map.data.loadGeoJson('nigeria.json');
    this.map.data.setStyle({
        strokeWeight: 1,
        fillColor: 'white',
        visible: false,
        clickable: false
    });

    google.maps.event.addListenerOnce(this.map, 'idle', function () {

        //============================================================================
        //============================================================================
        //============================================================================
        Knoema.Helpers.post('/api/1.0/data/details', dataDescriptor, function(data) {

            console.log("data", data);
            //data.columns.map((c) => c.name)
            //["State", "Zone", "Business Outlets", "Location", "Latitude", "Longitude", "Number of Clients", "Disbursement, SME, NGN", "Disbursement, SME, NGN - Rating", "Disbursement, Micro Agriculture, NGN", "Disbursement, Micro Agriculture, NGN - Rating", "Disbursement, Micro Non-Agriculture, NGN", "Disbursement, Micro Non-Agriculture, NGN - Rating", "Outstanding, Principal, NGN", "Outstanding, Interest, NGN", "Outstanding, Total, NGN", "Outstanding: Rating", "Total ratings, Credit", "Total ratings, Savings", "Total ratings, Total", "Total ratings, Grade"]

            var layer = {
                dataToDisplay: [],
                settings: {
                    bubble: {
                        minRadius: 10,
                        maxRadius: 30,
                        color: 'ff0000',
                        colorDimension: null,
                        sizeDimension: null
                    },
                    opacity: 0.5
                }
            };
            var self = this;

            if (layer.dataToDisplay.length)
                layer.bounds = new google.maps.LatLngBounds();

            var bubbles = {
                getProperty: function (obj, property, time) {
                    var value = null;
                    function getValue(obj) {
                        for (var i in obj) {
                            if (!obj.hasOwnProperty(i))
                                continue;
                            if (i == property)
                                value = obj[i];
                            else if (typeof obj[i] == 'object')
                                value = getValue(obj[i], property);
                        }
                        return value;
                    }
                    if (obj['time'] != time)
                        return null;
                    return getValue(obj, property);
                },
                items: []
            };

            //TODO Use GeoPlayground.Layer.prototype.processFlatData

            //size
            var minValue;
            var maxValue;

            for (var key in layer.parsedData) {

                var parsedData = layer.parsedData[key];

                for (i = 0; i < parsedData.length; i++) {

                    var item = parsedData[i];

                    bubbles.items.push($.extend({ time: key }, item));

                    layer.bounds.extend(new google.maps.LatLng(item.location.latitude, item.location.longitude));

                    if (layer.settings.bubble.sizeDimension) {

                        var value = Number(item.data[layer.settings.bubble.sizeDimension]);

                        if (typeof minValue === 'undefined')
                            minValue = value;
                        else if (value < minValue)
                            minValue = value;

                        if (typeof maxValue === 'undefined')
                            maxValue = value;
                        if (value > maxValue)
                            maxValue = value;

                    }
                }
            }

            layer.settings.bubble.sizeScale = [];

            if (minValue)
                layer.settings.bubble.sizeScale.push(minValue);

            if (maxValue)
                layer.settings.bubble.sizeScale.push(maxValue);

            var colorScale = {

                ranges: layer.ranges,

                getColor: function (value) {
                    return self.getColor(this.ranges, value);
                }
            };

            var sizeScale = {

                min: layer.settings.bubble.minRadius,
                max: layer.settings.bubble.maxRadius,
                minValue: minValue,
                maxValue: maxValue,

                getRadius: function (value) {

                    if (!value)
                        return 0;

                    value = Number(value);

                    var result = Math.floor(this.min + (this.max - this.min) * (value - minValue) / (maxValue - minValue));

                    if (layer.settings.bubble.sizeScale.indexOf(result) == -1)
                        layer.settings.bubble.sizeScale.push(value);

                    return result;
                }
            };

            if (!this.bubblesOverlay)
                this.bubblesOverlay = new BubblesOverlay({
                    map: this.map,
                    zIndex: 1000,
                    click: function () {

                        var event = {
                            tooltip: this.content,
                            latLng: this.center
                        };

                        self.trigger('click', event, function (show) {
                            if (!show)
                                self.tooltip(event);
                        });
                    },
                    beforeDraw: function (bubble, callback) {
                        self.trigger('beforeDraw', bubble, callback);
                    }
                });

            var bubblesLayer = new GeoPlayground.Layer.Bubbles({

                lat: 'latitude',
                lng: 'longitude',
                data: 'data',
                size: layer.settings.bubble.sizeDimension,
                color: layer.settings.bubble.colorDimension,
                colorScale: colorScale,
                sizeScale: sizeScale,
                overlay: this.bubblesOverlay,

                settings: {
                    fillColor: '#' + layer.settings.bubble.color,
                    fillOpacity:     layer.settings.opacity,
                    strokeColor: '#' + (layer.settings.bubble.borderColor || 'eaeaea'),
                    strokeWeight: 1,
                    radius: layer.settings.bubble.minRadius
                }
            });

            bubblesLayer.draw(bubbles, "All time", "All time", layer.dataToDisplay.length <= 500 ? this.animation : null, function () {
                self.trigger('loaded');
            });

        });
        //============================================================================
        //============================================================================
        //============================================================================

    });

    this.bindEvents();

    $(window).trigger('resize');

};

App.prototype.bindEvents = function () {

};