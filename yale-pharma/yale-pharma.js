(function () {

    var app = function () {
        this.topBarHeight = 80 + 40;//40 - height of .main-menu-holder
        this.timelineHeight = 60;
        this.map = null;
        this.geoPlaygroundId = 'rdedwfb';
        this.layers = {};
        this.drugSelectList = [];
        this.markers = [];
        this.filters = {
            search: '',
            medicine: null,
            hide: {}
        };
    };

    $.ajaxSetup({
        data: {
            client_id: 'EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif'
        }
    });

    //Cross domain post request:
    /*
    $.ajax({
        type: "POST",

        crossDomain: true,

        url: '//knoema.com/api/1.0/data/pivot',
        data: {"Dataset":"CDIACTACHIINDUSAA","Header":[{"DimensionId":"Time","Members":[1992,1995,1998,{"Name":"1996-1998","Key":-1987,"Formula":[1996,1998,"avga"]},{"Name":"1980-1990","Key":-9876,"Formula":[1980,1990,"avga"]}]}],"Filter":[{"DimensionId":"Location","Members":[1000000]}],"Stub":[{"DimensionId":"Variable","Members":[1000000,1000010,1000020,{"Name":"TotalPrimaryEnergyproduction,AnnualAverageGrowth","Key":-1234,"Formula":[1134,"pcha"]},{"Name":"TotalPrimaryEnergyconsumption,AnnualAverageGrowth","Key":-1236,"Formula":[1486,"pcha"]},{"Name":"ConsumptiontoProductionratio","Key":-1238,"Formula":[1486,1134,"/"]}]}]},
        success: function(pivotResponse) {
            console.log('pivotResponse', pivotResponse);
        }
    });
    */

    app.prototype.run = function() {
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
            var idleTimeout = window.setTimeout(function () {
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
            $('#side-bar').find('input[type="checkbox"]').prop('checked', false);
            self.reloadLayers();
        });

        $('#side-bar').on('change', 'input[type="checkbox"]', function() {
            var dimension = $(this).data('dimension');
            var filterValue = $(this).val();
            if ($(this).is(':checked')) {
                if (_.isUndefined(self.filters.hide[dimension])) {
                    self.filters.hide[dimension] = [];
                }
                self.filters.hide[dimension].push(filterValue);
            } else {
                _.remove(self.filters.hide[dimension], function(item) {
                    return item === filterValue;
                });
            }
            if (self.filters.hide[dimension].length === 0) {
                delete self.filters.hide[dimension];
            }
            if (_.isEmpty(self.filters.hide)) {
                $('#side-bar').find('.reset').hide();
            } else {
                $('#side-bar').find('.reset').show();
            }
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

        $.get('//yale.knoema.com/api/1.0/meta/dataset/zoxdoob/dimension/measure', function(measureDimension) {
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
                        "Simvastatin, 20 mg cap/tab"
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
                        "Fluoxetine" //Missing
                    ]
                }
            ];

            _.each(medicineList, function(item) {
                item.drugs = _.map(item.drugs, function(drugName) {
                    return {
                        drugName: drugName,
                        key: drugName === 'Fluoxetine' ? null : _.find(measureDimension.items, function (item) {
                            return item.name === drugName;
                        }).key
                    }
                });
                self.drugSelectList.push(item);
            });

            $('#select-medicine')
                .append($.tmpl('select-medicine.html', {
                    drugSelectList: self.drugSelectList
                }))
                .chosen({
                    width: "100%",
                    allow_single_deselect: true
                });

            $('#select-medicine').on('change', function() {
                self.filters.medicine = $(this).val();
                self.reloadLayers();
            });

        });

        $('#modal-dialog-holder').on('click', '.prices-comparison-tool', function() {
            self.showPricesComparison();
        });

        $('#prices-comparison-tool').on('click', '.fa-remove', function() {
            self.hidePricesComparison();
        });

        $(window).trigger('resize');
    };

    app.prototype.reloadLayers = function () {
        var self = this;
        _.each(self.markers, function(marker) {
            marker.setMap(null);
        });
        _.each(_.keys(this.layers), function(layerId) {
            self.loadLayer(layerId);
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
                if (!_.isUndefined(self.filters.hide[key])) {
                    event.data.visible = event.data.visible && _.indexOf(self.filters.hide[key], event.data.content[key]) >= 0;
                }
            });
        }

        if (!_.isEmpty(this.filters.medicine)) {
            event.data.visible = event.data.visible && Boolean(event.data.content[this.filters.medicine]);
        }

        var url;
        if (event.data.visible) {
            event.data.visible = false;

            switch(event.data.content['NCD-SARA Composite Score']) {
                case 'Red':
                    url = 'img/marker-red.png';
                    break;
                case 'Green':
                    url = 'img/marker-green.png';
                    break;
                case 'Yellow':
                    url = 'img/marker-yellow.png';
                    break;
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

    app.prototype.loadLayer = function (id) {
        var self = this;
        var layer = this.layers[id];

        //TODO $(document.body).addClass('loading');

        if (!layer) {
            layer = new GeoPlayground.Layer({
                map: self.map,
                layerId: id,
                geoPlaygroundId: self.geoPlaygroundId
            }, function(layer2) {
                $(document.body).removeClass('loading');

                $('.nav').find('[disabled]').removeAttr('disabled');

            });

            layer.on('beforeDraw', function (e, callback) {
                self.onBeforeDraw(e, callback, id);
            });

            self.layers[id] = layer;
        }
        layer.load();
    };

    app.prototype.markerClickHandler = function(event) {
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

    app.prototype.initSideBar = function () {
        function createFilterSectionMarkup(data) {

            //Content for NCD
            var tooltipContent = 'Total number of selected chronic disease medications available at a facility when surveyed.';

            if (data.id === 'facility-type') {
                tooltipContent = $.tmpl('long-tooltip.html').html()//get(0).outerHTML;

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

            return $.tmpl('side-bar-checkbox-section.html', {
                className: data.id,
                header: data.name,
                items: data.items,
                tooltipContent: tooltipContent,
                datasetUrl: '//yale.knoema.com/zoxdoob/sara-uganda-2013-selected-data'
            });
        }

        var dimensionRequests = [
            $.get('//yale.knoema.com/api/1.0/meta/dataset/zoxdoob/dimension/facility-type'),
            $.get('//yale.knoema.com/api/1.0/meta/dataset/zoxdoob/dimension/location'),
            $.get('//yale.knoema.com/api/1.0/meta/dataset/zoxdoob/dimension/sector'),
            $.get('//yale.knoema.com/api/1.0/meta/dataset/zoxdoob/dimension/ncd-sara-composite-score')
        ];

        $.when.apply(null, dimensionRequests).done(function onDimensionsLoaded(facilityType, location, sector, ncd) {
            $('#side-bar').append(createFilterSectionMarkup(facilityType[0]));
            $('#side-bar').append(createFilterSectionMarkup(location[0]));
            $('#side-bar').append(createFilterSectionMarkup(sector[0]));

            var ncdData = ncd[0];
            _.each(ncdData.items, function(item) {
                switch(item.name) {
                    case 'Red':
                        item.displayName = '0 - 2';
                        break;
                    case 'Yellow':
                        item.displayName = '3 - 4';
                        break;
                    case 'Green':
                        item.displayName = '5 - 8';
                        break;
                }
            });

            ncdData.items = _.reverse(_.sortBy(ncdData.items, function(item) {
                return item.displayName;
            }));

            $('#side-bar').append(createFilterSectionMarkup(ncdData));

            $('#side-bar').append($.tmpl('side-bar-radio-section.html'));

            $('[data-toggle="tooltip"]').tooltip({
                container: $('#tooltip-holder'),
                html: true
            });

            $('#side-bar').mCustomScrollbar({
                theme: "dark"
            });
        });
        // //yale.knoema.com/api/1.0/meta/dataset/zoxdoob/dimension/name-of-facility
        // //yale.knoema.com/api/1.0/meta/dataset/zoxdoob/dimension/location-of-facility
        // //yale.knoema.com/api/1.0/meta/dataset/zoxdoob/dimension/measure
    };

    app.prototype.onResize = function () {
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

    app.prototype.loadTemplates = function (callback) {
        var self = this;
        function compileTemplate(templateSrc) {
            var templateId = this.url.replace('tmpl/', '');
            templateId = templateId.substring(0, templateId.indexOf('?'))
            $.template(templateId, templateSrc);
        }
        var templates = [
            $.get('tmpl/side-bar-checkbox-section.html', compileTemplate),
            $.get('tmpl/side-bar-radio-section.html', compileTemplate),
            $.get('tmpl/facility-profile.html', compileTemplate),
            $.get('tmpl/select-medicine.html', compileTemplate),
            $.get('tmpl/long-tooltip.html', compileTemplate)
        ];
        $.when.apply(null, templates).done(function onTemplatesLoaded() {
            if ($.isFunction(callback)) {
                callback();
            }
        });
    };

    google.maps.event.addDomListener(window, 'load', function () {
        new app().run();
    });

})();
