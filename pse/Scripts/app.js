/// <reference path="typings/jquery.d.ts"/>
/// <reference path="typings/google.maps.d.ts"/>
var Infrastructure;
(function (Infrastructure) {
    var TypeNameToId = {
    	'Airports': 1000230,
    	'Agriculture': 1000220,
    	'Energy and Mining': 1000260,
    	'Diesel Power Plant': 1000250,
    	'Hydro Power Sources': 1000340,
    	'Solar Power Stations': 1000390,
    	'Thermal Power Stations': 1000400,
    	'Factories and Industrial Parks': 1000270,
    	'Housing': 1000330,
    	'Hotel': 1000320,
    	'Ports': 1000360,
    	'Tourism': 1000410,
    	'Hospital': 1000310,
    	'School': 1000380,
    	'Refinery': 1000370,
    	'Train': 1000420,
    	'Undefined': 1000430
    };

    var PPNameToObjectType = {
    	"100-150 aggregation projects focused on livestock and high value added agriculture sectors": ["Farms"],
    	"3-4 grain development corridors": ["Agriculture"],
    	"3-6 integrated tourist areas": ["Tourism"],
    	"Accelerated development of aquaculture": ["Factories and Industrial Parks"],
    	"Air recovery plan": ["Airports"],
    	"Business park for regional headquarters and bases": ["Factories and Industrial Parks"],
    	"Commercial infrastructure": ["Highway"],
    	"Dakar medical city": ["Hospital"],
    	"Dakar regional reference campus": ["School"],
    	"Integrated industrial hubs": ["Factories and Industrial Parks"],
    	"Integrated logistics hubs": ["Bus stations", "Ports", "Train"],
    	"Iron ore recovery project - Faleme mine": ["Energy and Mining"],
    	"Social housing acceleration program": ["Housing"],
    	"Electrified Villages": ["Undefined"],
    	"Undefined": ["Undefined"]
    };

    var TypeNameToIcon = {
    	'Airports': 'airport',
    	'Agriculture': 'agriculture',
    	'Energy and Mining': 'energy',
    	//'Diesel Power Plant': 'powersubstation',
    	//'Hydro Power Sources': 'powersubstation',
    	//'Solar Power Stations': 'powersubstation',
    	//'Thermal Power Stations': 'powersubstation',
    	'Factories and Industrial Parks': 'factory',
    	'Housing': 'housing',
    	'Hotel': 'hotel',
    	'Ports': 'port',
    	'Tourism': 'tourism',
    	'Hospital': 'hospital',
    	'School': 'school',
    	'Refinery': 'oil',
    	'Train': 'train',

        'Diesel Power Plant': 'powerstation',
        'Factory Chemical': 'factory',
        
        'Hydro Power Sources': 'powerstation',
        'Industrial Zone': 'factory',
        
        'Thermal Power Stations​': 'powerstation',
        'Solar Power Stations': 'powerstation'
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
        'Solar Power Stations': 'powerplant',
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

    var RegionsCenters = {
    	'SN-DK': { lat: 14.745003, lng: -17.377625 },
    	'SN-DB': { lat: 14.792808, lng: -16.257019 },
    	'SN-FK': { lat: 14.225782, lng: -16.386108 },
    	'SN-KE': { lat: 12.851302, lng: -12.214050 },
    	'SN-KA': { lat: 14.308966, lng: -15.130920 },
    	'SN-KL': { lat: 13.938066, lng: -15.847778 },
    	'SN-KD': { lat: 13.070783, lng: -14.459070 },
    	'SN-LG': { lat: 15.468240, lng: -15.485229 },
    	'SN-MT': { lat: 15.182157, lng: -13.562622 },
    	'SN-SE': { lat: 12.947683, lng: -15.608826 },
    	'SN-SL': { lat: 16.311573, lng: -14.878235 },
    	'SN-TC': { lat: 13.877413, lng: -13.224792 },
    	'SN-TH': { lat: 14.824672, lng: -16.767883 },
    	'SN-ZG': { lat: 12.797740, lng: -16.416321 }
    };

    var RegionsZoom = {
    	'SN-DK': 11,
    	'SN-DB': 10,
    	'SN-FK': 10,
    	'SN-KE': 10,
    	'SN-KA': 10,
    	'SN-KL': 10,
    	'SN-KD': 10,
    	'SN-LG': 9,
    	'SN-MT': 9,
    	'SN-SE': 10,
    	'SN-SL': 9,
    	'SN-TC': 9,
    	'SN-TH': 10,
    	'SN-ZG': 10
    };

    var Application = (function () {
        function Application() {
        }
        Application.prototype.run = function () {
            var _this = this;
            this.markers = [];
            this.infoWindow = new google.maps.InfoWindow();
            this.regionData = [];
            this.regionAverageData = {};
            this.senegalData = {};

            $('#ppp-projects').selectpicker({ size: 10 });
            $('#ppp-projects').on('changed.bs.select', function (e) {
				
            	$('#overviewFilter').trigger('change');
            });

            $('#consumers').selectpicker({ size: 10 });
            $('#consumers').on('changed.bs.select', function (e) {

            	$('#overviewFilter').trigger('change');
            });

            $('#regions').on('change', function () {

            	showRegion();
            });

            $('.region-profile-button').on('click', function () {

            	var regionId = $('#regions').val();
            	var regionName = $('#regions option[value=' + regionId + ']').text();

            	if (regionId == -1) {
            		_this.getSenegalData(function () {

            			var template = doT.template($('#senegal-profile').html());
            			$('#senegal-frame-popup .passport__content').html(template({
            				indicatorData: _this.senegalData
            			}));
            			$('#senegal-frame-popup').show();

            			//var template = doT.template($('#senegal-profile').html());
            			//_this.infoWindow.setContent(template({
            			//	indicatorData: _this.senegalData
            			//}));

            			//_this.infoWindow.setPosition({ lat: 13.439713, lng: -13.966370 });
            			//_this.infoWindow.open(_this.map);
            		});
            	}
            	else {
            		_this.getRegionData(regionId, function (data) {
            			
            			var avg = {};
            			for (var i in data) {
            				avg[i] = data[i] < _this.regionAverageData[i] ? "red" : "other";
            			}

            			var template = doT.template($('#region-profile').html());
            			_this.infoWindow.setContent(template({
            				regionName: regionName,
            				indicatorData: data,
							averageData: avg
            			}));

            			_this.infoWindow.setPosition(RegionsCenters[regionId]);
            			_this.infoWindow.open(_this.map);
            			_this.map.setCenter(RegionsCenters[regionId]);
            		});
            	}
            });

            $('#ppp-select-button').on('click', function () {

            	var pp = $('#ppp-projects').val() || [];

            	$('.ppp-item').removeClass('active');
            	for (var i = 0; i < pp.length; i++) {
            		$('.ppp-item[data-value="' + pp[i] + '"]').addClass('active');
            	}
            	$('#ppp-frame-popup').show();
            	$('#ppp-projects').selectpicker('hide');

            	return false;
            });

            // Country overview map
            this.map = new google.maps.Map(document.getElementById('map-canvas'), {
                center: { lat: 14.5067, lng: -14.4167 },
                zoom: 8,
                streetViewControl: false,
                zoomControlOptions: {
                	position: google.maps.ControlPosition.LEFT_TOP
                },
                mapTypeId: google.maps.MapTypeId.HYBRID
            });

            this.initAreaProfile();

            $('#investmentNeedsLink').on('click', function(event) {
                event.preventDefault();
                $('#investmentNeedsPopup').show();
                return false;
            });

            $('a[data-toggle="tab"]').on('click', function () {

            	var href = $(this).attr('href');
            	window.location = './' + href;
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

            function showRegion() {

            	var regionId = $('#regions').val();

            	$('input[name="Layer"]').filter('[value="none"]').trigger('click');
            	$("div#legend").hide();

            	if (regionId == -1) {
            		_this.hasGeoJson = false;

            		_this.map.setCenter({ lat: 14.5067, lng: -14.4167 });
            		_this.map.setZoom(8);
            		if (_this.infoWindow)
            			_this.infoWindow.close();

            		_this.map.data.revertStyle();
            		_this.map.data.setStyle(function (feature) {

            			return { visible: false };
            		});

            		return;
            	}

            	if (!_this.hasGeoJson) {
            		_this.hasGeoJson = true;
            		_this.map.data.loadGeoJson('senegal.json');
            	}
            	_this.map.data.revertStyle();
            	_this.map.data.setStyle(function (feature) {

            		if (feature.getProperty('Id') == regionId)
            			return {
            				fillColor: '#fff',
            				fillOpacity: '0.3',
            				strokeWeight: 1,
            				strokeColor: '#fff',
            				visible: true
            			};
            		else
            			return {
            				visible: false
            			};
            	});
            	_this.map.setCenter(RegionsCenters[regionId]);
            	_this.map.setZoom(RegionsZoom[regionId]);
            };

            function filterByStatus() {
            	if (_this.markers) {

            		var checkedStatuses = $overviewFilter.find('[name="Status"]:checked').map(function() {
            			return $(this).val();
            		}).toArray();
            		var selectedPPName = $('#ppp-projects').val() || [];
            		var selectedPPTypes = [];
            		var selectedObjectTypes = [];
            		var consumers = $('select#consumers').val() || [];
            		for (var i = 0; i < consumers.length; i++) {
            			var items = consumers[i].split(',');

            			for (var j = 0; j < items.length; j++) {
            				selectedObjectTypes.push(items[j]);
            			}
            		}
                
            		_this.markers.forEach(function(marker) {
            			var statusIsSwitchedOn = checkedStatuses.indexOf(marker.get('Status').toLowerCase()) >= 0;
            			var PPName = marker.get('PPName');
            			var TypeOfObject = marker.get('ObjectType');

            			if ($.inArray('Undefined', selectedPPName) != -1 && TypeOfObject == 'Undefined') {
            				filtredByPPName = true;
            			}
            			else if (PPName) {
            				filtredByPPName = $.inArray(PPName, selectedPPName) != -1;
            			}
            			else {
            				filtredByPPName = $.inArray(TypeOfObject, selectedObjectTypes) != -1;
            			}

            			//var knownStatus = allStatuses.indexOf(marker.get('Status')) >= 0;
            			if (statusIsSwitchedOn && filtredByPPName /*|| !knownStatus && checkedStatuses.indexOf('Under Construction') >= 0*/) {
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
                        		if (!_this.hasGeoJson && param.value !== 'none') {
                        			_this.hasGeoJson = true;
                        			_this.map.data.loadGeoJson('senegal.json');
                        		}
                        		var oldRegionValue = $('#regions').val();
                        		if (param.value !== 'none') {
                        			$('#regions').val(-1);
                        			_this.map.setCenter({ lat: 14.5067, lng: -14.4167 });
                        			_this.map.setZoom(8);
                        		}
                        		var newRegionValue = $('#regions').val();
                        		if (oldRegionValue != newRegionValue || _this.lastLayer != param.value) {
                        			_this.map.data.revertStyle();
                        			_this.map.data.setStyle(function (feature) {

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
                        		}
                        		_this.lastLayer = param.value;
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

                    var selectedPPName = $('#ppp-projects').val() || [];
                    for (var i = 0; i < selectedPPName.length; i++) {

                    	if (selectedPPName[i] == 'Undefined') {
                    		objectTypeIds.push(TypeNameToId[selectedPPName[i]]);
                    	}
                    	else {
                    		var typesForPP = PPNameToObjectType[selectedPPName[i]];

                    		if (typesForPP) {
                    			for (var j = 0; j < typesForPP.length; j++) {
                    				var id = TypeNameToId[typesForPP[j]];

                    				if ($.inArray(id, objectTypeIds) == -1) {
                    					objectTypeIds.push(id);
                    				}
                    			}
                    		}
                    	}
                	}

                	var selectedConsumers = $('#consumers').val() || [];
                	for (var i = 0; i < selectedConsumers.length; i++) {
                		var consumers = selectedConsumers[i].split(',');

                		for (var j = 0; j < consumers.length; j++) {
                			var id = TypeNameToId[consumers[j]];

                			objectTypeIds.push(id);
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
            	$(event.target).closest('.passport2-popup').hide();
            	$('#ppp-projects').selectpicker('show');
            });

            $('.ppp-item').on('click', function () {

            	$(this).toggleClass('active');
            });

            $('#pp-select-all').on('click', function () {

            	$('.ppp-item').addClass('active');

            	return false;
            });
            $('#pp-deselect-all').on('click', function () {

            	$('.ppp-item').removeClass('active');

            	return false;
            });
            $('#pp-ok').on('click', function () {

            	var pp = [];
            	$('.ppp-item.active').each(function (i, item) {
            		pp.push($(item).data('value'));
            	});

            	$('#ppp-projects').selectpicker('val', pp);
            	$('#overviewFilter').trigger('change');

            	$(event.target).closest('.passport2-popup').hide();
            	$('#ppp-projects').selectpicker('show');

            	return false;
            });
            $('#pp-cancel').on('click', function () {

            	$(event.target).closest('.passport2-popup').hide();
            	$('#ppp-projects').selectpicker('show');

            	return false;
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

        Application.prototype.showPassport2 = function () {
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

            if (typeName == 'Diesel Power Plant' ||
				typeName == 'Hydro Power Sources' ||
				typeName == 'Solar Power Stations' ||
				typeName == 'Thermal Power Stations') {
            	typeName == 'Hydro Power Sources';
            }
            
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
                        marker.setIcon('Images/icons_' + TypeNameToIcon[typeName] + '.png?v=1.1');
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

        	function markerClickHandler(event) {
        		self.infoWindow.setPosition(event.latLng);

        		var tooltipData = this.get('tooltip');
        		var data = tooltipData.data;
        		var html = '';

        		
        		if (data['Passport Page']) {

        			var template = doT.template($('#pdf-frame').html());
        			$('#pdf-frame-popup .passport__content').html(template({
        				name: data['Passport Page'].toString().replace('.00', '')
        			}));
        			$('#pdf-frame-popup').show();

        			return;
        		}
        		else {
        			var image = 'hospital.jpg';

        			switch (tooltipData.data['Object Type']) {
        				case 'Airports':
        					image = 'airport.jpg';
        					break;
        				case "Agriculture":
        					image = 'agriculture.jpg';
        					break;
        				case 'Energy and Mining':
        					image = 'energy-and-mining.jpg';
        					break;
        				case 'Diesel Power Plant':
        					image = 'power-stations.jpg';
        					break;
        				case 'Hydro Power Sources':
        					image = 'power-stations.jpg';
        					break;
        				case 'Solar Power Stations':
        					image = 'power-stations.jpg';
        					break;
        				case "Thermal Power Stations​":
        					image = 'power-stations.jpg';
        					break;
        				case 'Factories and Industrial Parks':
        					image = 'factories.jpg';
        					break;
        				case 'Housing':
        					image = 'housing.jpg';
        					break;
        				case 'Hotel':
        					image = 'hotels.jpg';
        					break;
        				case 'Ports':
        					image = 'ports.jpg';
        					break;
        				case 'Tourism':
        					image = 'tourism.jpg';
        					break;
        				case 'Hospital':
        					image = 'hospitals.jpg';
        					break;
        				case 'School':
        					image = 'schools.jpg';
        					break;
        				case 'Refinery':
        					image = 'refineries.jpg';
        					break;
        				case 'Train':
        					image = 'train.jpg';
        					break;
        				default:
        					
        					break;
        			}

        			html += '<div class="map-tooltip">';
        			html += '<p class="tooltip-header">' + data['Object Name'] + '</p>';

        			if (/*tooltipData.indicator != 'Agriculture' && tooltipData.indicator != 'Electified Villages' && */tooltipData.indicator != 'Undefined') {
        				html += '<div class="img-block">';
        				html += '<img src="./Images/p/' + image + '"/>';
        				html += '</div>';
        			}

        			html += '<div class="data-block">';
        			for (var i in data)
        				if (i != 'Object Name' && i != 'Notes')
        					html += '<div style="max-width: 250px;"><label>' + i + ':&nbsp;</label>' + (data[i] == null ? '' : data[i]) + '</div>';

        			html += '</div>';
        			html += '</div>';
        		}
        		

        		//if (tooltipData.indicator != 'farms')
        		//html += '<div style="margin-top: 5px;">Source: <a href="http://knoema.com/' + self.datasets[tooltipData.indicator] + '" target="_blank">Knoema.com</a></div>'
        		//html += '</div>';

        		self.infoWindow.setContent(html);
        		self.infoWindow.open(self.map);
        	}

            var self = this;
            var rowCount = Math.floor(data.data.length / data.columns.length);
            var markers = [];
            var heatmapArray = [];

            this.clearMarkers();

            // hack - need to passe data into [data-target="more-data"] click handler
            window.AppMapData = data;

            var statusNamesToIcon = {
            	'Completed': '',
            	'In Progress': '_underconstruction',
                'Announced': '_planned'
            };

            var visibleColumnCount = data.columns.length < 15 ? data.columns.length : 15;
            for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                var rowOffset = rowIndex * data.columns.length;
                /*for (var colIndex = 0; colIndex < visibleColumnCount; colIndex++) {
                    var dataIndex = rowOffset + colIndex;
                    var value = (data.columns[colIndex].type === 'Date') ? data.data[dataIndex].value : data.data[dataIndex];
                }*/

                var lat = data.data[rowOffset + 6] * 1;
                var lng = data.data[rowOffset + 7] * 1;
                if (!isFinite(lat) || !isFinite(lng) || (lat === 0 && lng === 0)) {
                    continue;
                }

                var latLng = new google.maps.LatLng(lat, lng);
                heatmapArray.push(latLng);

            	// tooltip text

                var tooltip = {};

                for (var j = 0; j < data.columns.length; j++) {

                	var dataIndex = rowOffset + j;

                	var value = null;

                	if (data.columns[j].type === 'Date' && data.data[dataIndex]) {
                		tooltip['Time'] = data.data[dataIndex].value;
                	}
                	else
                		value = data.data[dataIndex];

                	if (value != null && value != '')
                		tooltip[data.columns[j].name] = value;
                }

                var tooltipData = {
                	indicator: typeName,
                	data: tooltip
                };
            	// end tooltip

                if (data.data[rowOffset + 9] == 'PPP') {
                	var marker = new MarkerWithLabel({
                		position: latLng,
                		map: map,
                		labelContent: 'PPP',
                		labelAnchor: new google.maps.Point(0, 20),
                		labelClass: "labels",
                		labelStyle: { opacity: 0.9 }
                	});
                }
                else {
                	var marker = new google.maps.Marker({
                		position: latLng,
                		map: map
                	});
                }

                var status = data.data[rowOffset + 8];
                marker.set('Status', status);
                marker.set('PPName', data.data[rowOffset + 2]);

                var objectType = data.data[rowOffset + 3];
                if (objectType.search('Solar Power') != -1)
                	objectType = 'Solar Power Stations';
                if (objectType.search('Thermal Power') != -1)
                	objectType = 'Thermal Power Stations';
                if (objectType.search('Diesel Power') != -1)
                	objectType = 'Diesel Power Plant';
                if (objectType.search('Hydro Power') != -1)
                	objectType = 'Hydro Power Sources';
                marker.set('ObjectType', objectType);

                var typeName = data.data[rowOffset + 3];
                if (typeName in TypeNameToIcon) {
                	var icon = TypeNameToIcon[typeName];
                	marker.setIcon('Images/icons_' + icon + statusNamesToIcon[status] + '.png?v=1');
                }

                marker.set('tooltip', tooltipData);
                marker.addListener('click', markerClickHandler);
                
                //google.maps.event.addListener(marker, 'click', this.showPassport.bind(this, data.data[rowOffset + 3], data.data[rowOffset + 2]));

                markers.push(marker);
            }

            this.markers = markers;
        };

        Application.prototype.buildTooltipMarkup = function (label, value) {

        	//if (value != null)
        	//	value = this.isUrl(value) ? ('<a target="_blank" href="' + value + '">' + value + '</a>') : value;

        	return '<div><label>' + label + '</label>' + (value == null ? '' : value) + '</div>';
        };

        Application.prototype.getObjects = function (objectTypeIds) {
        	var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=cygxxfe';
            var data = {
                "Header":[],
                "Stub":[],
                "Filter":[{
                    "DimensionId":"object-type",
                    "Members":objectTypeIds,
                    "DimensionName":"Object Type",
                    "DatasetId": "cygxxfe",
                    "Order":"0"
                }],
                "Frequencies":[],
                "Dataset": "cygxxfe",
                "Segments":null,
                "MeasureAggregations":null
            };

            return $.post(url, data);
        };

        Application.prototype.getRegionsData = function () {
        	var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=SNDED2016';
        	var data = {
        		"Header": [],
        		"Stub": [],
        		"Filter": [{
        			"DimensionId": "location",
        			"Members": [],
        			"DimensionName": "Location",
        			"DatasetId": "SNDED2016"
        		},
        		{
        			"DimensionId": "indicator",
        			"Members": ['1000010', '1000020', '1000030', '1000040', '1000050', '1000070', '1000080', '1000090', '1000100' ],
        			"DimensionName": "Indicator",
        			"DatasetId": "SNDED2016"
        		}],
        		"Frequencies": [],
        		"Dataset": "SNDED2016",
        		"Segments": null,
        		"MeasureAggregations": null
        	};

        	return $.post(url, data);
        };

        Application.prototype.getRegionData = function (regionId, callback) {

        	var self = this;
        	var filterByRegion = function (regionId) {
        		var res = {};
        		for (var i = 0; i < self.regionData.length; i++)
        			if (self.regionData[i].regionId == regionId)
        				res[self.regionData[i].indicator] = self.regionData[i].value;

        		return res;
        	};

        	if (self.regionData.length == 0) {
        		self.getRegionsData().done(function (data) {

        			var rowCount = Math.floor(data.data.length / data.columns.length);
        			for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        				var rowOffset = rowIndex * data.columns.length;

        				var ind = data.data[rowOffset + 3];
        				if (self.regionAverageData[ind])
        					self.regionAverageData[ind] += data.data[rowOffset + 6] * 1 / 14;
        				else
        					self.regionAverageData[ind] = data.data[rowOffset + 6] * 1 / 14;

        				self.regionData.push({
        					regionId: data.data[rowOffset + 1],
        					indicator: data.data[rowOffset + 3],
        					value: data.data[rowOffset + 6] * 1
        				});
        			}

        			callback(filterByRegion(regionId));
        		});
        	}
        	else {
        		callback(filterByRegion(regionId));
        	}
        };

        Application.prototype.getSenegalRawData = function () {
        	var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=SECPI2016';
        	var data = {
        		"Header": [],
        		"Stub": [],
        		"Filter": [{
        			"DimensionId": "measure",
        			"Members": ['1000000'],
        			"DimensionName": "Measure",
        			"DatasetId": "SECPI2016"
        		},
        		{
        			"DimensionId": "indicator",
        			"Members": ['1000020', '1000030', '1000040', '1000050', '1000060', '1000070', '1000360', '1000370', '1000380', '1000710', '1000720', '1000730', '1000740', '1000800', '1000810', '1000820', '1001100', '1001110', '1001120', '1001130', ],
        			"DimensionName": "Indicator",
        			"DatasetId": "SECPI2016"
        		}],
        		"Frequencies": [],
        		"Dataset": "SECPI2016",
        		"Segments": null,
        		"MeasureAggregations": null
        	};

        	return $.post(url, data);
        };

        Application.prototype.getSenegalData = function (callback) {

        	var self = this;

        	if (Object.keys(self.senegalData).length == 0) {
        		self.getSenegalRawData().done(function (data) {

        			var rowCount = Math.floor(data.data.length / data.columns.length);
        			for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        				var rowOffset = rowIndex * data.columns.length;

        				self.senegalData[data.data[rowOffset + 1]] = data.data[rowOffset + 7] * 1;
        			}

        			callback();
        		});
        	}
        	else {
        		callback();
        	}
        };

        return Application;
    })();

    google.maps.event.addDomListener(window, 'load', function () {
        var greeter = new Application();
        greeter.run();
    });
})(Infrastructure || (Infrastructure = {}));
//# sourceMappingURL=app.js.map
