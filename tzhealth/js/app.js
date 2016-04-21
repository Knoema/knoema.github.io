(function () {

    app = function app() {
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

        this.mode = 'map';

        this.topBarHeight = 55;

        this.drugsAvailability = null;
        this.neededWorkers = null;

        this.markers = [];

        this.settings = {
            search: '',
            bounds: null,
            geoSearchType: null,
            geoSearch: null,
            priorityFor: 'None'
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
            'Assistant Laboratory Technologist-Holds Certificate': 'Assistant Laboratory Technologist - Holds Certificate',
            'Assistant Laboratory Technologist-Holds Certificate': 'Assistant Laboratory Technologist - Holds Certificate'
        };

        //http://knoema.com/cltckhb/tanzania-health-monitor
        this.geoPlaygroundId = 'cltckhb';

        //Will store whole playground here
        this.geoPlaygroundContent = null;

        this.layers = {};
        this.view = 'map';
        this.loans = null;

        //hashmap "Facility Name" -> attributes
        this.allData = {};

        this.map = new google.maps.Map(document.getElementById('map-canvas'), {
            //Tanzania
            //center: {lat: -6, lng: 35},

            //proper center for demo
            center: {lat: -3, lng: 33},
            zoom: 9,

            streetViewControl: false,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP
            },
            mapTypeId: google.maps.MapTypeId.HYBRID
        });

        google.maps.event.addListenerOnce(this.map, 'idle', function () {
            var idleTimeout = window.setTimeout(function () {
                var url = 'http://knoema.com/api/1.0/frontend/resource/' + self.geoPlaygroundId + '/content';
                Knoema.Helpers.get(url, function(content) {
                    self.geoPlaygroundContent = content;
                    for (var layerId in content.layers) {
                        self.loadLayer(layerId);
                    }
                });
            }, 300);
        });

        this.loadTemplates();

        this.bindEvents();

        this.initRadiusTool();

        this.initDrugSearchDialog();

        this.initSideBar();

        $(window).trigger('resize');

        Knoema.Helpers.post('//knoema.com/api/1.0/data/details', neededWorkesDataDescriptor, function(response) {
            self.neededWorkers = _.groupBy(_.chunk(response.data, response.columns.length), function(d) {
                return d[2];
            });
        });

        Knoema.Helpers.post('//knoema.com/api/1.0/data/details', drugsDataDescriptor, function(response) {
            self.drugsAvailability = _.groupBy(_.chunk(response.data, 11), function(d) {
                return d[2];
            });
        });

    };

    app.prototype.initSideBar = function () {
        var self = this;
        Knoema.Helpers.get('//knoema.com/api/1.0/meta/dataset/znxktgc/dimension/cadre-type', function(response) {
            $('#priority-for').append($.tmpl('vacancies-list-template.html', {
                vacancies: ['None'].concat(_.map(response.items, 'name'))
            }));

            $('#priority-for').on('click', '.list-group-item', function() {
                $(this).parent().find('.active').removeClass('active');
                $(this).addClass('active');
                self.settings.priorityFor = $(this).data('priorityFor');
                self.reloadLayers();
            });

        });
    };

    //TODO Refactor using $.when[] then
    app.prototype.loadTemplates = function () {
        var templates = [
            'profile-template.html',
            'table-row-template.html',
            'vacancies-list-template.html'
        ];
        $.get('tmpl/profile-template.html', function(templateSrc) {
            $.template(this.url.replace('tmpl/', ''), templateSrc);
        });
        $.get('tmpl/table-row-template.html', function(templateSrc) {
            $.template(this.url.replace('tmpl/', ''), templateSrc);
        });
        $.get('tmpl/vacancies-list-template.html', function(templateSrc) {
            $.template(this.url.replace('tmpl/', ''), templateSrc);
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
                            'Hours of Operation, Total'
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
                        console.log('TODO Add data from another dataset here');
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
            profileData.push({
                tabName: 'Needed workers',
                neededWorkers: _.sortBy(self.neededWorkers[facilityName], function(w) { return Number(w[0]); })
            });
        }

        console.log('======================================');
        console.log('profileData', profileData);
        console.log('======================================');


        $('#profile').html('<h2>' + facilityName + '</h2>');

        $('#profile').append($.tmpl('profile-template.html', {
            profileData: profileData
        }));

        // $('#profile').append($('#profile-template').tmpl({
        //     profileData: profileData
        // }));

        var tabHeight = $(window).height() - 200;
        $('#profile').find('.drug-list').css({
            height: tabHeight
        });

        self.switchView('profile');
    };

    app.prototype.onBeforeDraw = function (event, callback, id) {
        var self = this;
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
                var marker = new MarkerWithLabel({
                    //anchor property doesn't work
                    //anchor: new google.maps.Point(0, 2000),
                    position: event.data.position,
                    map: self.map,
                    labelAnchor: new google.maps.Point(8, 15),//8-horiz, 5-vert

                    //TODO Popolate with proper data
                    //labelContent:  '42',
                    //labelClass: 'labels'
                });

                //TODO Uncomment this
                //marker.setIcon(event.data.icon.url);

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

        //$('#priority-for').parent().height() - 40

        //$('#priority-for').height();//padding 20 top/bottom

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

        var delay = (function () {
            var timer = 0;
            return function (callback, ms) {
                clearTimeout(timer);
                timer = setTimeout(callback, ms);
            };
        })();

        $('#filter-objects').keyup(function () {
            delay(function () {

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
            }.bind(this), 200);
        });
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
                break;
            case 'table':
                $('#table').show();
                $('#profile').empty().hide();

                $('.map-component').hide();

                $('#table').stickyTableHeaders();
                $('#table').on('click', 'tbody tr', function(e) {
                    var facilityName = $(e.target).closest('tr').data('facilityName');
                    self.showProfile(facilityName, self.allData[facilityName]);
                });
                break;

            case 'profile':
                $('#table').hide();
                $('.map-component').hide();
                $('#profile').show();

                $('#back-button').on('click', function() {
                    self.switchView($('#main-menu').find('.active').data('mode'));
                });

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
        new app().run();
    });

})();