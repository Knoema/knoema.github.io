/// <reference path="typings/jquery.d.ts"/>
/// <reference path="typings/google.maps.d.ts"/>
var Infrastructure;
(function (Infrastructure) {
    // Normalizes the coords that tiles repeat across the x axis (horizontally)
    // like the standard Google map tiles.
    function getNormalizedCoord(coord, zoom) {
        var y = coord.y;
        var x = coord.x;

        // tile range in one direction range is dependent on zoom level
        // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
        var tileRange = 1 << zoom;

        // don't repeat across y-axis (vertically)
        if (y < 0 || y >= tileRange) {
            return null;
        }

        // repeat across x-axis
        if (x < 0 || x >= tileRange) {
            x = (x % tileRange + tileRange) % tileRange;
        }

        return {x: x, y: y};
    }

    var Application = (function () {
        function Application() {
        }
        Application.prototype.run = function () {
            var _this = this;
            var map = this.map = new google.maps.Map(document.getElementById('map-canvas'), {
                center: { lat: 11.0310179, lng: 18.9726628 },
                zoom: 3
            });

            // digitalglobe tiles
            {
                var api_key = 'pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6IjlkYmIxZTg3OThkNTMzZTg1ZjA1Y2Y1ODdhN2UwNjFkIn0.eQF0Mj5JvX75xFaCFthd1A';
                map.mapTypes.set('digitalglobe', new google.maps.ImageMapType({
                    getTileUrl: function(coord, zoom) {
                        coord = getNormalizedCoord(coord, zoom);
                        if (!coord) return null;
                        return 'https://api.tiles.mapbox.com/v4/digitalglobe.n6nhclo2/'+zoom+'/'+coord.x+'/'+coord.y+'.png?access_token=' + api_key
                    },
                    tileSize: new google.maps.Size(256, 256),
                    maxZoom: 19,
                    minZoom: 0,
                    name: 'digitalglobe'
                }));
                map.setMapTypeId('digitalglobe');
            }

            this.getObjects().done(function (data) {
                _this.addObjectsToMap(_this.map, data);
                $(document.body).removeClass('loading');
            });

            var self = this;
            $('#options-form').on('change', function () {
                var mode = $('#options-form input[name="mode"]:checked').val();
                switch (mode) {
                    case 'markers':
                        self.markerClusterer.getMarkers().forEach(function (marker) {
                            return marker.setVisible(true);
                        });
                        self.markerClusterer.repaint();
                        self.heatmap.setMap(null);
                        break;
                    case 'heatmap':
                        self.markerClusterer.getMarkers().forEach(function (marker) {
                            return marker.setVisible(false);
                        });
                        self.markerClusterer.repaint();
                        self.heatmap.setMap(self.map);
                        break;
                }
            });
        };

        Application.prototype.addObjectsToMap = function (map, data) {
            console.log(data);
            var infoWindow = new google.maps.InfoWindow();
            var rowCount = Math.floor(data.data.length / data.columns.length);
            var markers = [];
            var heatmapArray = [];

            for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                var rowOffset = rowIndex * data.columns.length;
                var description = '<table>';
                for (var colIndex = 0; colIndex < data.columns.length; colIndex++) {
                    var dataIndex = rowOffset + colIndex;
                    var value = (data.columns[colIndex].type === 'Date') ? data.data[dataIndex].value : data.data[dataIndex];
                    description += '<tr><th>' + data.columns[colIndex].name + '</th><td>' + value + '</td></tr>';
                }
                description += '<table>';

                var latLng = new google.maps.LatLng(data.data[rowOffset + 3], data.data[rowOffset + 4]);
                heatmapArray.push(latLng);

                var marker = new google.maps.Marker();
                marker.setPosition(latLng);
                marker.set('desc', description);
                marker.setIcon('Images/hospital-sign-icon-32.png');

                google.maps.event.addListener(marker, 'click', function () {
                    infoWindow.setContent(this.get('desc'));
                    infoWindow.open(map, this);
                });

                markers.push(marker);
            }

            this.heatmap = new google.maps.visualization.HeatmapLayer({
                data: heatmapArray,
                radius: 20
            });

            // http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/docs/reference.html
            this.markerClusterer = new window['MarkerClusterer'](map, markers, {
                ignoreHidden: true,
                styles: [
                    {
                        url: 'Images/hospital-sign-icon-32.png',
                        width: 32,
                        height: 32,
                        textColor: '#ffffff',
                        textSize: 10
                    }, {
                        url: 'Images/hospital-sign-icon-48.png',
                        width: 48,
                        height: 48,
                        textColor: '#ffffff',
                        textSize: 11
                    }, {
                        url: 'Images/hospital-sign-icon-64.png',
                        width: 64,
                        height: 64,
                        textColor: '#ffffff',
                        textSize: 12
                    }]
            });
        };

        Application.prototype.getObjects = function () {
            var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=bfynnxc&accesskey=cxnosz';
            var data = {
                Dataset: "bfynnxc",
                Filter: [
                    {
                        DatasetId: "bfynnxc",
                        DimensionId: "country",
                        DimensionName: "Country",
                        Order: "0",
                        isGeo: true,
                        Members: [
                            "1000000", "1000010", "1000020", "1000030", "1000040", "1000050", "1000060", "1000070", "1000080",
                            "1000090", "1000100", "1000110", "1000120", "1000130", "1000140", "1000150", "1000160", "1000170",
                            "1000180", "1000190", "1000200", "1000210", "1000220", "1000230", "1000240", "1000250", "1000260",
                            "1000270", "1000280", "1000290", "1000300", "1000310", "1000320", "1000330", "1000340", "1000350",
                            "1000360", "1000370", "1000380", "1000390", "1000400", "1000410", "1000420", "1000430", "1000440",
                            "1000450", "1000460", "1000470", "1000480", "1000490", "1000500", "1000510", "1000520", "1000530"
                        ]
                    }
                ],
                Frequencies: [],
                Header: [],
                MeasureAggregations: null,
                Stub: []
            };
            return $.post(url, data);
        };
        return Application;
    })();

    google.maps.event.addDomListener(window, 'load', function () {
        var greeter = new Application();
        greeter.run();
    });
})(Infrastructure || (Infrastructure = {}));
//# sourceMappingURL=app.js.map
