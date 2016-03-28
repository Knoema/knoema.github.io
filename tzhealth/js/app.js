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

        this.settings = {
            search: '',
            bounds: null,
            drugSearch: null
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
                self.bubblesLayer = new Knoema.GeoPlayground.BubblesLayer(self.map, {
                    clusterize: false
                });
                var url = 'http://knoema.com/api/1.0/frontend/resource/' + self.geoPlaygroundId + '/content';
                Knoema.Helpers.get(url, function(content) {
                    self.geoPlaygroundContent = content;
                    for (var layerId in content.layers) {
                        self.loadLayer(layerId);
                    }
                });
            }, 300);
        });

        this.bindEvents();

        this.initRadiusTool();

        this.initDrugSearchDialog();

        $.ajax({
            url: '//knoema.com/api/1.0/data/details',
            type: 'POST',
            data: JSON.stringify(drugsDataDescriptor),
            processData: false,
            contentType: 'application/json; charset=utf-8',
            error: function(e) {
                console.log('ERROR', e);
            },
            success: function (response, status) {
                self.drugsAvailability = _.groupBy(_.chunk(response.data, 11), function(d) {
                    return d[2];
                });
            }
        });

    };

    //app.prototype.loadTemplates = function () {
    //    _.each([
    //        'profile-template.html',
    //        'table-row-template.html'
    //    ], function(filename, i) {
    //        $.get(window.location.pathname + 'tmpl/' + filename, function(templateRawData) {
    //            $.template(templateRawData, $(templateRawData).data('templateName'));
    //        });
    //    });
    //};

    app.prototype.initDrugSearchDialog = function (id) {
        var self = this;
        $.ajax({
            url: '//knoema.com/api/1.0/meta/dataset/fgovnne/dimension/tracer-commodity-checklist',
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            error: function(e) {
                console.log('ERROR', e);
            },
            success: function (response, status) {

                var options = _.map(response.items, function(item) {
                    return '<option value="' + item.name + '">' + item.name + '</option>';
                }).join('');

                options = '<option value="Clinic">Clinic</option>' + options;

                $('#drug-select').html(options);
            }
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
                geoPlaygroundId: self.geoPlaygroundId,
                bubblesLayer: self.bubblesLayer
            }, function(layer2) {
                console.log('layer2', layer2);
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

                        /*
                                24 hour Electricity (Y/N)?/ Source of Energy
                        National Grid
                        Generator
                        Solar Panel
                        Others

                        24 hour Running Water (Y/N)?/ Source of Water
                        Piped Water In to Health Facility
                        Piped Water to Yard/Plot

                        Public Tap or Standpipe
                        Tube Well or Borehole
                        Protected Dug Well
                        Protected Spring
                        Rainwater Harvesting
                        Others, Specify

                        Refrigeration Or Cold Storage (Y/N)?
                            Vodacom
                            Mpesa Available
                        Can Ths Facility Do C-Section?
                            If Yes, Please Use The Check List:
                            Operating Table?
                            Operating Light?
                            Suction Machine?
                            Foot Operated Suction Machine?
                            Pulse Oximeter?
                            Caesarean Set?
                            Patient Monitor?
                            Diathermy Machine?
                            Trolley?
                                Stretcher?
                                    Ultrasound Machine?
                                    Autoclave?
                                        Resuscitator Bags - Adult?
                                        Resuscitator Bags - Child?
                                        Anaesthesia Machine?
                                        Anaethesia Stool?
                            */


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

                        /*
                        Family Planning
                        Has Special Room For Family Planning?
                            Family Planning Available
                        RCH
                        Weighing Machine
                        Vaccination Availability/ Cold Chain
                        SP For Mothers
                        PMTCT Services
                        Testing For Syphilis
                        HB Monitoring
                        Blood Pressure Measuring
                        Community Linkage
                        Counseling Services
                        Fetalscope/ Dopetone
                        IPT for Malaria
                            UTI screening
                        UTI treatment
                        Iron and Folate Supplement
                        */

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
                                /*
                                 MISSING (MARKED WITH YELLOW)
                                 Can this facility do Cesarian-section?
                                 Operating table?
                                 Operating light?
                                 Suction machine?
                                 Foot operated suction machine?
                                 Pulse oximeter?
                                 Caesarean set?
                                 Patient monitor?
                                 Diathermy machine?
                                 Trolley?
                                 Stretcher?
                                 Ultrasound machine?
                                 Autoclave?
                                 Resuscitator bags - adult?
                                 Resuscitator bags - child?
                                 ANesthesia machine?
                                 ANethesia stool?
                                */
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
            }

            //Filter data by existing keys
            //_.pick(data, tabDataKeys)

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
            return tab.indicators.length;
        });

        if (typeof self.drugsAvailability[facilityName] !== 'undefined') {
            profileData.push({
                tabName: 'Drugs list',
                drugsList: self.drugsAvailability[facilityName]
            });
        }

        $('#profile').html('<h2>' + facilityName + '</h2>');

        $('#profile').append($('#profile-template').tmpl({
            profileData: profileData
        }));
        var tabHeight = $(window).height() - 200;
        $('#profile').find('.drug-list').css({
            height: tabHeight
        });

        //$(window).on('resize', function() {
        //    var newHeight = $(this).height();
        //    $('.tabpanel').css({
        //        height: ''
        //    });
        //});

        //window.profileData = profileData;
        self.switchView('profile');
    };

    app.prototype.onBeforeDraw = function (event, callback, id) {
        var self = this;
        if (_.isUndefined(this.allData[event.data.content['Facility Name']])) {
            this.allData[event.data.content['Facility Name']] = event.data.content;
        }

        var search = this.settings['search'];

        if (search != '' && event.data.content['Facility Name'].toLowerCase().indexOf(search) < 0) {
            event.data.visible = false;
        }

        if (this.settings.bounds !== null && event.data.visible) {
            event.data.visible = event.data.visible && this.settings.bounds.contains(event.data.position);
        }

        if (this.settings.drugSearch != null) {

            if (_.isUndefined(this.drugsAvailability[event.data.content['Facility Name']])) {
                event.data.visible = false;
            } else {
                var drugsInLocation = this.drugsAvailability[event.data.content['Facility Name']];

                if (self.settings.drugSearch != 'clinic') {
                    var requestedDrug = _.find(drugsInLocation, function(drug) {
                        return drug[5].toLowerCase() === self.settings.drugSearch;
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
                $('#table').find('tbody').append($('#tmpl-table-row').tmpl({data: data}));
            }

            var copy = $.extend({}, data);
            for (var key in copy) {
                if ($.isNumeric(copy[key]))
                    copy[key] = parseFloat(copy[key]).toLocaleString();
            };
            this.count++;
        }

        callback(event.data);
    };

    app.prototype.bindEvents = function () {
        var self = this;

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

            var drugSearch = $('#drug-select').val().toLowerCase();
            if (drugSearch !== 'Clinic') {
                self.settings.drugSearch = drugSearch;
                self.reloadLayers();
            }
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

            //val('Put proper distance here').on('keyup', $.proxy(self.onRadiusChange, self));

            //$('.')

            //var $radiusSpinner = $('#radius-spinner');
            //
            //// convert radius from meters to kilometers
            //$radiusSpinner.val((circle.getRadius() / 1000).toFixed(2));
            //
            //// convert radius from kilometers to meters
            //$radiusSpinner.on('change', function() {
            //    circle.setRadius($radiusSpinner.val() * 1000)
            //});

            //google.maps.event.addListener(circle, 'center_changed', function() {
            //    //refesh data
            //    self.radiusToolWindow.setPosition(circle.getCenter());
            //});

            //google.maps.event.addListener(circle, 'radius_changed', function() {
            //    //this.refreshData();
            //    if ($radiusSpinner.val() * 1 != circle.getRadius() / 1000) {
            //        $radiusSpinner.val((circle.getRadius() / 1000).toFixed(2));
            //    }
            //});

        });

        $radiusButton.on('click', function(e) {

            //if (drawingManager.getDrawingMode() == null) {
            if (!$radiusButton.hasClass('btn-warning')) {
                $radiusButton.addClass('btn-warning');
                drawingManager.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
            } else {
                $radiusButton.removeClass('btn-warning');

                self.settings.bounds = null;
                self.settings.drugSearch = null;

                self.reloadLayers();
            }
        });
    };

    google.maps.event.addDomListener(window, 'load', function () {
        new app().run();
    });

})();