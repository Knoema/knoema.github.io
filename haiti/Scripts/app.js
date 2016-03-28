/// <reference path="typings/jquery.d.ts"/>
/// <reference path="typings/google.maps.d.ts"/>
var Infrastructure;
(function (Infrastructure) {
    var Application = (function () {
        function Application() {
        }
        Application.prototype.run = function () {
            var _this = this;
            this.map = new google.maps.Map(document.getElementById('map-canvas'), {
                center: { lat: 11.0310179, lng: 18.9726628 },
                zoom: 3
            });
            this.getObjects().done(function (data) {
                _this.addObjectsToMap(_this.map, data);
                $(document.body).removeClass('loading');
            });

            $(document).on('click', '[data-target="more-data"]', function(e) {
                e.preventDefault();

                var data = window.AppMapData;
                var rowIndex = $(this).data('row') * 1;
                var rowOffset = rowIndex * data.columns.length;
                var description = '<h1>' + data.data[rowOffset] + '</h1>';
                description += '<table>';
                for (var colIndex = 1; colIndex < data.columns.length; colIndex++) {
                    var dataIndex = rowOffset + colIndex;
                    var value = (data.columns[colIndex].type === 'Date') ? data.data[dataIndex].value : data.data[dataIndex];
                    description += '<tr><th style="text-align: left;">' + data.columns[colIndex].name + '</th><td>' + value + '</td></tr>';
                }
                description += '</table>';

                var myWindow = window.open("", "_blank");
                myWindow.document.write(description);

                return false;
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

            // hack - need to passe data into [data-target="more-data"] click handler
            window.AppMapData = data;

            var visibleColumnCount = 15;
            for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                var rowOffset = rowIndex * data.columns.length;
                var description = '<table>';
                for (var colIndex = 0; colIndex < visibleColumnCount; colIndex++) {
                    var dataIndex = rowOffset + colIndex;
                    var value = (data.columns[colIndex].type === 'Date') ? data.data[dataIndex].value : data.data[dataIndex];
                    description += '<tr><th>' + data.columns[colIndex].name + '</th><td>' + value + '</td></tr>';
                }
                description += '</table>';
                description += '<div class="text-center"><a href="#" data-target="more-data" data-row="' + rowIndex + '">More Data</a></div>';

                var latLng = new google.maps.LatLng(data.data[rowOffset + 2], data.data[rowOffset + 3]);
                heatmapArray.push(latLng);

                var marker = new google.maps.Marker();
                marker.setPosition(latLng);
                marker.set('desc', description);
                marker.setIcon('Images/hospital-sign-icon-32.png?v=1');

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
                        url: 'Images/hospital-sign-icon-32.png?v=1',
                        width: 32,
                        height: 32,
                        textColor: '#000000',
                        textSize: 12
                    }, {
                        url: 'Images/hospital-sign-icon-48.png?v=1',
                        width: 48,
                        height: 48,
                        textColor: '#000000',
                        textSize: 13
                    }, {
                        url: 'Images/hospital-sign-icon-64.png?v=1',
                        width: 64,
                        height: 64,
                        textColor: '#000000',
                        textSize: 14
                    }]
            });
            this.markerClusterer.fitMapToMarkers();
        };

        Application.prototype.getObjects = function () {
            var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=bqltdge&accesskey=cxnosz';
            var data = {
                Dataset: "bqltdge",
                Filter: [
                    {
                        DatasetId: "bqltdge",
                        DimensionId: "site",
                        DimensionName: "SITE",
                        Order: "0",
                        isGeo: true,
                        Members: ["1000000", "1000010", "1000020", "1000030", "1000040"]
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
