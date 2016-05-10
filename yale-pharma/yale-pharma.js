(function () {

    var app = function () {
        this.topBarHeight = 80;
        this.map = null;
        this.geoPlaygroundId = 'rdedwfb';
        this.layers = {};
        this.drugSelectList = [];
        this.filters = {
            search: '',
            medicine: null,
            hide: {}
        };
    };

    app.prototype.run = function() {
        var self = this;
        $(window).on('resize', $.proxy(this.onResize, this));

        this.loadTemplates(function() {
            self.initSideBar();
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
                var url = '//knoema.com/api/1.0/frontend/resource/' + self.geoPlaygroundId + '/content';
                Knoema.Helpers.get(url, function(content) {
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

        $('#side-bar').on('change', 'input[type="checkbox"]', function() {
            var dimension = $(this).data('dimension');
            var filterValue = $(this).val();
            if ($(this).is(':checked')) {
                _.remove(self.filters.hide[dimension], function(item) {
                    return item === filterValue;
                });
            } else {
                if (_.isUndefined(self.filters.hide[dimension])) {
                    self.filters.hide[dimension] = [];
                }
                self.filters.hide[dimension].push(filterValue);
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

        Knoema.Helpers.get('//yale.knoema.com/api/1.0/meta/dataset/zoxdoob/dimension/measure', function(measureDimension) {
            var medicineList = [
                {
                    disease: 'Diabets',
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
        var url;

        if (!_.isEmpty(this.filters.search)) {
            event.data.visible = event.data.visible && event.data.content['Name of facility'].toLowerCase().indexOf(this.filters.search) >= 0;
        }

        if (!_.isEmpty(this.filters.hide)) {
            _.forIn(event.data.content, function(value, key) {
                if (!_.isUndefined(self.filters.hide[key])) {
                    event.data.visible = event.data.visible && _.indexOf(self.filters.hide[key], event.data.content[key]) < 0;
                }
            });
        }

        if (!_.isEmpty(this.filters.medicine)) {
            event.data.visible = event.data.visible && Boolean(event.data.content[this.filters.medicine]);
        }

        if (event.data.visible) {
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
            event.data.icon = {
                url: url,
                size: new google.maps.Size(25, 37),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(12, 37)
            };
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

            layer.on('click', function (e) {

                self.hidePricesComparison();

                var drugList = _.clone(self.drugSelectList);

                _.each(drugList, function(listItem, i) {
                    listItem.drugs = _.map(listItem.drugs, function(drug) {
                        return _.assign(drug, {
                            isAvailable: Boolean(e.data.tooltip[drug.drugName])
                        });
                    });
                });

                $('#modal-dialog-holder')
                    .html($.tmpl('facility-profile.html', {
                        data: e.data.tooltip,
                        drugList: drugList,
                        //TODO Find nearest hospital: google.maps.geometry.spherical.computeDistanceBetween (latLngA, latLngB);
                        distance: '5km'
                    }))
                    .modal('show');
            });

            layer.on('beforeDraw', function (e, callback) {
                self.onBeforeDraw(e, callback, id);
            });

            self.layers[id] = layer;
        }
        layer.load();
    };

    app.prototype.initSideBar = function () {
        function createFilterSectionMarkup(data) {

            //Content for NCD
            var tooltipContent = 'Total number of selected chronic disease medications available at a facility when surveyed.';

            if (data.id === 'facility-type') {
                tooltipContent = $.tmpl('long-tooltip.html').html()//get(0).outerHTML;
            }

            return $.tmpl('side-bar-checkbox-section.html', {
                className: data.id,
                header: data.name,
                items: data.items,
                tooltipContent: tooltipContent
            });
        }
        var dimensionRequests = [
            this.get('//yale.knoema.com/api/1.0/meta/dataset/zoxdoob/dimension/facility-type'),
            this.get('//yale.knoema.com/api/1.0/meta/dataset/zoxdoob/dimension/location'),
            this.get('//yale.knoema.com/api/1.0/meta/dataset/zoxdoob/dimension/sector'),
            this.get('//yale.knoema.com/api/1.0/meta/dataset/zoxdoob/dimension/ncd-sara-composite-score')
        ];
        $.when.apply(null, dimensionRequests).done(function onDimensionsLoaded(facilityType, location, sector, ncd) {
            $('#side-bar').append(createFilterSectionMarkup(facilityType));
            $('#side-bar').append(createFilterSectionMarkup(location));
            $('#side-bar').append(createFilterSectionMarkup(sector));
            $('#side-bar').append(createFilterSectionMarkup(ncd));

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

    app.prototype.get = function (url) {
        var d = $.Deferred();
        Knoema.Helpers.get(url, function (data) {
            d.resolve(data);
        });
        return d;
    };

    // app.prototype.resize = function () {
    //     var newWindowHeight = $(window).height();
    //     $('#filters .filters').height(newWindowHeight - 120 - 45);
    //     $('#map-canvas').height(newWindowHeight - 120);
    //     $('#table').height(newWindowHeight - 120);
    // };
    app.prototype.onResize = function () {
        var newHeight = $(window).height() - 7;
        var sideBarHeight = newHeight - this.topBarHeight - 20;

        $('#side-bar').css({
            'height': sideBarHeight,
            'min-height': sideBarHeight
        });

        $('#prices-comparison-tool').css({
            'height': sideBarHeight + 20,
            'min-height': sideBarHeight + 20
        });

        $('#map-canvas').height(newHeight - this.topBarHeight);
    };

    app.prototype.loadTemplates = function (callback) {
        var self = this;
        function compileTemplate(templateSrc) {
            $.template(this.url.replace('tmpl/', ''), templateSrc);
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
