(function () {

    var app = function app() {
    };

    app.prototype.run = function () {

        var self = this;
        this.infoWindow = new google.maps.InfoWindow();
        this.clients = [];
        this.credit = [];
        this.savings = [];
        this.total = [];
        this.layers = {};
        this.count = 0;
        this.noDataColor = 'gray';

        this.mode = 'map';

        this.topBarHeight = 55;

        this.drugsAvailability = null;
        this.neededWorkers = null;

        this.markers = [];

        this.facilities = [];

        this.selectedIndicator = null;
        this.sortedVacancies = null;

        this.byTime = null;

        this.infoWindow = new google.maps.InfoWindow();

        this.geoJsonLayer = 'regionsLayer';
        self.regionsLayer = null;
        self.districtsLayer = null;

        this.settings = {
            search: '',
            bounds: null,
            geoSearchType: null,
            geoSearch: null,
            priorityFor: 'None'
        };

        this.vacanciesNamesToChange = {
            // "ADO",
            // "AMO",
            // "ANO",
            "Clinical_officer": "Clinical officer",
            "Dental_officer": "Dental officer",
            "Dental_therapist": "Dental therapist",
            "Lab_assistant": "Lab assistant",
            "Lab_tech": "Lab tech",
            "Medical_attendant": "Medical attendant",
            "Medical_officer": "Medical officer",
            // "Nurse",
            "Nursing_officer": "Nursing officer",
            "Occupational_therapist": "Occupational therapist",
            "Ophthalmic_NO": "Ophthalmic NO",
            // "Ophthalmologist",
            // "Optometrist",
            "Pharma_assistant": "Pharma assistant",
            "Pharma_tech": "Pharma tech",
            // "Pharmacist",
            // "Physiotherapist",
            // "Radiographer",
            "Radiology_scientist": "Radiology scientist"
        };

        this.namesToChange = {
            "Clinic": "Facility Type",
            "Hours of Operation, Total": "Hours of Operation",
            "In-Charge's Phone Number": "Phone number",
            "Insul": "Insulin",
            "Anti_PIH": "Anti PIH",
            "EAC::  Delivery": "EAC: Delivery",
            'Clinical Officer- Holds a Diploma': 'Clinical Officer - Holds a Diploma',
            'Clinical Assistant-Holds a Certificate': 'Clinical Assistant - Holds a Certificate',
            'Nurse Officer-Holds a Degree': 'Nurse Officer - Holds a Degree',
            'Assistant Nurse Officer-Holds a Diploma': 'Assistant Nurse Officer - Holds a Diploma',
            'Enrolled Nurse- Certificate': 'Enrolled Nurse - Certificate',
            'Laboratory Technologist Officer-Holds a Degree': 'Laboratory Technologist Officer - Holds a Degree',
            'Assistant Laboratory Technologist-Holds Certificate': 'Assistant Laboratory Technologist - Holds Certificate'
        };

        //http://knoema.com/cltckhb/tanzania-health-monitor
        //this.geoPlaygroundId = 'cltckhb';
        //this.geoPlaygroundId = 'hwnnaxg';
        this.geoPlaygroundId = 'xexprg';

        this.layers = {};
        this.view = 'map';

        //hashmap "Facility Name" -> attributes
        this.allData = {};

        this.map = new google.maps.Map(document.getElementById('map-canvas'), {
            //Tanzania
            center: {lat: -6, lng: 35},
            zoom: 6,

            //proper center for demo
            // center: {lat: -3, lng: 33},
            // zoom: 9,

            streetViewControl: false,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP
            },
            mapTypeId: google.maps.MapTypeId.HYBRID
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

        $('#region-switcher').on('change', 'input', function(event) {
            self.infoWindow.close();
            self.geoJsonLayer = $(event.target).val();
            self.updateFeatures();
        });

        self.regionsLayer = new google.maps.Data();
        self.districtsLayer = new google.maps.Data();

        self.regionsLayer.loadGeoJson('TZA_adm1.json', {}, function() {
            self.regionsLayer.setStyle({
                fillColor: self.noDataColor,
                fillOpacity: 0.7,
                visible: false
            });
        });
        self.districtsLayer.loadGeoJson('tanzaniaDistrict-2016-04-28.json', {}, function() {
            self.districtsLayer.setStyle({
                fillColor: self.noDataColor,
                fillOpacity: 0.7,
                visible: false
            });
        });

        self.regionsLayer.setMap(this.map);
        self.districtsLayer.setMap(this.map);

        self.regionsLayer.addListener('click',   $.proxy(self.handleLayerClick, self));
        self.districtsLayer.addListener('click', $.proxy(self.handleLayerClick, self));

        this.loadTemplates();

        this.bindEvents();

        this.initRadiusTool();

        this.initDrugSearchDialog();

        this.initSideBar();

        $(window).trigger('resize');

        Knoema.Helpers.post('//knoema.com/api/1.0/data/details', neededWorkesDataDescriptor, function(response) {
            var vacancies = _.chunk(response.data, response.columns.length);

            self.groupedByVacancyName = _.groupBy(vacancies, function(d) {
                return d[1];
            });

            self.neededWorkers = _.groupBy(vacancies, function(d) {
                return d[2];
            });
        });

        Knoema.Helpers.post('//knoema.com/api/1.0/data/details', drugsDataDescriptor, function(response) {
            self.drugsAvailability = _.groupBy(_.chunk(response.data, 11), function(d) {
                return d[2];
            });
        });

    };

    app.prototype.handleLayerClick = function(event) {
        var self = this;

        self.infoWindow.close();

        var $selectedIndicator = $('#indicator-list-holder').find('.active');

        var regionId = event.feature.getId();
        var indicatorName = $selectedIndicator.text();

        if (_.isEmpty(indicatorName) || _.isEmpty(regionId)) {
            return;
        }

        var dataTuple;

        if (!_.isUndefined(self.activeTimelineMember) && !_.isNull(self.byTime)) {
            dataTuple = _.find(self.byTime[self.activeTimelineMember], function(tuple) {return tuple.RegionId == regionId});
        }

        var value = (_.isUndefined(dataTuple) || !_.isUndefined(dataTuple) && _.isNull(dataTuple.Value)) ? 'No data' : Globalize.format(dataTuple.Value);

        var $content = $.tmpl('infowindow-content-template.html', {
            regionId: self.pivotResponse.regions[regionId],
            indicatorGroup: $('#indicator-select-holder').find('option:selected').parent().prop('label'),
            indicatorName:  indicatorName,
            activeTimelineMember: self.activeTimelineMember,
            value: value
        });

        self.infoWindow.setContent($content.html());
        self.infoWindow.setPosition(event.latLng);
        self.infoWindow.open(self.map);
    };

    app.prototype.updateFeatures = function() {
        var self = this;
        var layer2 = self.geoJsonLayer === 'regionsLayer' ? 'districtsLayer' : 'regionsLayer';
        self[layer2].setStyle({
            visible: false
        });
        self[self.geoJsonLayer].setStyle({
            fillColor: self.noDataColor
        });

        self[self.geoJsonLayer].forEach(function(feature) {
            var regionId = feature.getId();

            var currentRegionData;
            if (!_.isUndefined(self.activeTimelineMember) && !_.isNull(self.byTime)) {
                currentRegionData = _.find(self.byTime[self.activeTimelineMember], function(tuple) {
                    return tuple.RegionId === regionId;
                });
            }
            var color = (_.isUndefined(currentRegionData) || !_.isUndefined(currentRegionData) && _.isNull(currentRegionData.Value)) ? self.noDataColor : self.getColor(currentRegionData.Value);

            self[self.geoJsonLayer].overrideStyle(feature, {
                fillColor: color,
                fillOpacity: 0.7
            });
        });
    };

    app.prototype.removeTimeline = function() {
        $('#timeline').empty().off().css({
            visibility: 'hidden'
        });
    };

    app.prototype.addTimeline = function (timeMembers) {
        var self = this;
        this.removeTimeline();

        var $timeline = $('#timeline');

        $timeline.off();

        $timeline.on('click', '.timepoint', function(e) {
            self.infoWindow.close();
            self.activeTimelineMember =   $(e.target).data('time');
            $('#timeline').find('.active').removeClass('active');
            $(e.target).addClass('active');
            self.updateFeatures();
        });

        $timeline.on('click', '.play-button', function(e) {
            self.infoWindow.close();
            $('#timeline').find('.timepoint').each(function(i, element) {

                setTimeout(function () {
                    self.activeTimelineMember = $(element).data('time');

                    $('#timeline').find('.active').removeClass('active');
                    $(element).addClass('active');

                    self.updateFeatures();

                }, 2000 * i);

            });

        });

        $timeline.append($.tmpl('timeline-template.html', {
            timeMembers: timeMembers
        }));

        $timeline.find('.scroll-content').mCustomScrollbar({
            theme: "dark",
            axis:"x",
            advanced:{
                autoExpandHorizontalScroll:true
            }
        });

        $timeline.css({
            visibility: 'visible'
        });

        $(window).trigger('resize');

    };

    app.prototype.hideLegend = function() {
        $('#color-legend').hide();
    };

    app.prototype.showLegend = function(min, max) {
        var self = this;

        var minColor = self.getColor(min);
        var maxColor = self.getColor(max);

        var $colorLegend = $('#color-legend');

        $colorLegend.find('.min').html(Globalize.format(min));
        $colorLegend.find('.max').html(Globalize.format(max));
        $colorLegend.find('.palette').css({ "background": 'linear-gradient(90deg, ' + minColor + ', ' + maxColor + ')' });
        $colorLegend.show();
    };

    app.prototype.loadTimeSeries = function (selectedIndicator) {
        var self = this;
        if (selectedIndicator == null) {

            $('#region-switcher').hide();

            self.removeTimeline();

            self.regionsLayer.setStyle({
                visible: false
            });
            self.districtsLayer.setStyle({
                visible: false
            });

        } else {

            $('#region-switcher').show();

            timeSeriesDataDescriptor.Filter[0].Members[0] = selectedIndicator;

            Knoema.Helpers.post('//knoema.com/api/1.0/data/pivot', timeSeriesDataDescriptor, function(pivotResponse) {
                var mapMeta;

                self.pivotResponse = pivotResponse;

                self.byTime = null;

                if (!_.isString(pivotResponse.data) && pivotResponse.data.length) {

                    self.byTime = _.groupBy(pivotResponse.data, function(tuple) {

                        //TODO Format using Knoema.Utils & our custom frequencies
                        return tuple.Time.substring(0, 4);
                    });

                    var timelineMembers = _.keys(self.byTime);

                    self.activeTimelineMember = timelineMembers[0];

                    var min = _.minBy(pivotResponse.data, 'Value').Value;
                    var max = _.maxBy(pivotResponse.data, 'Value').Value;

                    self.getColor = d3.scale.linear()
                        .domain([min, max])
                        .range(["gold", "red"]);

                    self.showLegend(min, max);

                    self.addTimeline(timelineMembers);

                } else {
                    //console.log('%cNO DATA FOR ' + selectedIndicator, 'color:red;font-size:200%;');
                    self.hideLegend();
                    self.removeTimeline();
                    self.infoWindow.close();
                }

                self.updateFeatures();

            });
        }

    };

    app.prototype.getParentKey = function (items, item, itemIndex) {
        for (var i = itemIndex; i > -1; i--) {
            if (items[i].level < item.level) {
                return items[i].key.toString();
            }
        }
        return "0";
    };

    app.prototype.getOptions = function (items) {
        var self = this;
        var treeData = {
            name: "Root element",
            children: []
        };

        var levels = _.toArray(_.groupBy(items, function(item) { return item.level }));

        _.each(items, function(item, i) {
            item.parentKey = self.getParentKey(items, item, i);
        });

        var grouped = _.groupBy(items, 'parentKey');

        treeData.children = grouped['0'];

        var options = [];

        function populateChildren(child, i) {
            if (grouped[child.key]) {
                child.children = grouped[child.key];
                _.each(child.children, populateChildren);
            }
        }

        _.each(treeData.children, populateChildren);

        function getFullName(child) {
            var parent = _.find(items, function(item) {
                return child.parentKey == item.key;
            });

            if (parent) {
                child.name = getFullName(parent) + ' - ' + child.name;
            } else {
                return child.name;
            }
        }

        var opt2 = [];

        function buildOptions(child, i) {
            var children = _.filter(child.children, function(c) { return !_.isUndefined(c.children) });
            if (children.length) {
                _.each(child.children, buildOptions);
            } else {
                var parent = _.find(items, function(i) {return i.key == child.parentKey});
                if (parent) {
                    //child.name = parent.name + ' - ' + child.name;
                    child.name = getFullName(child);
                }
                opt2.push(child);
            }
        }

        _.each(treeData.children, buildOptions);

        //true tree structure (not used at the moment)
        self.treeData = treeData;

        return opt2;

    };

    app.prototype.initSideBar = function () {
        this.initIndicatorsList();
        this.initPriorityForList();
    };

    app.prototype.initIndicatorsList = function() {
        var self = this;
        Knoema.Helpers.get('//knoema.com/api/1.0/meta/dataset/TANSATR2016R/dimension/indicator', function(response) {

            self.items = response.items;

            _.each(self.items, function(item, i) {
                item.parentKey = self.getParentKey(self.items, item, i);
            });

            self.grouped = _.groupBy(self.items, 'parentKey');

            var treeData = {
                children: self.grouped['0']
            };

            function populateChildren(child, i) {
                if (self.grouped[child.key]) {
                    child.hasChildren = true;
                    child.children = self.grouped[child.key];
                    _.each(child.children, populateChildren);
                }
            }

            _.each(self.items, populateChildren);

            var $indicatorsHolder = $('#indicator-list-holder');

            $indicatorsHolder.html($.tmpl('indicator-list-template.html', {
                items: self.items
            }));

            $indicatorsHolder
                .find('.side-bar-list')
                .mCustomScrollbar({
                    theme: "dark"
                });


            $indicatorsHolder.on('click', '.has-data', function(e) {
                $('#indicator-list-holder').find('.active').removeClass('active');
                $(e.target).addClass('active');
                self.loadTimeSeries($(e.target).data('key'));
            });

            // $('#timeseries-settings').find('.chosen-select').chosen({
            //     "width": "100%"
            // });

            // var options = self.getOptions(self.items);
            // $('#indicator-select-holder').html($.tmpl('indicator-select-template.html', {
            //     options: options
            // }));

            // $('#indicator-select-holder').on('change', 'select', function(e) {
            //     self.loadTimeSeries($(e.target).val());
            // });

        });
    };

    app.prototype.initPriorityForList = function () {
        var self = this;
        Knoema.Helpers.get('//knoema.com/api/1.0/meta/dataset/znxktgc/dimension/cadre-type', function(response) {

            $('#priority-for').append($.tmpl('vacancies-list-template.html', {
                vacancies: [
                    {
                        name: 'None',
                        key: 'None'
                    }
                ].concat(_.map(response.items, function(vacancy) {
                    return {
                        // Change vacancy name
                        name: _.isUndefined(self.vacanciesNamesToChange[vacancy.name]) ? vacancy.name : self.vacanciesNamesToChange[vacancy.name],
                        key: vacancy.name
                    }
                }))
            }));

            self.onResize();

            $('#priority-for').on('click', '.vacancy', function() {
                $(this).parent().find('.active').removeClass('active');
                $(this).addClass('active');

                self.settings.priorityFor = $(this).data('priorityFor');

                if (self.settings.priorityFor !== 'None') {
                    var vacancies = _.uniqBy(self.groupedByVacancyName[self.settings.priorityFor], function(v) {
                        return v[2];
                    });
                    self.sortedVacancies = _.sortBy(vacancies, function(v) {
                        return -1 * Number(v[0]);
                    }).filter(function(v) {
                        //Filter by existing facilities
                        return _.indexOf(self.facilities, v[2]) > -1;
                    });
                }
                self.reloadLayers();
            });

        });
    };

    app.prototype.loadTemplates = function (callback) {
        var self = this;
        function compileTemplate(templateSrc) {
            $.template(this.url.replace('tmpl/', ''), templateSrc);
        }
        var templates = [
            $.get('tmpl/indicator-select-template.html', compileTemplate),
            $.get('tmpl/profile-template.html', compileTemplate),
            $.get('tmpl/table-row-template.html', compileTemplate),
            $.get('tmpl/vacancies-list-template.html', compileTemplate),
            $.get('tmpl/timeline-template.html', compileTemplate),
            $.get('tmpl/infowindow-content-template.html', compileTemplate),
            $.get('tmpl/indicator-list-template.html', compileTemplate)
        ];
        $.when.apply(null, templates).done(function onTemplatesLoaded() {
            if ($.isFunction(callback)) {
                callback();
            }
        });
    };

    app.prototype.initDrugSearchDialog = function (id) {
        var self = this;
        Knoema.Helpers.get('//knoema.com/api/1.0/meta/dataset/fgovnne/dimension/tracer-commodity-checklist', function(response) {

            var options = _.map(response.items, function(item) {
                return '<option data-search-type="drug" value="' + item.name + '">' + item.name + '</option>';
            }).join('');
            var drugOptGroup = '<optgroup label="Pharmaceutical">' + options + '</optgroup>';

            var clinicTypes = [
                'Dispensary',
                'Health Centre',
                'Hospital'
            ].map(function(item) {
                return '<option data-search-type="facility" value="' + item + '">' + item + '</option>';
            }).join('');
            var clinicOptGroup = '<optgroup label="Facility">' + clinicTypes + '</optgroup>';

            options = clinicOptGroup + drugOptGroup;
            $('#drug-select').html(options);
        });
    };

    app.prototype.loadLayer = function (id) {
        var self = this;
        var layer = this.layers[id];

        $(document.body).addClass('loading');

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
                self.showProfile(e.data.tooltip['Facility Name'], e.data.tooltip);
            });

            layer.on('beforeDraw', function (e, callback) {
                self.onBeforeDraw(e, callback, id);
            });

            self.layers[id] = layer;
        }
        layer.load();
    };

    app.prototype.showProfile = function (facilityName, data) {
        var self = this;
        for (var key in data) {
            if ($.isNumeric(data[key]))
                data[key] = parseFloat(data[key]).toLocaleString();
        }
        var tabNames = [
            'General info',
            'Health workers',
            'Facilities',
            'Delivery room',
            'Reproductive child health clinic'
        ];

        if (data['District'] === "Shinyanga") {
            tabNames = tabNames.concat([
                'Maternal and Child Health',
                'Clinic Visits',
                'X HCT',
                'XFP',
                'Deliveries',
                'Medicine'
            ]);
        }

        var profileData = _.map(tabNames, function (tabName) {

            var tabDataKeys = [];

            switch (tabName) {

                case 'General info':

                    if (data['District'] === "Shinyanga") {
                        tabDataKeys = [
                            'Facility name',
                            'Ward Name',
                            'Village Name',
                            'Clinic',
                            "In-Charge's Phone Number",
                            'Cadre of In-Charge',
                            'Total Population Per Catchment Area',
                            'Hours of Operation (opening hours)'
                        ];
                    } else {
                        tabDataKeys = [
                            'Facility name',
                            'Ward Name',
                            'Clinic',
                            'Ownership',
                            //'Hours of Operation, Total'
                            'Hours of Operation (opening hours)'
                        ];
                    }
                    break;

                case 'Health workers':
                    if (data['District'] === "Shinyanga") {
                        tabDataKeys = [
                            'Medical Doctor-Holds a Degree',
                            'Medical Officer',
                            'Assistant Medical Doctor',

                            'Clinical Officer- Holds a Diploma',
                            'Clinical Assistant-Holds a Certificate',
                            'Nurse Officer-Holds a Degree',
                            'Assistant Nurse Officer-Holds a Diploma',
                            'Enrolled Nurse- Certificate',

                            'Medical Attendant',
                            'Laboratory Technologist Officer-Holds a Degree',
                            'Laboratory Technologist - Holds Diploma',
                            'Assistant Laboratory Technologist-Holds Certificate',
                            'HO',
                            'AHO',
                            'Health Assistant',
                            'Social Welfare Officer',
                            'ASWO',
                            'Medical Pharmacist',
                            'A.PHAM',
                            'Health Secretary',
                            'Trained In Bemonc ?',
                            'Trained In Cemonc ?'
                        ];
                    } else {
                        tabDataKeys = [
                            'Medical Doctor-Holds a Degree',
                            'Medical Officer',
                            'Assistant Medical Doctor',
                            'Clinical Officer- Holds a Diploma',
                            'Clinical Assistant-Holds a Certificate',
                            'Nurse Officer-Holds a Degree',
                            'Assistant Nurse Officer-Holds a Diploma',
                            'Enrolled Nurse- Certificate',
                            'Medical Attendant',
                            'Laboratory Technologist Officer-Holds a Degree',
                            'Laboratory Technologist - Holds Diploma',
                            'Assistant Laboratory Technologist-Holds Certificate',
                            'HO',
                            'AHO',
                            'Health Assistant',
                            'Social Welfare Officer',
                            'ASWO',
                            'Medical Pharmacist',
                            'A.PHAM',
                            'Health Secretary',
                            'Guards',
                            'Cleaner',
                            'RN',
                            'Mattend',
                            'NA',
                            'Driver',
                            'Data Clek',
                            'Recorder',
                            'Cook'
                        ];
                    }
                    break;

                case 'Facilities':
                    if (data['District'] === "Shinyanga") {
                        //TODO WHAT DOES YELLOW MEANS
                        tabDataKeys = [
                            {
                                name: '24 Hour Electricity (Y/N)?',
                                children: [
                                    'Generator',
                                    'Flash Light Or Lamp'
                                ]
                            },
                            {
                                name: '24 Hour Running Water (Y/N)?',
                                children: [
                                    'Refrigeration Or Cold Storage'
                                ]
                            },
                            {
                                name: 'Communication/Phone, Radio,Or Walkie Talkie(Y/N)?',
                                children: [
                                    'Network Available'
                                ]
                            },
                            'Source of Water',
                            'Washroom',
                            'Accomodation',
                            'Insul'
                            /*
                            * MISSING (MARKED WITH YELLOW)
                             Level of Training
                             Level of Skilled Staff
                             Trained In Bemonc?
                             Trained In Cemonc?
                            */
                        ];
                    } else {
                        tabDataKeys = [
                            {
                                name: '24 hour Electricity (Y/N)?/ Source of Energy',
                                children: [
                                    'National Grid',
                                    'Generator',
                                    'Solar Panel',
                                    'Others'
                                ]
                            },
                            {
                                name: '24 hour Running Water (Y/N)?/ Source of Water',
                                children: [
                                    'Piped Water In to Health Facility',
                                    'Piped Water to Yard/Plot',
                                    'Public Tap or Standpipe',
                                    'Tube Well or Borehole',
                                    'Protected Dug Well',
                                    'Protected Spring',
                                    'Rainwater Harvesting',
                                    'Others, Specify'
                                ]
                            },
                            'Refrigeration Or Cold Storage (Y/N)?',
                            'Vodacom',
                            'Mpesa Available',
                            'Can Ths Facility Do C-Section?',
                            'If Yes, Please Use The Check List:',
                            'Operating Table?',
                            'Operating Light?',
                            'Suction Machine?',
                            'Foot Operated Suction Machine?',
                            'Pulse Oximeter?',
                            'Caesarean Set?',
                            'Patient Monitor?',
                            'Diathermy Machine?',
                            'Trolley?',
                            'Stretcher?',
                            'Ultrasound Machine?',
                            'Autoclave?',
                            'Resuscitator Bags - Adult?',
                            'Resuscitator Bags - Child?',
                            'Anaesthesia Machine?',
                            'Anaethesia Stool?'
                        ];
                    }

                    break;

                case 'Delivery room':
                    if (data['District'] === "Shinyanga") {
                        tabDataKeys = [
                            'Labor Kit',
                            'Delivery Bed No.',
                            'Anti_PIH',
                            'Type of Anti-PIH',
                            'IV Fluids',
                            'IV Fluids Giving Sets',
                            'Cotton Wool',
                            'BP Machine',
                            'Ambubag/ Resuscitation Kit',
                            'Safety Glasses',
                            'Gloves',
                            'Suture',
                            'Sterilizer',
                            'Oxygen',
                            'MPESA Services Availlability',
                            'Youth Friendly Reproductive And Family Planning Services',
                            'Has Special Room For Family Planning?',
                            'Available Methods'
                        ];
                    } else {
                        tabDataKeys = [
                            'Labor Kit',
                            'Delivery Bed No.',
                            'Anti_PIH',
                            'Type of Anti-PIH',
                            'IV Fluids',
                            'IV Fluids Giving Sets',
                            'Cotton Wool',
                            'BP Machine',
                            'Ambubag/ Resuscitation Kit',
                            'Safety Glasses',
                            'Gloves',
                            'Partogram',
                            'Suture',
                            'Sterilizer',
                            'Oxygen',
                            'MVA',
                            'VE'
                        ];
                    }
                    break;

                case 'Reproductive child health clinic':
                    if (data['District'] === "Shinyanga") {
                        tabDataKeys = [
                            'Weighing Machine',
                            'Vaccination Availability/ Cold Chain',
                            'Anti-Malarial Drugs (e.g., SP) for Mothers',
                            'PMTCT Services',
                            'VDRL Testing/Screening',
                            'HB Monitoring',
                            'Blood Pressure Measuring',
                            'Community HCWs',
                            'Counseling Services',
                            'Fetalscope/ Dopetone',
                            'Partogram',
                            'IPT for Malaria',
                            'UTI screening',
                            'UTI treatment',
                            'Iron and Folate supplement'
                        ];
                    } else {
                        tabDataKeys = [
                            {
                                name: 'Family Planning',
                                children: [
                                    'Has Special Room For Family Planning?',
                                    'Family Planning Available'
                                ]
                            },
                            {
                                name: 'RCH',
                                children: [
                                    'Weighing Machine',
                                    'Vaccination Availability/ Cold Chain',
                                    'SP For Mothers',
                                    'PMTCT Services',
                                    'Testing For Syphilis',
                                    'HB Monitoring',
                                    'Blood Pressure Measuring',
                                    'Community Linkage',
                                    'Counseling Services',
                                    'Fetalscope/ Dopetone',
                                    'IPT for Malaria',
                                    'UTI screening',
                                    'UTI treatment',
                                    'Iron and Folate Supplement'
                                ]
                            }
                        ];
                    }
                    break;

                    case 'Maternal and Child Health':
                        if (data['District'] === "Shinyanga") {
                            tabDataKeys = [
                                'Delivery services?',
                                'Infant Mortality Rate',
                                'Death Rate Perinatal',
                                'Neonatal Mortality  Rate',
                                'Maternal Mortality Ratio (Institutional)'
                            ];
                        }
                        break;

                    case 'Clinic Visits':
                        if (data['District'] === "Shinyanga") {
                            tabDataKeys = [
                                'First Visit',
                                'ANC Fourth Visit',
                                'Post Natal Care Before 7 Days.(Attendance)',
                                'Post Natal Care Within 2 Days.( Attendance)',
                                'Post Natal Care'
                            ];
                        }
                        break;
                    case 'X HCT':
                        if (data['District'] === "Shinyanga") {
                            tabDataKeys = [
                                'Tested, Male',
                                'Tested, Female',
                                'HIV Positive Adults, Male',
                                'HIV Positive Adults, Female',
                                'HIV Positive < 14 Years, Male',
                                'HIV Positive < 14 Years, Female',
                                'Total'
                            ];
                        }
                        break;
                    case 'XFP':
                        if (data['District'] === "Shinyanga") {
                            tabDataKeys = [
                                'Kufunga Kizazi Wanawake, Kituoni',
                                'Kufunga Kizazi Wanawake, Outreach',
                                'Kufunga Uzazi Baba, Kituoni',
                                'Kufunga Uzazi Baba, Outreach',
                                'Kuweka Kitanzi, Kituoni',
                                'Kuweka Kitanzi, Outreach',
                                'Vipandikizi',
                                'Vidonge',
                                'Jumla'
                            ];
                        }
                        break;
                    case 'Deliveries':
                        if (data['District'] === "Shinyanga") {
                            tabDataKeys = [
                                'Home Delivery (No)',
                                'Home Delivery Rate',
                                'EAC::  Delivery',
                                'BBA Delivery Rate'
                            ];
                        }
                        break;
                    case 'Medicine':
                        if (data['District'] === "Shinyanga") {
                            tabDataKeys = [
                                'Bin card available with commodity',
                                'Physical Count',
                                'FEFO (Yes / No)',
                                'Exp Date (soonest)'
                            ];
                        }
                        break;

                    case 'Needed workers':
                        if (data['District'] === "Shinyanga") {
                            tabDataKeys = [
                                'Bin card available with commodity',
                                'Physical Count',
                                'FEFO (Yes / No)',
                                'Exp Date (soonest)'
                            ];
                        }
                        break;
            }

            var indicators = _.map(tabDataKeys, function (indicatorName) {
                if (typeof indicatorName === 'object') {
                    return {
                        name: indicatorName.name,
                        children: _.map(indicatorName.children, function(child) {
                            return {
                                name: child,
                                value: data[child]
                            }
                        })
                        .filter(function(child) {
                            return child.value != 0 && child.value != '';
                        })
                    }
                } else {
                    if (Boolean(data[indicatorName])) {
                        var name = self.namesToChange[indicatorName] ? self.namesToChange[indicatorName] : indicatorName;
                        return {
                            name: name,
                            value: data[indicatorName]
                        }
                    }
                }
            })
            .filter(function (indicator) {
                if (!Boolean(indicator)) {
                    return false;
                }
                if (indicator.children) {
                    var filtered = _.filter(indicator.children, function(child) {
                        return child.value != 0 && child.value != '';
                    });
                    return filtered.length;
                } else {
                    return indicator.value != 0 && indicator.value != '';
                }
            });

            return {
                tabName: tabName,
                indicators: indicators
            };

        }).filter(function(tab) {
            if (tab.tabName === 'Needed workers') {
                return true;
            }
            return tab.indicators.length;
        });

        if (typeof self.drugsAvailability[facilityName] !== 'undefined') {
            profileData.push({
                tabName: 'Drugs list',
                drugsList: self.drugsAvailability[facilityName]
            });
        }

        if (typeof self.neededWorkers[facilityName] !== 'undefined') {
            var neededWorkers = _.sortBy(self.neededWorkers[facilityName], function(w) {
                return Number(w[0]);
            });

            _.each(neededWorkers, function(vacancy, i) {
                var className;

                //"Priority Index", "Budget left, TZS" -> 6,7`
                var priorityIndex = vacancy[6];
                var budgetLeft = vacancy[7];

                if (priorityIndex >= 99999) {
                    className = 'green';
                } else {
                    className = (budgetLeft > 0) ? 'yellow' : 'red';
                }
                vacancy.push(className);
            });

            profileData.push({
                tabName: 'Needed workers',
                neededWorkers: neededWorkers
            });
        }

        $('#profile').html('<h2>' + facilityName + '</h2>');

        $('#profile').append($.tmpl('profile-template.html', {
            profileData: profileData
        }));

        var tabHeight = $(window).height() - 165;
        $('#profile').find('.drug-list').css({
            height: tabHeight
        });

        self.switchView('profile');
    };

    app.prototype.onBeforeDraw = function (event, callback, id) {
        var self = this;

        if (_.indexOf(self.facilities, event.data.content['Facility Name']) < 0) {
            self.facilities.push(event.data.content['Facility Name']);
        }

        if (_.isUndefined(this.allData[event.data.content['Facility Name']])) {
            this.allData[event.data.content['Facility Name']] = event.data.content;
        }

        if (this.settings.bounds !== null && event.data.visible) {
            event.data.visible = event.data.visible && this.settings.bounds.contains(event.data.position);
        }

        var search = this.settings['search'];

        if (search != '' && event.data.content['Facility Name'].toLowerCase().indexOf(search) < 0) {
            event.data.visible = false;
        }

        if (this.settings.geoSearch != null) {

            if (this.settings.geoSearchType === 'facility') {

                event.data.visible = event.data.visible && event.data.content.Clinic.toLocaleLowerCase() === self.settings.geoSearch.toLowerCase();

            } else if (this.settings.geoSearchType === 'drug') {

                if (_.isUndefined(this.drugsAvailability[event.data.content['Facility Name']])) {
                    event.data.visible = false;
                } else {
                    var drugsInLocation = this.drugsAvailability[event.data.content['Facility Name']];

                    var requestedDrug = _.find(drugsInLocation, function(drug) {
                        return drug[5].toLowerCase() === self.settings.geoSearch;
                    });

                    if (typeof requestedDrug[6] === 'string') {
                        requestedDrug[6] = requestedDrug[6].trim();
                    }

                    event.data.visible = event.data.visible && requestedDrug && (requestedDrug[6] != '' && requestedDrug[6] != 'N' && requestedDrug[6] != 0);

                }

            }
        }

        if (event.data.visible) {

            var tabDataKeys = [
                'Facility Name',
                'Ward Name',
                'Clinic',
                'Hours of operations',
                'Health workers'
            ];

            var data = _.pick(event.data.content, tabDataKeys);
            data.layerId = event.layerId;

            if (!$('#table').find('tr[data-facility-name="' + data['Facility Name'] + '"]').length) {
                data['Hours of Operation (opening hours)'] = event.data.content['Hours of Operation (opening hours)'];
                //$('#table').find('tbody').append($('#tmpl-table-row').tmpl({data: data}));

                $('#table').find('tbody').append($.tmpl('table-row-template.html', {data: data}));

            }

            var copy = $.extend({}, data);
            for (var key in copy) {
                if ($.isNumeric(copy[key]))
                    copy[key] = parseFloat(copy[key]).toLocaleString();
            };
            this.count++;
        }

        if (this.settings.priorityFor !== 'None') {
            //Workers needed in current clinic
            var facilityVacancies = _.map(self.neededWorkers[event.data.content['Facility Name']], function(d) {
                return d[1];
            });
            event.data.visible = event.data.visible && _.indexOf(facilityVacancies, self.settings.priorityFor) > -1;

            if (event.data.visible) {
                event.data.visible = false;

                //TODO Get proper index for current facility

                // var index = 1 + _.findIndex(self.sortedVacancies, function(v) {
                //     return v[2] === event.data.content['Facility Name'];
                // });

                // Label should look like "N/M" where
                // N - number of persons needed by a facility, M - number of persons for which the facility has budget.

                // N - this should be a number of all rows with the selected cadre
                // M - this should be a number of rows with the selected cadre where the "Budget left..." value is above zero

                var N = _.filter(self.neededWorkers[event.data.content['Facility Name']], function(v) {
                    return v[1] === self.settings.priorityFor;
                }).length;
                var M = _.filter(self.neededWorkers[event.data.content['Facility Name']], function(v) {
                    return v[1] === self.settings.priorityFor && v[7] > 0;
                }).length;

                var index = N.toString() + ' / ' + M.toString();

                var marker = new MarkerWithLabel({
                    //anchor property doesn't work
                    //anchor: new google.maps.Point(0, 2000),
                    position: event.data.position,
                    map: self.map,
                    labelAnchor: new google.maps.Point(0, 0),//new google.maps.Point(8, 0)
                    //TODO Popolate with proper data
                    labelContent:  index,
                    labelClass: 'labels'
                });

                //TODO Uncomment this
                marker.setIcon(event.data.icon);

                marker.addListener('click', function() {
                    self.showProfile(event.data.content['Facility Name'], event.data.content);
                });
                self.markers.push(marker);
            }
        }

        callback(event.data);
    };

    app.prototype.onResize = function () {
        var newHeight = $(window).height();

        $('#side-bar').height(newHeight - this.topBarHeight);

        $('#map-canvas').height(newHeight - this.topBarHeight);

        var timelineWidth = $('#map-canvas').width() - $('#color-legend').width() - 100;

        $('#timeline').find('.time-members, .scroll-content').css({
            "width": timelineWidth,
            "max-width": timelineWidth
        });

        var timeseriesSettingsHeight = $('#timeseries-settings').height();

        //TODO Add one callback for handling height of #timeseries-settings & #priority-for
        timeseriesSettingsHeight = 166;

        var priorityForHeight = newHeight - this.topBarHeight - timeseriesSettingsHeight - 220;

        $('#priority-for')
            .find('.side-bar-list')
            .css({
                //"background-color": "red",
                "height": priorityForHeight,
                "max-height": priorityForHeight
            })
            .mCustomScrollbar({
                theme: "dark"
            });

    };

    app.prototype.bindEvents = function () {
        var self = this;

        $(window).on('resize', $.proxy(this.onResize, this));

        $('#main-menu').on('click', '.btn', function () {
            var $btn = $(this);
            $btn.parent().find('.btn').removeClass('active');
            $btn.addClass('active');
            self.switchView($btn.data('mode'));
        });

        function keyupHandler() {

            self.settings['search'] = $.trim($(this).val().toLowerCase());

            self.reloadLayers();

            if ($('main-menu').find('.active').data('mode') == 'map') {

            } else {
                if (self.settings['search'] == '') {
                    $('#table').find('tbody tr').show();
                } else {
                    $('#table').find('tbody tr').hide();
                    $('#table').find('tbody tr').each(function(i, tr) {
                        var facilityName = $(tr).data('facilityName').toLowerCase();
                        if (facilityName.indexOf(self.settings['search']) > -1) {
                            $(tr).show();
                        }
                    });
                }
            }
        };

        $('#filter-objects').keyup(_.debounce(keyupHandler, 250));

    };

    app.prototype.reloadLayers = function () {
        var self = this;
        _.each(this.markers, function(m) {
            m.setMap(null);
        });
        this.markers = [];
        _.each(_.keys(this.layers), function(layerId) {
            self.loadLayer(layerId);
        });
    };

    app.prototype.switchView = function (viewName) {
        var self = this;

        switch (viewName) {
            case 'map':
                $('#table').hide();

                $('.map-component').show();

                $('#profile').empty().hide();
                $('#filter-objects').val('').trigger('keyup');


                if ($('#indicator-list-holder').find('.active').data('key') != null) {
                    $('#region-switcher').show();
                }

                break;
            case 'table':
                $('#table').show();
                $('#profile').empty().hide();

                $('.map-component').hide();

                $('#region-switcher').hide();

                //TODO Refactor: load as profile
                $('#table').stickyTableHeaders();

                $('#table').on('click', 'tbody tr', function(e) {
                    var facilityName = $(e.target).closest('tr').data('facilityName');
                    self.showProfile(facilityName, self.allData[facilityName]);
                });
                
                self.hideLegend();
                self.removeTimeline();

                break;

            case 'test-table':
                $('#table').hide();
                $('.map-component').hide();
                $('#profile').empty().hide();
                $('#region-switcher').hide();

                $('#test-table').height($('#content').height()).show();

                //TODO Apply custom scroller here

                // $('#test-table').find('.nano').nanoScroller({
                //     preventPageScrolling: true,
                //     alwaysVisible: true
                // });

                self.hideLegend();
                self.removeTimeline();

                break;

            case 'profile':
                $('#table').hide();
                $('.map-component').hide();
                $('#profile').show();
                $('#region-switcher').hide();

                $('#back-button').on('click', function() {
                    self.switchView($('#main-menu').find('.active').data('mode'));
                });

                self.hideLegend();
                self.removeTimeline();

                break;
        }
        self.view = viewName;
    };

    app.prototype.initRadiusTool = function () {
        var self = this;
        var $radiusButton = $('#pin-button');

        var shapeOptions = {
            fillColor: 'black',
            fillOpacity: 0.2,
            strokeWeight: 4,
            strokeColor: 'red',
            clickable: false,
            editable: true,
            zIndex: 1
        };
        var drawingManager = new google.maps.drawing.DrawingManager({
            map: this.map,
            drawingMode: null,
            drawingControl: false,
            circleOptions: shapeOptions,
            rectangleOptions: shapeOptions
        });

        //close button of drug search dialog
        $('#drug-search-subimit').on('click', function() {
            var latLng = new google.maps.LatLng(self.areaToolShape.center.lat(), self.areaToolShape.center.lng());
            var bounds = self.areaToolShape.getBounds();

            self.settings['bounds'] = bounds;

            drawingManager.setDrawingMode(null);
            self.areaToolShape['setMap'](null);
            self.areaToolShape = null;

            //facility/drug
            self.settings.geoSearchType = $('#drug-select').find('option:selected').data('searchType');
            self.settings.geoSearch = $('#drug-select').val().toLowerCase();
            self.reloadLayers();
        });

        $('#drug-search-dialog').on('click', '.close', function() {
            $radiusButton.removeClass('btn-warning');
            self.areaToolShape.setMap(null);
        });

        google.maps.event.addListener(drawingManager, 'circlecomplete', function(circle) {
            drawingManager.setDrawingMode(null);
            self.areaToolShape = circle;

            $('#drug-select').selectpicker();

            $('#drug-search-dialog').modal('show');

            var oldRadiusValue = Math.floor(self.areaToolShape.getRadius() / 1000);

            $('#distance').val(oldRadiusValue);

            $('#distance').on('change', function() {
                self.areaToolShape.setRadius($(this).val() * 1000);
            });

            $('#distance').parent().on('click', 'button', function() {

                var newRadius = Math.floor(self.areaToolShape.getRadius() / 1000);

                if ($(this).data('action') == 'up') {
                    newRadius += 1;
                } else {
                    newRadius -= 1;
                }
                if (newRadius < 0) {
                    newRadius = 0;
                }

                $('#distance').val(newRadius);

                //self.areaToolShape
                self.areaToolShape.setRadius(newRadius * 1000);

            });

        });

        $radiusButton.on('click', function(e) {

            //if (drawingManager.getDrawingMode() == null) {
            if (!$radiusButton.hasClass('btn-warning')) {
                $radiusButton.addClass('btn-warning');
                drawingManager.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
            } else {
                $radiusButton.removeClass('btn-warning');

                self.settings.bounds = null;
                self.settings.geoSearch = null;

                self.reloadLayers();
            }
        });
    };

    google.maps.event.addDomListener(window, 'load', function () {
        //new app().run();
        window.tzhealth = new app();
        window.tzhealth.run();
    });

})();