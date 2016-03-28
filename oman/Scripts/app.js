/// <reference path="typings/jquery.d.ts"/>
/// <reference path="typings/google.maps.d.ts"/>
var Infrastructure;
(function (Infrastructure) {
    var generateStyle = function (objectTypeName, size, textSize, color, anchor) {
        if (typeof anchor === "undefined") { anchor = undefined; }
        return {
            url: 'Images/' + objectTypeName + '-' + size + '.png',
            width: size,
            height: size,
            textSize: textSize,
            textColor: color,
            anchorText: anchor
        };
    };

    var generateStyles = function (objectTypeName, color, anchor32, anchor48, anchor64) {
        if (typeof anchor32 === "undefined") { anchor32 = undefined; }
        if (typeof anchor48 === "undefined") { anchor48 = undefined; }
        if (typeof anchor64 === "undefined") { anchor64 = undefined; }
        return [
            generateStyle(objectTypeName, 32, 10, color, anchor32),
            generateStyle(objectTypeName, 48, 11, color, anchor48),
            generateStyle(objectTypeName, 64, 12, color, anchor64)
        ];
    };

    var datasets = {
        'jwheayb': {
            title: 'ATMs',
            styles: generateStyles('ATM', '#ffffff', [9, 0], [13, 0], [17, 0])
        },
        'xbpesrf': {
            title: 'Banks',
            styles: generateStyles('Banks', '#000000', [5, 0], [6, 0], [9, 0])
        },
        'evcxdob': {
            title: 'Hotels',
            styles: generateStyles('Hotels', '#000000', [-9, 0], [-15, 0], [-20, 0])
        },
        // Note: There is no Governorate ID exist in this dataset
        'rxmtikb': {
            title: 'Mosques',
            styles: generateStyles('Mosque', '#ffffff')
        },
        'idjmamb': {
            title: 'Landmark Towns',
            styles: generateStyles('LandMarkTowns', '#ffffff')
        },
        'btskswg': {
            title: 'New Landmarks',
            styles: generateStyles('NewLandMark', '#000000', [21, 0], [29, 0], [38, 0])
        },
        'okpzn': {
            title: 'Fuel Stations',
            styles: generateStyles('FuelStations', '#ffffff')
        }
    };

    var Application = (function () {
        function Application() {
            this.markerClusters = {};
        }
        Application.prototype.run = function () {
            this.map = new google.maps.Map(document.getElementById('map-canvas'), {
                center: { lat: 21.6044945, lng: 57.0784942 },
                zoom: 7
            });

            this.initDatasetSelector();
        };

        Application.prototype.initDatasetSelector = function () {
            var _this = this;
            var datasetSelector = $('#datasetSelector');
            for (var datasetId in datasets) {
                datasetSelector.append($('<option value="' + datasetId + '">' + datasets[datasetId].title + '</option>'));
            }
            datasetSelector.on('change', function () {
                console.log(datasetSelector.val());
                _this.showDatasets(datasetSelector.val());
            });
            datasetSelector['selectpicker']();
            datasetSelector['selectpicker']('val', 'okpzn');
            datasetSelector.trigger('change', null, null);
        };

        Application.prototype.showDatasets = function (datasetIds) {
            var _this = this;
            if (!datasetIds)
                return;

            $(document.body).toggleClass('loading', true);

            for (var key in this.markerClusters) {
                this.markerClusters[key].clearMarkers();
            }

            var defs = datasetIds.map(function (datasetId) {
                return _this.getObjects(datasetId).done(function (data) {
                    return _this.addObjectsToMap(_this.map, data, datasetId);
                });
            });

            $.when.apply($, defs).done(function () {
                return $(document.body).removeClass('loading');
            });
        };

        Application.prototype.addObjectsToMap = function (map, data, datasetId) {
            console.log(data);
            var infoWindow = new google.maps.InfoWindow();
            var rowCount = Math.floor(data.data.length / data.columns.length);
            var markers = [];

            for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                var rowOffset = rowIndex * data.columns.length;
                var description = '<table>';
                for (var colIndex = 0; colIndex < data.columns.length; colIndex++) {
                    var dataIndex = rowOffset + colIndex;
                    var value = (data.columns[colIndex].type === 'Date' ? data.data[dataIndex].value : data.data[dataIndex]);
                    description += '<tr><th>' + data.columns[colIndex].name + '</th><td>' + value + '</td></tr>';
                }
                description += '<table>';

                var marker = new google.maps.Marker();
                marker.setPosition(new google.maps.LatLng(data.data[rowOffset + 1], data.data[rowOffset]));
                marker.set('desc', description);
                marker.setIcon(datasets[datasetId].styles[0].url);

                google.maps.event.addListener(marker, 'click', function () {
                    infoWindow.setContent(this.get('desc'));
                    infoWindow.open(map, this);
                });

                markers.push(marker);
            }

            if (!(datasetId in this.markerClusters)) {
                // http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/docs/reference.html
                this.markerClusters[datasetId] = new window['MarkerClusterer'](map, markers, { styles: datasets[datasetId].styles });
            }
            this.markerClusters[datasetId].addMarkers(markers);
        };

        Application.prototype.getObjects = function (datasetId) {
            var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=' + datasetId + '&accesskey=vtqxyn';
            var data = {
                Dataset: datasetId,
                Filter: [],
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
