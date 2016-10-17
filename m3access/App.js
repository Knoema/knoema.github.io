(function () {

    function App() {
        this.topBarHeight = 80 + 40;//40 - height of .main-menu-holder
        this.timelineHeight = 60;
        this.map = null;

        //Old geoplayground
        //this.geoPlaygroundId = 'rdedwfb';

        //New geoplayground
        this.geoPlaygroundId = 'zohqw';

        this.infoWindow = new google.maps.InfoWindow();
        this.layers = {};
        this.drugSelectList = [];
        this.markers = [];
        this.filters = {
            search: '',
            medicine: null,
            hide: {},
            populationDensity: false
        };
    };

    $.ajaxSetup({
        data: {
            client_id: 'EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif'
        }
    });

    App.prototype.run = function() {
        var self = this;
        $(window).on('resize', $.proxy(this.onResize, this));

        $('#map-canvas').height($(window).height() - this.topBarHeight - this.timelineHeight);
        $('#timeline').css({
            visibility: 'visible'
        });

        this.loadTemplates(function() {
            self.initSideBar();
        });

        $('#timeline').find('.scroll-content').mCustomScrollbar({
            theme: "dark",
            axis:"x",
            advanced:{
                autoExpandHorizontalScroll:true
            }
        });

        this.map = new google.maps.Map(document.getElementById('map-canvas'), {
            center: { lat: 2.24064, lng: 32.904053 },
            zoom: 7,
            streetViewControl: false,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        google.maps.event.addListenerOnce(this.map, 'idle', function () {
            setTimeout(function () {
                $.get('//knoema.com/api/1.0/frontend/resource/' + self.geoPlaygroundId + '/content', function(content) {
                    for (var layerId in content.layers) {
                        self.loadLayer(layerId);
                    }
                });
            }, 300);
        });

        function keyupHandler() {
            self.filters.search = $.trim($(this).val().toLowerCase());
            self.reloadLayers();
        };

        $('#search-input').keyup(_.debounce(keyupHandler, 250));

        $('#side-bar').on('click', '.reset', function() {
            $('#side-bar').find('.reset').hide();
            self.filters.hide = {};
            $('#side-bar').find('input.filter').prop('checked', false);
            $('#select-medicine').selectpicker('deselectAll');
            self.reloadLayers();
        });

        $('#side-bar').on('change', 'input[type="checkbox"]', function() {
            var dimension = $(this).data('dimension');

            if (dimension) {
                var filterValue = $(this).val();
                var isChecked = $(this).is(':checked');

                if (filterValue === 'populationDensity') {
                    self.filters.populationDensity = isChecked;
                }

                if (isChecked) {
                    if (_.isUndefined(self.filters.hide[dimension])) {
                        self.filters.hide[dimension] = [];
                    }
                    self.filters.hide[dimension].push(filterValue);
                } else {
                    _.remove(self.filters.hide[dimension], function(item) {
                        return item === filterValue;
                    });
                }
                if (dimension) {
                    if (self.filters.hide[dimension].length === 0) {
                        delete self.filters.hide[dimension];
                    }
                }
            } else {
                var flag = $(this).data('flag');
                debugger;
                //survey-2013
            }

            self.handleResetControl();
            self.reloadLayers();
        });

        $( "#slider" ).slider({

            disabled: true,

            range: true,
            min: 0,
            max: 500,
            values: [ 75, 300 ],
            slide: function( event, ui ) {
                $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
            }
        });

        $.get('//yale.knoema.com/api/1.0/meta/dataset/pvbple/dimension/measure', function(measureDimension) {
            var medicineList = [
                {
                    disease: 'Diabetes',
                    drugs: [
                        "Metformin, cap/tab",
                        "Insulin, injection",
                        "Glibenclamide, 5 mg cap/tab"
                    ]
                },
                {
                    disease: 'Cardiovascular',
                    drugs: [
                        "Nifedipine, cap/tab",
                        "ACE inhibitor (e.g. enalapril, lisinopril, captopril)",
                        "Simvastatin, 20 mg cap/tab",

                        //measureDimension.items[9].name[0], measureDimension.items[9].name[9], measureDimension.items[9].name[11]
                        //-> measureDimension.items[9].name.charCodeAt(0), (9), (11) -> 8203
                        //http://www.fileformat.info/info/unicode/char/200b/index.htm
                        //Invisible symbols! measureDimension.items[9].name != "Atenolol, 50mg cap/tab" (different length)
                        measureDimension.items[9].name
                    ]
                },
                {
                    disease: 'COPD/Asthma',
                    drugs: [
                        "Beclomethasone inhaler",
                        "Salbutamol, 0.1mg/dose inhaler"
                    ]
                },
                {
                    disease: 'Depression/Anexiety',
                    drugs: [
                        "Amitriptyline, 25mg cap/tab"
                    ]
                }
            ];

            _.each(medicineList, function(item) {
                item.drugs = _.map(item.drugs, function(drugName) {
                    return {
                        drugName: drugName,
                        key: _.find(measureDimension.items, function (item) {
                            return item.name === drugName;
                            //return item.name === drugName || measureDimension.items[9].name.indexOf('Atenolol') > -1;
                        }).key
                    }
                });
                self.drugSelectList.push(item);
            });

            $('#select-medicine')
                .append($.tmpl('select-medicine.html', {
                    drugSelectList: self.drugSelectList
                }));

            $('#select-medicine').selectpicker('refresh');

            $('#select-medicine').on('change', function() {
                self.filters.medicine = $(this).val();
                self.handleResetControl();
                self.reloadLayers();
            });

        });

        $('#modal-dialog-holder').on('click', '.prices-comparison-tool', function() {
            self.showPricesComparison();
        });

        $('#prices-comparison-tool').on('click', '.glyphicon-remove', function() {
            self.hidePricesComparison();
        });

        $(window).trigger('resize');
    };

    App.prototype.reloadLayers = function () {
        var self = this;
        self.infoWindow.close();
        _.each(self.markers, function(marker) {
            marker.setMap(null);
        });
        _.each(_.keys(this.layers), function(layerId) {
            self.loadLayer(layerId);
        });
    };

    App.prototype.hidePricesComparison = function () {
        $('#prices-comparison-tool').animate({
            width: 0
        });
    };

    App.prototype.showPricesComparison = function () {
        $('#prices-comparison-tool').animate({
            width: 470
        });
    };

    App.prototype.handleResetControl = function () {
        var self = this;
        if (_.isEmpty(self.filters.hide) && _.isEmpty(self.filters.medicine)) {
            $('#side-bar').find('.reset').hide();
        } else {
            $('#side-bar').find('.reset').show();
        }
    };

    App.prototype.onBeforeDraw = function (event, callback, layerId) {
        var self = this;

        if (!_.isEmpty(this.filters.search)) {
            event.data.visible = event.data.visible && event.data.content['Name of facility'].toLowerCase().indexOf(this.filters.search) >= 0;
        }

        if (!_.isEmpty(this.filters.hide)) {
            _.forIn(event.data.content, function(value, key) {
                if (!_.isUndefined(self.filters.hide[key])) {
                    event.data.visible = event.data.visible && _.indexOf(self.filters.hide[key], event.data.content[key]) >= 0;
                }
            });
        }

        if (event.data.visible && !_.isEmpty(this.filters.medicine)) {
            var visible = _.reduce(this.filters.medicine, function(visible, nextFilter) {
                return visible && Boolean(event.data.content[nextFilter]);
            }, event.data.visible);
            event.data.visible = event.data.visible && visible;
        }

        var url;
        if (event.data.visible) {
            event.data.visible = false;

            var availability = event.data.content['Medicine Availability'];

            if (this.layers[layerId].layer.name === 'Layer 2016') {
                if (availability === 'High') {
                    url = 'img/marker-green.png';
                } else if (availability === 'Medium')  {
                    url = 'img/marker-yellow.png';
                } else if (availability === 'Low') {
                    url = 'img/marker-red.png';
                }
            } else {
                if (availability === 'High') {
                    url = 'img/map_marker_mini_green.png';
                } else if (availability === 'Medium')  {
                    url = 'img/map_marker_mini_yellow.png';
                } else if (availability === 'Low') {
                    url = 'img/map_marker_mini_red.png';
                }
            }

            var marker = new google.maps.Marker({
                title: event.data.content['Name of facility'],
                position: event.data.position,
                map: self.map,
                icon: url
            });

            marker.addListener('click', function() {
                self.markerClickHandler(event);
            });

            self.markers.push(marker);
        }

        callback(event.data);

    };

    App.prototype.loadLayer = function (layerId) {
        var self = this;
        var layer = this.layers[layerId];

        //TODO $(document.body).addClass('loading');

        if (!layer) {
            layer = new GeoPlayground.Layer({
                map: self.map,
                layerId: layerId,
                geoPlaygroundId: self.geoPlaygroundId
            }, function(layer2) {
                $(document.body).removeClass('loading');

                $('.nav').find('[disabled]').removeAttr('disabled');

                if (layer2.layer.ranges && !$('#heatmap-legend').length) {
                    $('#map-canvas').append($.tmpl('heatmap-legend.html', {
                        ranges: layer2.layer.ranges
                    }));
                }

                if (layer2.layerId == '5da3ae80-846f-c7b8-5445-3ecd00954e1c') {
                    if (layer2.layer && !self.filters.populationDensity) {
                        layer.clean();
                        $('#heatmap-legend').hide();
                    }
                }
            });

            layer.on('click', function (e) {
                e.data.tooltip.time = (new Date(e.data.tooltip.time)).toISOString().slice(0, 4);
                self.infoWindow.setContent($.tmpl('info-window-content.html', {
                    tooltip: e.layer.tooltip,
                    data: e.data.tooltip
                })[0].outerHTML);
                self.infoWindow.setPosition(e.data.latLng);
                self.infoWindow.open(self.map);
            });
            layer.on('beforeDraw', function (e, callback) {
                self.onBeforeDraw(e, callback, layerId);
            });

            self.layers[layerId] = layer;
        }

        if (layer.layerId === '5da3ae80-846f-c7b8-5445-3ecd00954e1c') {
            if (layer.layer && !self.filters.populationDensity) {
                layer.clean();
                $('#heatmap-legend').hide();
            } else {
                layer.load();
                $('#heatmap-legend').show();
            }
        } else {
            layer.load();
        }

    };

    App.prototype.markerClickHandler = function(event) {
        var self = this;
        self.hidePricesComparison();
        var drugList = _.clone(self.drugSelectList);

        _.each(drugList, function(listItem, i) {
            listItem.drugs = _.map(listItem.drugs, function(drug) {
                return _.assign(drug, {
                    isAvailable: Boolean(event.data.content[drug.drugName])
                });
            });
        });

        $('#modal-dialog-holder')
            .html($.tmpl('facility-profile.html', {
                data: event.data.content,
                drugList: drugList,
                //TODO Find nearest hospital: google.maps.geometry.spherical.computeDistanceBetween (latLngA, latLngB);
                distance: '5km'
            }))
            .modal('show');
    };

    App.prototype.initSideBar = function () {
        function createFilterSectionMarkup(data) {

            //Content for NCD

            //Old
            //var tooltipContent = 'Total number of selected chronic disease medications available at a facility when surveyed.';

            //New
            var tooltipContent = 'Availability of essential medicines for facilities surveyed under the M3 Access Pilot 2016 program are coded as: green (17-24 medicines), yellow (9-16), red (0-8). The selected NCDs from SARA 2013 are coded: green (7-10 medicines), yellow (3-6), red (0-2).';

            if (data.id === 'facility-type') {
                tooltipContent = $.tmpl('long-tooltip.html').html();

                var properOrder = [
                    "HC II",
                    "HC III",
                    "HC IV",
                    "General (district) hospital",
                    "National or regional referral hospital"
                ];

                data.items = _.sortBy(data.items, function(item) {
                    return _.indexOf(properOrder, item.name);
                });
            }

            if (data.name === "NCD-SARA Composite Score") {
                data.name = "Medicine Availability";
            }

            return $.tmpl('side-bar-checkbox-section.html', {
                className: data.id,
                header: data.name,
                items: data.items,
                tooltipContent: tooltipContent,
                datasetUrl: '//yale.knoema.com/pvbple/sara-uganda-2013-selected-data'
            });
        }

        var dimensionRequests = [
            $.get('//yale.knoema.com/api/1.0/meta/dataset/pvbple/dimension/facility-type'),
            $.get('//yale.knoema.com/api/1.0/meta/dataset/pvbple/dimension/location'),
            $.get('//yale.knoema.com/api/1.0/meta/dataset/pvbple/dimension/sector'),
            $.get('//yale.knoema.com/api/1.0/meta/dataset/pvbple/dimension/ncd-sara-composite-score')
        ];

        $.when.apply(null, dimensionRequests).done(function onDimensionsLoaded(facilityType, location, sector, ncd) {
            $('#side-bar').append(createFilterSectionMarkup(facilityType[0]));
            $('#side-bar').append(createFilterSectionMarkup(location[0]));
            $('#side-bar').append(createFilterSectionMarkup(sector[0]));

            var ncdData = ncd[0];
            _.each(ncdData.items, function(item) {
                switch(item.name) {
                    case 'Green':
                        item.displayName = 'High';
                        break;
                    case 'Yellow':
                        item.displayName = 'Medium';
                        break;
                    case 'Red':
                        item.displayName = 'Low';
                        break;
                }
            });

            ncdData.items = _.reverse(_.sortBy(ncdData.items, function(item) {
                return item.displayName;
            }));

            $('#side-bar').append(createFilterSectionMarkup(ncdData));

            $('#side-bar').append($.tmpl('survey-2013.html'));

            $('#side-bar').append($.tmpl('side-bar-radio-section.html'));

            $('[data-toggle="tooltip"]').tooltip({
                container: $('#tooltip-holder'),
                html: true
            });

            $('#side-bar').mCustomScrollbar({
                theme: "dark"
            });
        });
    };

    App.prototype.onResize = function () {
        var newHeight = $(window).height() - 7;
        var sideBarHeight = newHeight - this.topBarHeight - 20;

        var $mapCanvas = $('#map-canvas');
        var $timeline = $('#timeline');

        var mapCanvasWidth = $mapCanvas.width() - 80;

        $('#side-bar').css({
            'height': sideBarHeight,
            'min-height': sideBarHeight
        });

        var timepointWidth = (mapCanvasWidth - 10) / 12;//12 - count of time members
        $timeline.find('.timepoint').css({
            width: timepointWidth
        });

        //TODO If scrollbar is not visible increase height of the map
        if (!$timeline.find('.mCSB_scrollTools').is(':visible')) {
            //Move timeline to bottom (~10-20px)
        }

        $timeline.find('.scroll-content').css({
            //'background-color': 'goldenrod',
            'width': mapCanvasWidth,
            'max-width': mapCanvasWidth
        });

        $('#prices-comparison-tool').css({
            'height': sideBarHeight + 20,
            'min-height': sideBarHeight + 20
        });

        $mapCanvas.height(newHeight - this.topBarHeight - this.timelineHeight);
    };

    App.prototype.loadTemplates = function (callback) {
        var self = this;
        function compileTemplate(templateSrc) {
            var templateId = this.url.replace('tmpl/', '');
            templateId = templateId.substring(0, templateId.indexOf('?'))
            $.template(templateId, templateSrc);
        }
        var templates = [
            $.get('tmpl/side-bar-checkbox-section.html', compileTemplate),
            $.get('tmpl/side-bar-radio-section.html', compileTemplate),
            $.get('tmpl/info-window-content.html', compileTemplate),
            $.get('tmpl/facility-profile.html', compileTemplate),
            $.get('tmpl/select-medicine.html', compileTemplate),
            $.get('tmpl/survey-2013.html', compileTemplate),
            $.get('tmpl/heatmap-legend.html', compileTemplate),
            $.get('tmpl/long-tooltip.html', compileTemplate)
        ];
        $.when.apply(null, templates).done(function onTemplatesLoaded() {
            if ($.isFunction(callback)) {
                callback();
            }
        });
    };

    google.maps.event.addDomListener(window, 'load', function () {
        window.app = new App();
        window.app.run();
    });

})();
