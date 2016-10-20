(function () {

    Knoema.Helpers.clientId = 'EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif';

    function App() {
        this.topBarHeight = 80 + 40;//40 - height of .main-menu-holder
        this.timelineHeight = 90;
        this.map = null;

        //New geoplayground
        this.geoPlaygroundId = 'zohqw';

        this.layerId2016 = 'dc3bfd66-3fc5-34dd-9523-704ba9f8df03';

        this.timePoint = '09/26/2016';

        this.minMax = null;

        this.infoWindow = new google.maps.InfoWindow();
        this.layers = {};
        this.drugSelectList = [];
        this.filters = {
            search: '',
            medicine: null,
            hide: {},
            survey: false,
            populationDensity: false
        };

        this.drugPrices = null;

    };

    App.prototype.run = function() {
        var self = this;
        $(window).on('resize', $.proxy(this.onResize, this));

        $('#map-canvas').height($(window).height() - this.topBarHeight - this.timelineHeight);
        $('#timeline').css({
            visibility: 'visible'
        });

        this.loadTemplates(function() {
            self.initSideBar();
            self.createTimeline();
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
                Knoema.Helpers.get('//knoema.com/api/1.0/frontend/resource/' + self.geoPlaygroundId + '/content', function(content) {
                    for (var layerId in content.layers) {
                        // if (layerId === 'dc3bfd66-3fc5-34dd-9523-704ba9f8df03') {
                        //     self.loadLayer(layerId);
                        // }
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
            var isChecked = $(this).is(':checked');
            var dimension = $(this).data('dimension');

            if (dimension) {
                var filterValue = $(this).val();

                if ($(this).data('displayName')) {
                    filterValue = $(this).data('displayName');
                }

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
                if ($(this).data('survey') === 'survey2013') {
                    self.filters.survey = isChecked;
                }
            }

            self.handleResetControl();
            self.reloadLayers();
        });

        $( "#slider" ).slider({
            disabled: true,
            range: true,
            min: 0,
            max: 500,
            values: [ 0, 500 ]
        });

        //TODO Get dataset id from geoplayground
        Knoema.Helpers.get('//yale.knoema.com/api/1.0/meta/dataset/dqbawu/dimension/measure', function(measureDimension) {

            //["Medicine Availability Score Value", "NCD-SARA 2013 Score", "PMetformin", "PGlibenclamide", "PInsulin_soluble",
            // "PInsulin_isophane", "PInsulin_Mixtard", "PNifedipine", "PAtenolol", "PPropranolol", "PCaptopril", "PEnalapril", "PLisinopril", "PLosartan",
            // "PSimvastatin", "PBeclomethasone_inhaler", "PSalbutamol_inhaler", "PSalbutamol_tablet", "PFluoxetine", "PAmitriptyline",
            // "PDiazepam", "PCodeine", "PParacetamol", "PAmoxicillin", "PArtemether_Lumefantrine", "POral_rehydration_solution"]

            var properMapping = {
                "PMetformin": "Metformin 500mg per tablet",
                "PGlibenclamide": "Glibenclamide 5mg per tablet",
                "PInsulin_soluble": "Insulin soluble (regular) 100IU/mL per unit vial",
                "PInsulin_isophane": "Insulin isophane (NPH) 100IU/mL per unit vial",
                "PInsulin_Mixtard": "Insulin Mixtard (30% soluble/70% isophane) 100IU/mL per unit vial",
                "PNifedipine": "Nifedipine 20mg per tablet",
                "PAtenolol": "Atenolol 100mg per tablet",
                "PPropranolol": "Propranolol 40 mg per tablet",
                "PCaptopril": "Captopril 25mg per tablet",
                "PEnalapril": "Enalapril 5mg per tablet",
                "PLisinopril": "Lisinopril 10mg per tablet",
                "PLosartan": "Losartan 50mg per tablet",
                "PSimvastatin": "Simvastatin 20mg per tablet",
                "PBeclomethasone_inhaler": "Beclomethasone inhaler per item",
                "PSalbutamol_inhaler": "Salbutamol inhaler per item",
                "PSalbutamol_tablet": "Salbutamol 4mg per tablet",
                "PFluoxetine": "Fluoxetine 20mg per tablet",
                "PAmitriptyline": "Amitriptyline 25mg per tablet",
                "PDiazepam": "Diazepam 5mg per tablet",
                "PCodeine": "Codeine 30mg per tablet",
                "PParacetamol": "Paracetamol 500mg per tablet",
                "PAmoxicillin": "Amoxicillin 250mg per tablet",
                "PArtemether_Lumefantrine": "Artemether 20mg/Lumefantrine 120mg per tablet",
                "POral_rehydration_solution": "Oral rehydration solution packets"
            };

            var medicineList = [
                {
                    disease: 'Diabetes',
                    drugs: [
                        "PMetformin",
                        "PGlibenclamide",
                        "PInsulin_soluble",
                        "PInsulin_isophane",
                        "PInsulin_Mixtard"
                    ]
                },
                {
                    disease: 'Cardiovascular Disease',
                    drugs: [
                        "PNifedipine",
                        "PAtenolol",
                        "PPropranolol",
                        "PCaptopril",
                        "PEnalapril",
                        "PLisinopril",
                        "PLosartan",
                        "PSimvastatin"
                    ]
                },
                {
                    disease: 'COPD/Asthma',
                    drugs: [
                        "PBeclomethasone_inhaler",
                        "PSalbutamol_inhaler",
                        "PSalbutamol_tablet"
                    ]
                },
                {
                    disease: 'Mental Health',
                    drugs: [
                        "PFluoxetine",
                        "PAmitriptyline",
                        "PDiazepam"
                    ]
                },
                {
                    disease: 'Pain/Fever',
                    drugs: [
                        "PCodeine",
                        "PParacetamol"
                    ]
                },
                {
                    disease: 'Antibiotic',
                    drugs: [
                        "PAmoxicillin"
                    ]
                },
                {
                    disease: 'Malaria',
                    drugs: [
                        "PArtemether_Lumefantrine"
                    ]
                },
                {
                    disease: 'Dehydration',
                    drugs: [
                        "POral_rehydration_solution"
                    ]
                }
            ];

            _.each(medicineList, function(item) {
                item.drugs = _.map(item.drugs, function(drugName) {
                    return {
                        drugName: drugName,
                        displayName: properMapping[drugName],
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

                if (_.isArray(self.filters.medicine) && self.filters.medicine.length > 1 || self.filters.medicine == null) {
                    $('#min').val('').prop('disabled', true);
                    $('#max').val('').prop('disabled', true);
                    $( "#slider" ).slider({
                        disabled: true
                    });
                    self.minMax = null;
                } else {

                    var medicine = self.filters.medicine[0];

                    $('#min,#max').prop('disabled', false);

                    var drug = _.find(window.drugs.items, function(item) {
                        return item.name === medicine;
                    });

                    if (drug) {
                        var minDataDescriptor = _.cloneDeep(dataDescriptors.min);
                        var maxDataDescriptor = _.cloneDeep(dataDescriptors.max);

                        minDataDescriptor.Filter[0].Members[0] = {
                            "Key": -715,
                            "Name": "Sum(PMetformin)",
                            "Formula": [
                                drug.key.toString(),//Doesn't work without toString()
                                "min"
                            ],
                            "Transform": null
                        };

                        maxDataDescriptor.Stub[0].Members[0] = {
                            "Key": -107,
                            "Name": "Max",
                            "Formula": [
                                drug.key.toString(),
                                "max"
                            ],
                            "Transform": null
                        };

                        var minDef = $.Deferred();
                        Knoema.Helpers.post('//yale.knoema.com/api/1.0/data/pivot', minDataDescriptor, function(pivotResponse) {
                            minDef.resolve(pivotResponse);
                        });

                        var maxDef = $.Deferred();
                        Knoema.Helpers.post('//yale.knoema.com/api/1.0/data/pivot', maxDataDescriptor, function(pivotResponse) {
                            maxDef.resolve(pivotResponse);
                        });

                        $.when.apply(null, [
                            minDef,
                            maxDef
                        ]).done(function (minResp, maxResp) {

                            var min = _.min(_.filter(_.map(minResp.data, 'Value')));
                            var max = maxResp.data[0].Value;

                            $('#min').val(min);
                            $('#max').val(max);

                            //TODO Populate with proper min/max values
                            $( "#slider" ).slider({
                                disabled: false,
                                range: true,
                                min: min,
                                max: max,
                                values: [min, max],
                                slide: _.debounce(function( event, ui ) {
                                    $('#min').val(ui.values[0]);
                                    $('#max').val(ui.values[1]);

                                    self.minMax = {
                                        medicine: medicine,
                                        min: ui.values[0],
                                        max: ui.values[1]
                                    };

                                    self.layers[self.layerId2016].load(null, self.timePoint);
                                }, 200)
                            });
                        });

                    }

                }

                self.handleResetControl();

                self.layers[self.layerId2016].load(null, self.timePoint);

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

    App.prototype.onBeforeDraw = function (event, callback) {
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

        // if (event.data.content["Name of facility"] === "JINJA REGIONAL REFERRAL HOSPITAL") {
        //     debugger;
        // }

        if (event.data.visible && !_.isEmpty(this.filters.medicine) && this.layers[event.layerId].layer.name === 'Layer 2016') {
            var visible = _.reduce(this.filters.medicine, function(visible, nextFilter) {
                return visible && !_.isNaN(parseInt(event.data.content[nextFilter]));
            }, event.data.visible);
            event.data.visible = event.data.visible && visible;
        }

        // When user selects a filter on the left, that filter is applied to both Layer 2013 and Layer 2016 layers, but Layer 2013 symbols become visible only if Survey 2013 filter is enabled.
        // If user selects just Survey 2013 filter then only Layer 2013 symbols are visible on the map.
        // It means that Survey 2013 is not a standard filter, it enables\disables entier layer (Layer 2013)

        var availability = event.data.content['Medicine Availability'];

        if (this.layers[event.layerId].layer.name === 'Layer 2016') {

            //self.minMax

            if (self.minMax) {
                if (event.data.content[self.minMax.medicine] != 0) {
                    if (!event.data.content[self.minMax.medicine] ||
                        event.data.content[self.minMax.medicine] < self.minMax.min ||
                        event.data.content[self.minMax.medicine] > self.minMax.max) {

                        //console.log('Hide facility with value: ', event.data.content[self.minMax.medicine]);
                        event.data.visible = false;
                    }
                }
            }

            if (_.keys(this.filters.hide).length === 0 && this.filters.survey) {
                event.data.visible = false;
            }
            var url;
            switch (availability) {
                case 'High':
                    url = 'img/marker-green.png';
                    break;
                case 'Medium':
                    url = 'img/marker-yellow.png';
                    break;
                case 'Low':
                    url = 'img/marker-red.png';
                    break;
            }
            event.data.icon = {
                url: url
                // scaledSize: new google.maps.Size(width, height),
                // origin: new google.maps.Point(0, 0),
                // anchor: new google.maps.Point(width / 2, height)
            };
        } else {
            if (_.keys(this.filters.hide).length) {
                event.data.visible = event.data.visible && this.filters.survey;
            }
            var url;
            switch (availability) {
                case 'High':
                    url = 'img/map_marker_mini_green.png';
                    break;
                case 'Medium':
                    url = 'img/map_marker_mini_yellow.png';
                    break;
                case 'Low':
                    url = 'img/map_marker_mini_red.png';
                    break;
            }
            event.data.icon = {
                url: url
                // scaledSize: new google.maps.Size(width, height),
                // origin: new google.maps.Point(0, 0),
                // anchor: new google.maps.Point(width / 2, height)
            };
        }

        // var url;
        // if (event.data.visible) {
        //     event.data.visible = false;
        //
        //
        //
        //     if (this.layers[layerId].layer.name === 'Layer 2016') {
        //         if (availability === 'High') {
        //             url = 'img/marker-green.png';
        //         } else if (availability === 'Medium')  {
        //             url = 'img/marker-yellow.png';
        //         } else if (availability === 'Low') {
        //             url = 'img/marker-red.png';
        //         }
        //     } else {
        //         if (availability === 'High') {
        //             url = 'img/map_marker_mini_green.png';
        //         } else if (availability === 'Medium')  {
        //             url = 'img/map_marker_mini_yellow.png';
        //         } else if (availability === 'Low') {
        //             url = 'img/map_marker_mini_red.png';
        //         }
        //     }
        //
        //     var marker = new google.maps.Marker({
        //         title: event.data.content['Name of facility'],
        //         position: event.data.position,
        //         map: self.map,
        //         icon: url,
        //         layerId: layerId
        //     });
        //
        //     marker.addListener('click', function() {
        //         self.markerClickHandler(event);
        //     });
        //
        //     self.markers.push(marker);
        // }

        callback(event.data);

    };

    App.prototype.loadLayer = function (layerId) {
        var self = this;
        var layer = this.layers[layerId];

        if (!layer) {
            layer = new GeoPlayground.Layer({
                map: self.map,
                layerId: layerId,
                geoPlaygroundId: self.geoPlaygroundId
            }, function(layer2) {
                $(document.body).removeClass('loading');

                if (layer2.layer.name === "Layer 2016") {

                    self.allWeeks = _.flatten(_.values(layer2.layer.parsedData));

                    var timeMembersWithData = _.sortBy(_.keys(layer2.layer.parsedData));

                    _.each(timeMembersWithData, function(timePoint, i) {
                        var $timepoint = $('#timeline').find('[data-time-point="' + timePoint + '"]');
                        $timepoint.addClass('has-data');
                        if (self.timePoint === timePoint) {
                            $timepoint.addClass('active');
                        }
                    });
                }

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
                if (e.layer.layerType === 'point') {
                    self.markerClickHandler(e);
                } else {
                    e.data.tooltip.time = (new Date(e.data.tooltip.time || e.data.tooltip.Date)).toISOString().slice(0, 4);
                    self.infoWindow.setContent($.tmpl('info-window-content.html', {
                        tooltip: e.layer.tooltip,
                        data: e.data.tooltip
                    })[0].outerHTML);
                    self.infoWindow.setPosition(e.data.latLng);
                    self.infoWindow.open(self.map);
                }
            });
            layer.on('beforeDraw', function (e, callback) {
                self.onBeforeDraw(e, callback);
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

    App.prototype.createTimeline = function() {
        var self = this;

        _.each(weeks2016, function(w) {
            if (w.isNewMonth) {
                w.month = new Date(w.weekStart).toLocaleString('en-us', {"month": "short"});
            }
        });

        $('#timeline').find('.scroll-content').empty().append($.tmpl('time-members.html', {
            timeMembers: window.weeks2016
        }));

        $('#timeline').on('click', '.timepoint.has-data', function(e) {
            var $a = $(e.target);

            var previousTimePoint = self.timePoint;
            self.timePoint =  $a.data('timePoint');

            $('#timeline').find('.active').removeClass('active');
            $a.addClass('active');

            //This is the right way to implement
            self.layers[self.layerId2016].load(previousTimePoint, self.timePoint);

            //self.layers[self.layerId2016].load('09/26/2016', '09/12/2016');

            //self.reloadLayers();
        });

        $('#timeline').find('.scroll-content').mCustomScrollbar({
            theme: "dark",
            axis:"x",
            advanced:{
                autoExpandHorizontalScroll:true
            }
        });
    };

    App.prototype.markerClickHandler = function(event) {
        var self = this;
        self.hidePricesComparison();
        var drugList = _.clone(self.drugSelectList);

        _.each(drugList, function(listItem, i) {
            listItem.drugs = _.map(listItem.drugs, function(drug) {
                return _.assign(drug, {
                    isAvailable: Boolean(event.data.tooltip[drug.drugName])
                });
            });
        });

        $('#modal-dialog-holder')
            .html($.tmpl('facility-profile.html', {
                data: event.data.tooltip,
                drugList: drugList,
                //TODO Find nearest hospital: google.maps.geometry.spherical.computeDistanceBetween (latLngA, latLngB);
                distance: '5km',
                layerId: event.layerId
            }))
            .modal('show');
    };

    App.prototype.initSideBar = function () {
        function createFilterSectionMarkup(data) {
            //debugger;
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

        var d0 = $.Deferred();
        var d1 = $.Deferred();
        var d2 = $.Deferred();
        var d3 = $.Deferred();

        Knoema.Helpers.get('//yale.knoema.com/api/1.0/meta/dataset/pvbple/dimension/facility-type', function(data) {
            d0.resolve(data);
        });
        Knoema.Helpers.get('//yale.knoema.com/api/1.0/meta/dataset/pvbple/dimension/location', function(data) {
            d1.resolve(data);
        });
        Knoema.Helpers.get('//yale.knoema.com/api/1.0/meta/dataset/pvbple/dimension/sector', function(data) {
            d2.resolve(data);
        });
        Knoema.Helpers.get('//yale.knoema.com/api/1.0/meta/dataset/pvbple/dimension/ncd-sara-composite-score', function(data) {
            d3.resolve(data);
        });

        $.when.apply(null, [
            d0,
            d1,
            d2,
            d3
        ]).done(function onDimensionsLoaded(facilityType, location, sector, ncdData) {
            $('#side-bar').append(createFilterSectionMarkup(facilityType));
            $('#side-bar').append(createFilterSectionMarkup(location));
            $('#side-bar').append(createFilterSectionMarkup(sector));

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
            $.template(templateId, templateSrc);
        }
        var templates = [
            $.get('tmpl/side-bar-checkbox-section.html', compileTemplate),
            $.get('tmpl/side-bar-radio-section.html', compileTemplate),
            $.get('tmpl/info-window-content.html', compileTemplate),
            $.get('tmpl/facility-profile.html', compileTemplate),
            $.get('tmpl/select-medicine.html', compileTemplate),
            $.get('tmpl/heatmap-legend.html', compileTemplate),
            $.get('tmpl/time-members.html', compileTemplate),
            $.get('tmpl/long-tooltip.html', compileTemplate),
            $.get('tmpl/survey-2013.html', compileTemplate)
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