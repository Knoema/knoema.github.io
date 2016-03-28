/// <reference path="typings/jquery.d.ts"/>
/// <reference path="typings/google.maps.d.ts"/>
var Infrastructure;
(function (Infrastructure) {
    var TypeNameToId = {
        'Airports': 1000000,
        'Diesel Power Plant': 1000010,
        'Factory Chemical': 1000020,
        'Hospital': 1000030,
        'Hotel': 1000040,
        'Hydro Power Sources': 1000050,
        'Industrial Zone': 1000060,
        'Ports': 1000070,
        'Refinery': 1000080,
        'School': 1000090,
        'Solar Power Stations​': 1000100,
        'Thermal Power Stations​': 1000110,
    };

    var TypeNameToIcon = {
        'Airports': 'airport',
        'Diesel Power Plant': 'powerstation',
        'Factory Chemical': 'factory',
        'Hospital': 'hospital',
        'Hotel': 'hotel',
        'Hydro Power Sources': 'powerstation',
        'Industrial Zone': 'factory',
        'Ports': 'port',
        'Refinery': 'oil',
        'School': 'school',
        'Thermal Power Stations​': 'powerstation',
        'Solar Power Stations​': 'powerstation',
    };

    var TypeNameToPassportImage = {
        'Airports': 'airport',
        'Diesel Power Plant': 'powerplant',
        'Factory Chemical': 'factory',
        'Hospital': 'hospital',
        'Hotel': 'hotel',
        'Hydro Power Sources': 'powerplant',
        'Industrial Zone': 'factory',
        'Ports': 'port',
        'Refinery': 'oil',
        'School': 'school',
        'Thermal Power Stations​': 'powerplant',
        'Solar Power Stations​': 'powerplant',
    };

    var RegionNameToColor = {
        'Dakar': {
            'population': '#1a9850',
            'accessToElectricity': '#1a9850',
            'costOfElectricity': '#fee08b',
            'electricityConsumption': '#1a9850'
        },
        'Diourbel': {
            'population': '#1a9850',
            'accessToElectricity': '#fee08b',
            'costOfElectricity': '#91cf60',
            'electricityConsumption': '#1a9850'
        },
        'Fatick': {
            'population': '#91cf60',
            'accessToElectricity': '#fc8d59',
            'costOfElectricity': '#fc8d59',
            'electricityConsumption': '#d9ef8b'
        },
        'Kaffrine': {
            'population': '#d9ef8b',
            'accessToElectricity': '#d9ef8b',
            'costOfElectricity': '#91cf60',
            'electricityConsumption': '#fee08b'
        },
        'Kaolack': {
            'population': '#91cf60',
            'accessToElectricity': '#d73027',
            'costOfElectricity': '#91cf60',
            'electricityConsumption': '#91cf60'
        },
        'Kédougou': {
            'population': '#d73027',
            'accessToElectricity': '#d9ef8b',
            'costOfElectricity': '#d9ef8b',
            'electricityConsumption': '#d73027'
        },
        'Kolda': {
            'population': '#fee08b',
            'accessToElectricity': '#fc8d59',
            'costOfElectricity': '#d73027',
            'electricityConsumption': '#fee08b'
        },
        'Louga': {
            'population': '#fc8d59',
            'accessToElectricity': '#1a9850',
            'costOfElectricity': '#fee08b',
            'electricityConsumption': '#91cf60'
        },
        'Matam': {
            'population': '#fc8d59',
            'accessToElectricity': '#91cf60',
            'costOfElectricity': '#d73027',
            'electricityConsumption': '#fc8d59'
        },
        'Saint-Louis': {
            'population': '#fee08b',
            'accessToElectricity': '#91cf60',
            'costOfElectricity': '#1a9850',
            'electricityConsumption': '#91cf60'
        },
        'Sédhiou': {
            'population': '#d9ef8b',
            'accessToElectricity': '#1a9850',
            'costOfElectricity': '#d9ef8b',
            'electricityConsumption': '#d73027'
        },
        'Tambacounda': {
            'population': '#d73027',
            'accessToElectricity': '#fee08b',
            'costOfElectricity': '#fc8d59',
            'electricityConsumption': '#d9ef8b'
        },
        'Thiès': {
            'population': '#1a9850',
            'accessToElectricity': '#91cf60',
            'costOfElectricity': '#fee08b',
            'electricityConsumption': '#1a9850'
        },
        'Ziguinchor': {
            'population': '#91cf60',
            'accessToElectricity': '#d73027',
            'costOfElectricity': '#1a9850',
            'electricityConsumption': '#fc8d59'
        }
    };

    var Application = (function () {
        function Application() {
        }
        Application.prototype.run = function () {
            var _this = this;
            this.markers = [];
            this.infoWindow = new google.maps.InfoWindow();

            // Country overview map
            this.map = new google.maps.Map(document.getElementById('map-canvas'), {
                center: { lat: 14.5067, lng: -14.4167 },
                zoom: 8
            });

            this.initAreaProfile();

            $('#investmentNeedsLink').on('click', function(event) {
                event.preventDefault();
                $('#investmentNeedsPopup').show();
                return false;
            });

            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                // Init Energy profile tab on demand
                var $tab = $($(e.target).attr('href'));
                switch ($tab.attr('id')) {
                    /*case 'energyProfileTab':
                        if ($tab.find('iframe').length <= 0) {
                            var html = '<iframe src="http://knoema.com/resource/embed/rowwjbg" scrolling="yes" frameborder="0" style="height:100%; width:100%;"></iframe>';
                            $tab.append(html);
                        }
                    break;*/
                    
                    case 'modelingTab':
                        if ($tab.find('.highcharts-container').length <= 0) {
                            var chart1 = _this.buildModelingChart('column', '#accessToElectricityChart', 'Access to electricity', 'percent', [
                                ChartColors.Red, 
                                ChartColors.Blue, 
                                ChartColors.Green
                            ], {enabled: true}, 30, 100, 10);
                            var chart2 = _this.buildModelingChart('column', '#energyBalanceChart', 'Energy balance', 'MWt/h', [ChartColors.Green]);
                            var chart3 = _this.buildModelingChart('line', '#reliabilityChart', 'Reliability (outages)', 'minutes', [
                                ChartColors.Red, 
                                ChartColors.Blue, 
                                ChartColors.Green,
                                ChartColors.Pink,
                                ChartColors.Orange
                            ], {enabled: true});
                            var chart4 = _this.buildModelingChart('area', '#budgetSubsidiesChart', 'Budget subsidies', 'billion USD', [ChartColors.Blue]);

                            var $form = $('#modelingFilter').on('change', function() {
                                var params = $form.serializeArray();
                                var p = $form.find('[name="Population"]').val();
                                var i = $form.find('[name="Renewable"]').val();
                                var b = $form.find('[name="Expenditures"]').val();
                                var o = $form.find('[name="OilPrices"]').val();
                                var y;

                                // Access to electricity (0.3 - 1.0 range)
                                y = 5 * p + 17.5 * i + 0.29 * b + 0.0015 * o + 0.33;
                                chart1.series[0].update({ name: 'Schools', data: [y * 4.01, y * 4.12, y * 4.23, y * 4.39, y * 4.61] }, true);
                                chart1.series[1].update({ name: 'Hospitals', data: [y * 4.97, y * 5.05, y * 5.12, y * 5.24, y * 5.30] }, true);
                                chart1.series[2].update({ name: 'Households', data: [y * 3.00, y * 3.1, y * 3.19, y * 3.41, y * 3.53] }, true);

                                // Energy gap (-1 million - 1.48 million) Sergey - note this is the same 1.48 million as on the investment page
                                y = 1.77 * p + 62 * i + 0.1 * b - 0.005 * o - 0.9;
                                chart2.series[0].update({ name: 'Energy gap', data: [y * 51.01, y * 62.00, y * 68.00, y * 78.00, y * 91.00] }, true);

                                // Minutes of Outages (totally made up: 27,500 - 66,000)
                                y = 30000 * p - 875000 * i - 1450 * b + 95 * o + 45000;
                                chart3.series[0].update({ name: 'Schools', data: [y * 0.0005, y * 0.00049, y * 0.00047, y * 0.00042, y * 0.00038] }, true);
                                chart3.series[1].update({ name: 'Hospitals', data: [y * 0.00045, y * 0.00043, y * 0.00042, y * 0.00038, y * 0.00036] }, true);
                                chart3.series[2].update({ name: 'Households', data: [y * 0.006, y * 0.0059, y * 0.0057, y * 0.0051, y * 0.0044] }, true);
                                chart3.series[3].update({ name: 'Government buildings', data: [y * 0.0004, y * 0.00038, y * 0.00036, y * 0.00031, y * 0.00029] }, true);
                                chart3.series[4].update({ name: 'Industry objects', data: [y * 0.002, y * 0.0019, y * 0.0015, y * 0.0009, y * 0.0006] }, true);

                                //Budget subsidies ($0-$500million)
                                y = 3570 * p + 12500 * i + 20 * b - 1.13 * o + 23;
                                chart4.series[0].update({ name: 'Budget subsidies', data: [y * 40, y * 35, y * 33.5, y * 32.9, y * 29.8] }, true);
                            });
                            $form.trigger('change');
                        }
                    break;
                }
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

            $('.slider').each(function() {
                var $slider = $(this);
                var $spinner = $($slider.data('spinner'));
                var $form = $slider.closest('form');
                var min = $slider.attr('min') * 1;
                var max = $slider.attr('max') * 1;
                var step = $slider.attr('step') * 1;
                var value = $slider.attr('value') * 1;
                
                $slider
                    .append('<div class="min">' + min + '</div>')
                    .append('<div class="max">' + max + '</div>')
                    .slider({
                        range: "min",
                        min: min,
                        max: max,
                        step: step,
                        value: value,
                        slide: function(event, ui) {
                            $spinner.val(ui.value);
                            $form.trigger('change');
                        }
                    });

                $spinner
                    .attr({ min: min, max: max, step: step, value: value })
                    .on('change', function() {
                        $slider.slider('value', $spinner.val());
                    });
            });

            function filterByStatus() {
                if (_this.markers) {
                    /*var allStatuses = $overviewFilter.find('[name="Status"]').map(function() {
                        return $(this).val();
                    }).toArray();*/

                    var checkedStatuses = $overviewFilter.find('[name="Status"]:checked').map(function() {
                        return $(this).val();
                    }).toArray();
                
                    _this.markers.forEach(function(marker) {
                        var statusIsSwitchedOn = checkedStatuses.indexOf(marker.get('Status')) >= 0;
                        //var knownStatus = allStatuses.indexOf(marker.get('Status')) >= 0;
                        if (statusIsSwitchedOn /*|| !knownStatus && checkedStatuses.indexOf('Under Construction') >= 0*/) {
                            marker.setMap(_this.map);
                        } else {
                            marker.setMap(null);
                        }
                    });
                }
            }

            // Request dataset and show on the map
            var $overviewFilter = $('#overviewFilter')
                .on('change', function(event) {
                    clearTimeout(_this.filterTimeout);
                    
                    var objectTypeIds = [];
                    var params = $overviewFilter.serializeArray();
                    for (var i = 0; i < params.length; i++) {
                        var param = params[i];
                        switch (param.name) {
                            case 'Layer':
                                if (!_this.hasGeoJson) {
                                    _this.hasGeoJson = true;
                                    _this.map.data.loadGeoJson('senegal.json');
                                }
                                _this.map.data.revertStyle();
                                _this.map.data.setStyle(function(feature) {
                                    if (param.value === 'none') {
                                        $("div#legend").hide();
                                        return { visible: false };
                                    } else {
                                        $("div#legend").show();
                                        return { 
                                            fillColor: RegionNameToColor[feature.getProperty('Name')][param.value],
                                            strokeWeight: 1,
                                            visible: true
                                        };
                                    }
                                });
                            break;

                            case 'PowerPlants':
                                if (param.value === '1') {
                                    var $powerPlantsSelect = $overviewFilter.find('[name="PowerPlantsSelect"]');
                                    var powerPlants = $powerPlantsSelect.selectpicker('val');

                                    if (!Array.isArray(powerPlants)) {
                                        powerPlants = $powerPlantsSelect
                                            .find('option[value]')
                                            .map(function() { return $(this).val() })
                                            .toArray();
                                    }

                                    powerPlants.forEach(function(typeName) {
                                        typeName = typeName.trim();
                                        if (typeName in TypeNameToId) {
                                            objectTypeIds.push(TypeNameToId[typeName]);
                                        }
                                    });
                                }
                            break;

                            case 'Consumers':
                                if (typeof param.value === 'string' && param.value.length > 0) {
                                    param.value.split(',').forEach(function(typeName) {
                                        typeName = typeName.trim();
                                        if (typeName in TypeNameToId) {
                                            objectTypeIds.push(TypeNameToId[typeName]);
                                        }
                                    });
                                }
                            break;
                        }
                    }
                    
                    if (objectTypeIds.length > 0) {
                        _this.filterTimeout = setTimeout(function() 
                        {
                            $overviewFilter.find('input').attr('disabled', 'disabled');
                            
                            _this.getObjects(objectTypeIds).done(function (data) 
                            {
                                _this.addObjectsToMap(_this.map, data);
                                
                                filterByStatus();

                                $overviewFilter.find('input').removeAttr('disabled');
                                
                                if ($(document.body).hasClass('loading')) {
                                    $(document.body).removeClass('loading');
                                }
                            });
                        }, 800);
                    } else {
                        _this.clearMarkers();
                        if ($(document.body).hasClass('loading')) {
                            $(document.body).removeClass('loading');
                        }
                    }
                });
            $overviewFilter.trigger('change');

            $(document).on('click', '.passport__close', function(event) {
                $(event.target).closest('.passport-popup').hide();
            });
        };

        var ChartColors = {
            Red: '#b00e0e',
            Blue: '#00bff3',
            Green: '#3cb00e',
            Pink: '#c724c9',
            Orange: '#f4950c',
            Turquoise: '#43c8ba'
        };

        Application.prototype.initAreaProfile = function () {
        	var $radiusButton = $('#radius-button');
        	if ($radiusButton.length != 1) return;

        	// SIX-9
        	var drawingManager = new google.maps.drawing.DrawingManager({
        		map: this.map,
        		drawingMode: null,
        		drawingControl: false,
        		circleOptions: {
        			fillColor: 'black',
        			fillOpacity: 0.2,
        			strokeWeight: 4,
        			strokeColor: 'orange',
        			clickable: false,
        			editable: true,
        			zIndex: 1
        		}
        	});

        	var self = this;

        	if (!this.radiusToolWindow) {
        		this.radiusToolWindow = new google.maps.InfoWindow();
        		var template = doT.template($('#area-profile-template').html());
        		this.radiusToolWindow.setContent(template({
        			region: "Thies",
        			village: "Sine Moussa Abdou",
        			population: 900,
        			incidence: "43 percent<br>(compared to 48% for Thies)",
        			access: "70 percent of population",
        			consumption: "3 kWh/day",
        			cost: "CFA 840/kWh (US$ 1.4/kWh)",
        			grid: "no",
        			source: "micro grid with hybrid power plant<br>(solar 5 kW, wind 5 kW, and diesel 10 kW)",
        			hospital: "Poste de sante de Ngakham",
        			schools: 3,
        			investmentProject: {
        				name: "Construct Transmission Lines",
        				location: "Thies",
						endDate: "Jan 1, 2017"
        			},
        			investor: "Export-Import Bank of China, Government Agency;<br>China Machinery Engineering Corporation (CMEC)"
        		}));
        	}

        	google.maps.event.addListener(drawingManager, 'circlecomplete', function(circle) {
        		drawingManager.setDrawingMode(null);
        		self.radiusToolCircle = circle;
        		// refresh popup

        		self.radiusToolWindow.setPosition(circle.getCenter());
        		self.radiusToolWindow.open(this.map);
				
        		google.maps.event.addListener(circle, 'center_changed', function () {
					// refresh popup
        			self.radiusToolWindow.setPosition(circle.getCenter());
        		});

    			google.maps.event.addListener(circle, 'radius_changed', function() {
    				// refresh popup
				});
			});
			
			$radiusButton.on('click', function() {
				$radiusButton.toggleClass('active');
				if ($radiusButton.hasClass('active')) {
					drawingManager.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
				} else {
					drawingManager.setDrawingMode(null);
					if (self.radiusToolCircle) {
						self.radiusToolCircle.setMap(null);
						self.radiusToolCircle = null;
						self.radiusToolWindow.close();
						// refresh popup
					}
				}
			});
        };

        Application.prototype.buildModelingChart = function(type, elementSelector, title, subtitle, colors, legend, yMin, yMax, tickInterval) {
            var categories = [2016, 2017, 2018, 2019, 2020];
            var series = [];
            for (var i = 0; i < colors.length; i++) {
                series.push({ data: [0, 0, 0, 0, 0], color: colors[i] });
            }
            return this.buildChart(elementSelector, type, title, subtitle, categories, series, legend, yMin, yMax, tickInterval);
        };

        Application.prototype.buildChart = function(elementSelector, type, title, subtitle, categories, series, legend, yMin, yMax, tickInterval) {
            $(elementSelector).highcharts({
                chart: { type: type },
                title: { text: title, align: 'left', x: 40, margin: 30, style: { fontFamily: '"Roboto", serif', fontSize: '21px', fontWeight: 'bold' } },
                subtitle: { text: subtitle, align: 'left', x: 40, y: 32, style: { fontFamily: '"Roboto", serif', fontSize: '14px', color: 'grey' } },
                xAxis: { categories: categories, tickWidth: 0, labels: { style: { fontFamily: '"Roboto", serif', fontSize: '12px' } } },
                yAxis: { min: yMin, max: yMax, title: null, gridLineWidth: 0, lineWidth: 1, tickInterval: tickInterval,
                    labels: { formatter: function() { return this.value; }, style: { fontFamily: '"Roboto", serif', fontSize: '12px' } }
                },
                tooltip: { 
                    pointFormatter: function() { 
                        return '<span style="color:' + this.color + '">\u25CF</span> ' + this.series.name + ': <b>' + (Math.round(this.y * 10) / 10) + '</b>';
                    }
                },
                plotOptions: { column: { pointPadding: 0.1, borderWidth: 0 } },
                series: series,
                legend: legend || {enabled: false},
                credits: {enabled: false}
            });

            return $(elementSelector).highcharts();
        };

        Application.prototype.clearMarkers = function () {
            if (Array.isArray(this.markers)) {
                this.markers.forEach(function(marker) {
                    marker.setMap(null);
                });
                this.markers = null;
            }
        };

        Application.prototype.showPassport = function(name, typeName) {
            var typeToDetails = {
                'Refinery': [{
                    title: 'Société Africaine de Raffinage (SAR)',
                    fields: [
                        {
                            'Address and phone number': 'Route de Rufisque',
                            'Dakar / Sénégal, Tél.': '33 839 84 39',
                            'Manager name': 'M. Oumar Diop'
                        }, {
                            'Number of workers': 256,
                            'Petroleum products': 'diesel, fuel oil, aromatics, jet fuel, fuel oil, kerosene, and butane gas',
                            'Feedstock supply': '100%',
                            'Nigerian crude oils': 'Bonny Light, Qua Iboe, Escaravos',
                            'Annual income, bln. USD': '$0.8',
                            'Installed capacity': '25,030 b/d'
                        }, {
                            'Public or private': 'mixed',
                            'Name of Owner/company': 'Petrosen (46%), Total SA (20%), Saudi Binladin Group (34%)',
                            'Built on date': 1963,
                            'Name of company that built it': 'unavailable'
                        }
                    ]
                }],
                'School': [{
                    title: 'Ecole Primaire Li',
                    location: [16.6500032, -14.8070271],
                    zoom: 13,
                    fields: [
                        {
                            'Address and phone number': 'Podor, Senegal'
                        }, {
                            'Number of teachers': 3,
                            'Public or private': 'Primary school',
                            'Net enrollment': 83
                        }, {
                            'Built on date': 1995,
                            'Construction Company': 'local - unknown'
                        }
                    ]
                    // Line Chart “Electricity consumption”, two series: power demand, actual electricity consumption, for last 12 months, kWt/h: 15kWh generation; only 5kWh consumption'
                    // Mixed chart “Outages”: 
                    //   left axes, one line series, last 12 months, Number of outages for each; 
                    //   right axes, one bar series, Average outage time, min; average of 1 outages per month for 10 minutes each
                }, {
                    title: 'School Les Amis Du Savoir',
                    location: [14.5685013, -17.3733156],
                    zoom: 13,
                    fields: [
                        {
                            'Address and phone number': 'Thiaroye sur mer, Dakar, senegal',
                            'School director name': 'Talla Ndoye'
                        },
                        {
                            'Capacity, number of students': 300,
                            'Net Enrollment': 135,
                            'Number of teachers': 6,
                            'Budget': 'US$ 40,000/year',
                            'Public or private': 'private',
                            'Type': 'secondary',
                        },
                        {
                            'Built on date': 1972,
                            'Construction Company': 'local - unknown',
                        }
                    ]
                    // Line Chart “Electricity consumption”, two series: power demand, actual electricity consumption, for last 12 months, kWt/h: grid access from traditional thermal power; 2 kWh/day
                    // Mixed chart “Outages”: left axes, one line series, last 12 months, Number of outages for each; right axes, one bar series, Average outage time, min; average of 12 outages per month for 30 minutes each
                }, {
                    title: 'Elementary School de Refane',
                    location: [14.7867968, -16.6143751],
                    zoom: 13,
                    fields: [
                        {
                            'Geo coord': '14.7867968, -16.6143751',
                            'Address and phone number': 'Unnamed Road, Bambey, Senegal',
                            'School director name': 'Ndeye Diouf',
                        },
                        {
                            'Power source': '8kw/hr diesel generator',
                            'Type': 'Primary school',
                            'Number of students': 50,
                            'Number of teachers': 2,
                            'Public or private': 'public',
                            'Budget': 'unknown'
                        },
                        {
                            'Built on date': 1992,
                            'Construction company': 'local – unknown'
                        }
                        // Only runs average 3 hrs/day April – August only ; for outages, show 2-5 day periods intermittently that it is not run (because the imported diesel is too expensive or not available)
                    ]
                }],
                'Hospital': [{
                    title: 'Dispensaire du village d’Angam-Goly',
                    location: [16.004277, -13.690682],
                    zoom: 13,
                    fields: [
                        {
                            'Address and phone number': 'Village d’Agnam-Goly, N2, 04, Senegal',
                            'Hospital manager name': 'Henri Awadi',
                        },
                        {
                            'Capacity, number of beds': '60 beds',
                            'Actual number of patients': 60,
                            'Number of doctors and nurses': 'single part-time physician; three full-time nurses',
                            'Public or private': 'public',
                        },
                        {
                            'Built on date': 2012,
                            'Name of company that built it': 'Chinese Overseas Engineering Group Co., Ltd.',
                            'Primary electricity source': 'Candles'
                        }
                    ]
                    //Line Chart “Electricity consumption”, two series: power demand, actual electricity consumption, for last 12 months, kWt/h; daily load in KWh/day: 10 kWh/day
                    //Mixed chart “Outages”: left axes, one line series, last 12 months, Number of outages for each; right axes, one bar series, Average outage time, min (match to Misha's stats range from the energy profile)
                },{
                    title: 'Dispensaire du village d’Angam-Goly',
                    location: [16.004277, -13.690682],
                    zoom: 13,
                    fields: [
                        {
                            'Address and phone number': 'Village d’Agnam-Goly, N2, 04, Senegal',
                            'Hospital manager name': 'Henri Awadi',
                        },
                        {
                            'Capacity, number of beds': '60 beds',
                            'Actual number of patients': 60,
                            'Number of doctors and nurses': 'single part-time physician; three full-time nurses',
                            'Public or private': 'public',
                        },
                        {
                            'Built on date': 2012,
                            'Name of company that built it': 'Chinese Overseas Engineering Group Co., Ltd.',
                            'Primary electricity source': 'National power grid'
                        }
                    ]
                    //Line Chart “Electricity consumption”, two series: power demand, actual electricity consumption, for last 12 months, kWt/h; daily load in KWh/day: 10 kWh/day
                    //Mixed chart “Outages”: left axes, one line series, last 12 months, Number of outages for each; right axes, one bar series, Average outage time, min (match to Misha's stats range from the energy profile)
                }, {
                    title: 'Hopital Principal de Dakar',
                    location: [14.6627626,-17.4356975],
                    zoom: 13,
                    fields: [
                        {
                            'Address and phone number': '1, Avenue Nelson Mandela, Dakar, +221 839 50 50',
                            'Hospital manager name': 'General Boubacar WADE',
                        },
                        {
                            'Capacity, number of beds': '304 beds',
                            'Actual number of patients': 195,
                            'Number of staff': 1044,
                            'Public or private': 'public, military hospital',
                        },
                        {
                            'Built on date': 1884,
                            'Name of company that built it': 'Unknown',
                            'Primary electricity source': 'Diesel generator'
                        }
                    ]
                    // Line Chart “Electricity consumption”, two series: power demand, actual electricity consumption, for last 12 months, kWt/h; daily load in KWh/day: 100 kWh/day
                    // Mixed chart “Outages”: left axes, one line series, last 12 months, Number of outages for each; right axes, one bar series, Average outage time, min (match to Misha's stats range from the energy profile)
                }],
                'Hydro Power Sources': [{
                    title: 'Manantali hydroelectric power station (Mali)',
                    location: [13.195555555555556, -10.428888888888888],
                    zoom: 13,
                    fields: [
                        {},
                        {
                            '​Fuel type': 'hydro​',
                            'Installed ​total ​capacity': '200 MW',
                            'Senegal installed capacity (Share of total)': '66 MW',
                            'Senegal operational capacity': '60 MW',
                            'Outages': '0 (no serious service interruption)',
                            'Technical losses in transmission lines': '9% (or, 5.4 MW/year)'
                        },
                        {
                            'Built by': 'AECOM',
                            'Commission Date': 2001,
                        }
                    ]
                }, {
                    title: 'Sendou Power Station',
                    location: [14.6939, -17.2336],
                    zoom: 13,
                    fields: [
                        {
                            'Address and phone number': 'TBD',
                            'Manager name': 'TBD',
                            'Owner (could be government, mixed, or private ownership)': 'Senelec, a consortium of Nykomb Synergetics Development AB, Vattenfall Power Consult, Maytas, BHEL, BMCE Bank, Standard Bank of South Africa, and Comptoir Balland-Brugneaux.',
                        },
                        {
                            'Maximum energy supply, MWt/h': '125 MW',
                            'Number of workers': 'TBD',
                            'Type': 'Thermal (Coal)',
                        },
                        {
                            'Built on date': 'est 2016',
                            'Name of company that built it': 'Nykomb Synergetics Development AB Group'
                        }
                    ]
                    // For existing: Line Chart “Power supply”, two series: capacity (constant), actual electricity production, for last 12 months, MWt/h: Not applicable
                    // For planned: Planned capacity, MWt/h (assumes 92% operating rate) = 10007.4 GWh or 1mil KWh (since 1 GW = 1000 MW and 1 year = 8760 hours)
                }]
            };
            
            if (typeName in typeToDetails) {
                var detailsList = typeToDetails[typeName];
                var details = detailsList[Math.floor(Math.random() * detailsList.length)];
                var $passportPopup = $('#passportPopup');
                var $columns = $passportPopup.find('.passport__fields__column').empty();

                if (typeName in TypeNameToPassportImage) {
                    var $image = $passportPopup.find('.passport__image > img');
                    $image.attr('src', './Images/Passport/' + TypeNameToPassportImage[typeName] + '_' + Math.round(1 + Math.random()) + '.jpg').show();
                } else {
                    $image.hide();
                }

                $passportPopup.find('.passport__title').html(name);

                for (var i = 0; i < 3; i++) {
                    for (var key in details.fields[i]) {
                        $($columns[i]).append('<label class="passport__field__title">' + key + ':</label><p class="passport__field__value">' + details.fields[i][key] + '</p>');
                    }
                }
                
                $passportPopup.show();

                // Passport map
                if (!this.passportMap) {
                    this.passportMap = new google.maps.Map(
                        $('#passportPopup .passport__map')[0], 
                        { disableDefaultUI: true }
                    );
                }

                if (this.passportMarker) {
                    this.passportMarker.setMap(null);
                }

                if (details.location) {
                    var latLng = { lat: details.location[0], lng: details.location[1] };
                    this.passportMap.setCenter(latLng);
                    this.passportMap.setZoom(details.zoom);

                    var marker = this.passportMarker = new google.maps.Marker();
                    marker.setPosition(latLng);
                    if (typeName in TypeNameToIcon) {
                        marker.setIcon('Images/icons_' + TypeNameToIcon[typeName] + '.png?v=1');
                    }
                    marker.setMap(this.passportMap);
                } else {
                    this.passportMap.setCenter({ lat: 11.0310179, lng: 18.9726628 });
                    this.passportMap.setZoom(3);
                }

                //this.buildPassportCharts();
            }
        };

        Application.prototype.buildPassportCharts = function() {
            var categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var series = [
                { color: '#219FC7', data: [9000, 6500, 5000, 4000, 2500, 3000, 3500, 4200, 4000, 3800, 6000, 7000] },
                { color: '#317850', data: [7500, 5000, 4500, 3000, 3600, 3800, 4000, 4500, 3600, 3400, 4000, 5000] }
            ];
            var legend = {enabled: false};
            var plotOptions = {line: { marker: { enabled: false } } };
            this.buildChart('.passport__chart_left', 'line', 'Electricity consumption', 'kWt/h', categories, series, legend, plotOptions);
        }

        Application.prototype.addObjectsToMap = function (map, data) {
            var self = this;
            var rowCount = Math.floor(data.data.length / data.columns.length);
            var markers = [];
            var heatmapArray = [];

            this.clearMarkers();

            // hack - need to passe data into [data-target="more-data"] click handler
            window.AppMapData = data;

            var statusNamesToIcon = {
                'Operational': '', 
                'Planned': '_planned', 
                'Under Construction': '_underconstruction'
            };

            var visibleColumnCount = data.columns.length < 15 ? data.columns.length : 15;
            for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                var rowOffset = rowIndex * data.columns.length;
                /*for (var colIndex = 0; colIndex < visibleColumnCount; colIndex++) {
                    var dataIndex = rowOffset + colIndex;
                    var value = (data.columns[colIndex].type === 'Date') ? data.data[dataIndex].value : data.data[dataIndex];
                }*/

                var lat = data.data[rowOffset + 3] * 1;
                var lng = data.data[rowOffset + 4] * 1;
                if (!isFinite(lat) || !isFinite(lng) || (lat === 0 && lng === 0)) {
                    continue;
                }

                var latLng = new google.maps.LatLng(lat, lng);
                heatmapArray.push(latLng);

                var marker = new google.maps.Marker();
                marker.setPosition(latLng);

                var status = data.data[rowOffset + 5];
                if (!(status in statusNamesToIcon)) {
                    status = 'Under Construction';
                }
                marker.set('Status', status);

                var typeName = data.data[rowOffset];
                if (typeName in TypeNameToIcon) {
                    var icon = TypeNameToIcon[typeName];
                    marker.setIcon('Images/icons_' + icon + statusNamesToIcon[status] + '.png?v=1');
                }

                marker.setMap(map);

                google.maps.event.addListener(marker, 'click', this.showPassport.bind(this, data.data[rowOffset + 1], data.data[rowOffset]));

                markers.push(marker);
            }

            // Fit map to markers
            /*if (!this.mapIsFitted) {
                var bounds = new google.maps.LatLngBounds();
                for (var i = 0; i < markers.length; i++) {
                    bounds.extend(markers[i].getPosition());
                }
                map.fitBounds(bounds);
                this.mapIsFitted = true;
            }*/

            this.markers = markers;

            // Init heatmap
            /*this.heatmap = new google.maps.visualization.HeatmapLayer({
                data: heatmapArray,
                radius: 20
            });*/

            // http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/docs/reference.html
            /*this.markerClusterer = new window['MarkerClusterer'](map, markers, {
                ignoreHidden: true,
                styles: [
                    {
                        url: 'Images/hospital-sign-icon-32.png?v=1',
                        width: 32,
                        height: 32,
                        textSize: 18,
                        textColor: '#ffffff'
                    }, {
                        url: 'Images/hospital-sign-icon-48.png?v=1',
                        width: 48,
                        height: 48,
                        textSize: 20,
                        textColor: '#ffffff'
                    }, {
                        url: 'Images/hospital-sign-icon-64.png?v=1',
                        width: 64,
                        height: 64,
                        textSize: 22,
                        textColor: '#ffffff'
                    }]
            });
            this.markerClusterer.fitMapToMarkers();*/
        };

        Application.prototype.getObjects = function (objectTypeIds) {
            var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=pocqwkd';
            var data = {
                "Header":[],
                "Stub":[],
                "Filter":[{
                    "DimensionId":"object-type",
                    "Members":objectTypeIds,
                    "DimensionName":"Object Type",
                    "DatasetId":"pocqwkd",
                    "Order":"0"
                },{
                    "DimensionId":"object-name",
                    "Members":["1000000","1000010","1000020","1000030","1000040","1000050","1000060","1000070","1000080","1000090","1000100","1000110","1000120","1000130","1000140","1000150","1000160","1000170","1000180","1000190","1000200","1000210","1000220","1000230","1000240","1000250","1000260","1000270","1000280","1000290","1000300","1000310","1000320","1000330","1000340","1000350","1000360","1000370","1000380","1000390","1000400","1000410","1000420","1000430","1000440","1000450","1000460","1000470","1000480","1000490","1000500","1000510","1000520","1000530","1000540","1000550","1000560","1000570","1000580","1000590","1000600","1000610","1000620","1000630","1000640","1000650","1000660","1000670","1000680","1000690","1000700","1000710","1000720","1000730","1000740","1000750","1000760","1000770","1000780","1000790","1000800","1000810","1000820","1000830","1000840","1000850","1000860","1000870","1000880","1000890","1000900","1000910","1000920","1000930","1000940","1000950","1000960","1000970","1000980","1000990","1001000","1001010","1001020","1001030","1001040","1001050","1001060","1001070","1001080","1001090","1001100","1001110","1001120","1001130","1001140","1001150","1001160","1001170","1001180","1001190","1001200","1001210","1001220","1001230","1001240","1001250","1001260","1001270","1001280","1001290","1001300","1001310","1001320","1001330","1001340","1001350","1001360","1001370","1001380","1001390","1001400","1001410","1001420","1001430","1001440","1001450","1001460","1001470","1001480","1001490","1001500","1001510","1001520","1001530","1001540","1001550","1001560","1001570","1001580","1001590","1001600","1001610","1001620","1001630","1001640","1001650","1001660","1001670","1001680","1001690","1001700","1001710","1001720","1001730","1001740","1001750","1001760","1001770","1001780","1001790","1001800","1001810","1001820","1001830","1001840","1001850","1001860","1001870","1001880","1001890","1001900","1001910","1001920","1001930","1001940","1001950","1001960","1001970","1001980","1001990","1002000","1002010","1002020","1002030","1002040","1002050","1002060","1002070","1002080","1002090","1002100","1002110","1002120","1002130","1002140","1002150","1002160","1002170","1002180","1002190","1002200","1002210","1002220","1002230","1002240","1002250","1002260","1002270","1002280","1002290","1002300","1002310","1002320","1002330","1002340","1002350","1002360","1002370","1002380","1002390","1002400","1002410","1002420","1002430","1002440","1002450","1002460","1002470","1002480","1002490","1002500","1002510","1002520","1002530","1002540","1002550","1002560","1002570","1002580","1002590","1002600","1002610","1002620","1002630","1002640","1002650","1002660","1002670","1002680","1002690","1002700","1002710","1002720","1002730","1002740","1002750","1002760","1002770","1002780","1002790","1002800","1002810","1002820","1002830","1002840","1002850","1002860","1002870","1002880","1002890","1002900","1002910","1002920","1002930","1002940","1002950","1002960","1002970","1002980","1002990","1003000","1003010","1003020","1003030","1003040","1003050","1003060","1003070","1003080","1003090","1003100","1003110","1003120","1003130","1003140","1003150","1003160","1003170","1003180","1003190","1003200","1003210","1003220","1003230","1003240","1003250","1003260","1003270","1003280","1003290","1003300","1003310","1003320","1003330","1003340","1003350","1003360","1003370","1003380","1003390","1003400","1003410","1003420","1003430","1003440","1003450","1003460","1003470","1003480","1003490","1003500","1003510","1003520","1003530","1003540","1003550","1003560","1003570","1003580","1003590","1003600","1003610","1003620","1003630","1003640","1003650","1003660","1003670","1003680","1003690","1003700","1003710","1003720","1003730","1003740","1003750","1003760","1003770","1003780","1003790","1003800","1003810","1003820","1003830","1003840","1003850","1003860","1003870","1003880","1003890","1003900","1003910","1003920","1003930","1003940","1003950","1003960","1003970","1003980","1003990","1004000","1004010","1004020","1004030","1004040","1004050","1004060","1004070","1004080","1004090","1004100","1004110","1004120","1004130","1004140","1004150","1004160","1004170","1004180","1004190","1004200","1004210","1004220","1004230","1004240","1004250","1004260","1004270","1004280","1004290","1004300","1004310","1004320","1004330","1004340","1004350","1004360","1004370","1004380","1004390","1004400","1004410","1004420","1004430","1004440","1004450","1004460","1004470","1004480","1004490","1004500","1004510","1004520","1004530","1004540","1004550","1004560","1004570","1004580","1004590","1004600","1004610","1004620","1004630","1004640","1004650","1004660","1004670","1004680","1004690","1004700","1004710","1004720","1004730","1004740","1004750","1004760","1004770","1004780","1004790","1004800","1004820","1004830","1004840","1004850","1004860","1004870","1004880","1004890","1004900","1004910","1004920","1004930","1004940","1004950","1004960","1004970","1004980","1004990","1005000","1005010","1005020","1005030","1005040","1005050","1005060","1005070","1005080","1005090","1005100","1005110","1005120","1005130","1005140","1005150","1005160","1005170","1005180","1005190","1005200","1005210","1005220","1005230","1005240","1005250","1005260","1005270","1005280","1005290","1005300","1005310","1005320","1005330","1005340","1005350","1005360","1005370","1005380","1005390","1005400","1005410","1005420","1005430","1005440","1005450","1005460","1005470","1005480","1005490","1005500","1005510","1005520","1005530","1005540","1005550","1005560","1005570","1005580","1005590","1005600","1005610","1005620","1005630","1005640","1005650","1005660","1005670","1005680","1005690","1005700","1005710","1005720","1005730","1005740","1005750","1005760","1005770","1005780","1005790"],
                    "DimensionName":"Object Name",
                    "DatasetId":"pocqwkd",
                    "Order":"1",
                    "isGeo":true
                }],
                "Frequencies":[],
                "Dataset":"pocqwkd",
                "Segments":null,
                "MeasureAggregations":null
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
