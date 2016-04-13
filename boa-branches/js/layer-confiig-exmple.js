$(function() {

    Knoema.Helpers.post('/api/1.0/data/details', dataDescriptor, function(data) {

        debugger;
        //data.columns.map((c) => c.name)
        //["State", "Zone", "Business Outlets", "Location", "Latitude", "Longitude", "Number of Clients", "Disbursement, SME, NGN", "Disbursement, SME, NGN - Rating", "Disbursement, Micro Agriculture, NGN", "Disbursement, Micro Agriculture, NGN - Rating", "Disbursement, Micro Non-Agriculture, NGN", "Disbursement, Micro Non-Agriculture, NGN - Rating", "Outstanding, Principal, NGN", "Outstanding, Interest, NGN", "Outstanding, Total, NGN", "Outstanding: Rating", "Total ratings, Credit", "Total ratings, Savings", "Total ratings, Total", "Total ratings, Grade"]

        var layer = {
            dataToDisplay: [

            ]
        };
        var self = this;
        var settings = {
            bubble: {
                minRadius: 10,
                maxRadius: 30,
                color: 'ff0000',
                colorDimension: null,
                sizeDimension: null
            },
            opacity: 0.5
        };

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

        //size
        var minValue;
        var maxValue;

        for (var key in layer.parsedData) {

            var parsedData = layer.parsedData[key];

            for (i = 0; i < parsedData.length; i++) {

                var item = parsedData[i];

                bubbles.items.push($.extend({ time: key }, item));

                layer.bounds.extend(new google.maps.LatLng(item.location.latitude, item.location.longitude));

                if (settings.bubble.sizeDimension) {

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

            min: settings.bubble.minRadius,
            max: settings.bubble.maxRadius,
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
            size: settings.bubble.sizeDimension,
            color: settings.bubble.colorDimension,
            colorScale: colorScale,
            sizeScale: sizeScale,
            overlay: this.bubblesOverlay,

            settings: {
                fillColor: '#' + settings.bubble.color,
                fillOpacity: settings.opacity,
                strokeColor: '#' + (settings.bubble.borderColor || 'eaeaea'),
                strokeWeight: 1,
                radius: settings.bubble.minRadius
            }
        });

        bubblesLayer.draw(bubbles, start, end, layer.dataToDisplay.length <= 500 ? this.animation : null, function () {
            self.trigger('loaded');
        });

    });
});
