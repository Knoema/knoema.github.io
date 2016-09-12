/// <reference path="typings/jquery.d.ts"/>
/// <reference path="typings/google.maps.d.ts"/>

var Infrastructure;
(function (Infrastructure) {
	var host = 'http://pspp.knoema.com';
	//var host = 'https://beta.knoema.org';

	var projectsDataset = 'sardyld';
	var objectsDataset = 'hpenvhf';

	var projectData = [];
	var projectColumns = [];
	var objectData = [];
	var objectColumms = [];

	var objectTypeIndex = -1;
	var pseIndex = -1;
	var databaseCodeIndex = -1;
	var databaseCodeIndex_O = -1;
	var latIndex = -1;
	var lngIndex = -1;
	var regionIdIndex = -1;
	var nameIndex = -1;
	var ppIndex = -1;
	var statusIndex = -1;
	var ptipIndex = -1;

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

            $('#slider-range').slider({
            	range: true,
            	min: 0,
            	max: 100,
            	values: [0, 100]
            });

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
            	
            	if (regionId == -1) {
            		_this.getSenegalData(function () {

            			var template = doT.template($('#senegal-profile').html());
            			$('#senegal-frame-popup .passport__content').html(template({
            				indicatorData: _this.senegalData
            			}));
            			$('#senegal-frame-popup').show();
            		});
            	}
            	else {
            		var regionName = $('#regions option[value=' + regionId + ']').text();

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

            $.when(this.getProjects(), this.getObjects()).done(function (projectData, objectData) {
            	
            	_this.projectData = projectData[0].data;
            	_this.projectColumns = projectData[0].columns;

            	for (var i = 0; i < _this.projectColumns.length; i++) {

            		var name = _this.projectColumns[i].name;
            		if (name == 'Projet/Reforme') _this.objectTypeIndex = i;
            		if (name == 'Database Code') _this.databaseCodeIndex = i;
            		if (name == 'Code de l\'axe stratégique de la vision 2035') _this.pseIndex = i;
            		if (name == 'Nom Projet') _this.nameIndex = i;
            		if (name == 'Numéro du projet phare / numéro de la réforme phare') _this.ppIndex = i;
            		if (name == 'Statut') _this.statusIndex = i;
            		if (name == 'Code PTIP') _this.ptipIndex = i;
            	}

            	_this.objectData = objectData[0].data;
            	_this.objectColumns = objectData[0].columns;

            	for (var i = 0; i < _this.objectColumns.length; i++) {

            		var name = _this.objectColumns[i].name;
            		if (name == 'Database Code') _this.databaseCodeIndex_O = i;
            		if (name == 'Latitude') _this.latIndex = i;
            		if (name == 'Longitude') _this.lngIndex = i;
            		if (name == 'RegionId') _this.regionIdIndex = i;
            	}

            	if ($(document.body).hasClass('loading'))
            		$(document.body).removeClass('loading');

            	$('#overviewFilter').trigger('change');
            });

            $('a[data-toggle="tab"]').on('click', function () {

            	var href = $(this).attr('href');
            	window.location = './' + href;
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
            	var $rhp = $('#right-hand-panel');

            	//$('input[name="Layer"]').filter('[value="none"]').trigger('click');
            	//$("div#legend").hide();

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

            		$rhp.hide();

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

            	$rhp.find('.region-name').text($('#regions option[value=' + regionId + ']').text());

            	var projects = getProjectByRegion(regionId);
            	var $trs = [];
            	if (projects.length > 0) {
            		for (var i = 0; i < projects.length; i++) {
            			$trs.push($('<tr>')
							.append($('<td>', { text: projects[i].pp }))
							.append($('<td>', { text: projects[i].name }))
							.append($('<td>', { text: projects[i].status }))
						);
            		}

            		$rhp.find('tbody').empty().append($trs)
            	}

            	$rhp.show();
            };

            function getProjectByRegion(regionId) {

            	var res = [];
            	var dbCodes = [];
            	for (var i = 0; i < _this.objectData.length / _this.objectColumns.length; i++) {

            		var offset = i * _this.objectColumns.length;
            		var dbcode = _this.objectData[offset + _this.databaseCodeIndex_O];
					
            		if (regionId != _this.objectData[offset + _this.regionIdIndex])
            			continue;

					if($.inArray(dbcode, dbCodes) == -1)
            			dbCodes.push(dbcode);
            	}

            	for (var i = 0; i < _this.projectData.length / _this.projectColumns.length; i++) {

            		var offset = i * _this.projectColumns.length;
            		var dbcode = _this.projectData[offset + _this.databaseCodeIndex];

            		//only for projects
            		if (_this.projectData[offset + _this.objectTypeIndex] != 'P')
            			continue;

            		if ($.inArray(dbcode, dbCodes) == -1)
            			continue;

            		res.push({
            			pp: _this.projectData[offset + _this.ppIndex],
            			name: _this.projectData[offset + _this.nameIndex],
						status: _this.projectData[offset + _this.statusIndex]
            		});
            	}

            	return res;
            };
            
            // Request dataset and show on the map
            var $overviewFilter = $('#overviewFilter').on('change', function (event) {
            	clearTimeout(_this.filterTimeout);

            	var filtredProjects = {};
            	var filtredObjects = [];
            	var paramsUngrouped = $overviewFilter.serializeArray();
            	var params = {};
            	for (var i = 0; i < paramsUngrouped.length; i++) {
            		if (!params[paramsUngrouped[i].name])
            			params[paramsUngrouped[i].name] = [];

            		params[paramsUngrouped[i].name].push(paramsUngrouped[i].value);
            	}

            	var selectedPPName = $('#ppp-projects').val() || [];

            	for (var i = 0; i < _this.projectData.length / _this.projectColumns.length; i++) {

            		var offset = i * _this.projectColumns.length;

            		//only for projects
            		if (_this.projectData[offset + _this.objectTypeIndex] != 'P')
            			continue;
					
            		var addObject = true;
            		for (var j in params) {

            			switch (j) {

            				case 'pse':
            					if ($.inArray(_this.projectData[offset + _this.pseIndex], params[j]) == -1)
            						addObject = false;
            					break;

            				case 'status':
            					if ($.inArray(_this.projectData[offset + _this.statusIndex], params[j]) == -1)
            						addObject = false;
            					break;

            				case 'plan':
            					var ptipValue = _this.projectData[offset + _this.ptipIndex] == '' ? 'no' : 'yes';

            					if (ptipValue != params[j])
            						addObject = false;
            					break;
            			}

            			if (!addObject)
            				break;
            		}

            		if (selectedPPName.length > 0 && $.inArray(_this.projectData[offset + _this.ppIndex], selectedPPName) == -1)
            			addObject = false;

            		if (addObject) {
            			var tooltipData = {};
            			tooltipData[_this.projectColumns[2].name] = _this.projectData[offset + 2];
            			tooltipData[_this.projectColumns[9].name] = _this.projectData[offset + 9];
            			tooltipData[_this.projectColumns[10].name] = _this.projectData[offset + 10];
            			tooltipData[_this.projectColumns[3].name] = _this.projectData[offset + 3];
            			tooltipData[_this.projectColumns[14].name] = _this.projectData[offset + 14];
            			tooltipData[_this.projectColumns[40].name] = _this.projectData[offset + 40];

            			filtredProjects[_this.projectData[offset + _this.databaseCodeIndex]] = tooltipData;
            		}
            	}

            	for (var i = 0; i < _this.objectData.length / _this.objectColumns.length; i++) {

            		var offset = i * _this.objectColumns.length;

            		if (filtredProjects[_this.objectData[offset + _this.databaseCodeIndex_O]])
            			filtredObjects.push({
            				lat: _this.objectData[offset + _this.latIndex],
            				lng: _this.objectData[offset + _this.lngIndex],
            				tooltip: filtredProjects[_this.objectData[offset + _this.databaseCodeIndex_O]]
            			});
            	}


            	if (filtredObjects.length > 0) {
            		_this.filterTimeout = setTimeout(function () {

            			_this.addObjectsToMap(_this.map, filtredObjects);
            		}, 500);
            	} else {

            		_this.clearMarkers();
            	}
            });
            //$overviewFilter.trigger('change');

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
        		var html = '';
        		html += '<div class="map-tooltip">';

        		html += '<div class="img-block">';
        		html += '<img src="./img/nophoto.png" />';
        		html += '</div>';

        		html += '<div class="data-block">';
        		for (var i in tooltipData)
        			html += '<div style="max-width: 300px;"><label>' + i + ':&nbsp;</label>' + (tooltipData[i] == null ? '' : tooltipData[i]) + '</div>';

        		html += '</div>';

        		html += '<a href="#" data-data="' + encodeURI(JSON.stringify(tooltipData)) + '" class="opp-button">Open project passport</a>';

        		html += '</div>';

        		self.infoWindow.setContent(html);
        		self.infoWindow.open(self.map);

        		$('.opp-button').on('click', function () {
        			var objData = decodeURI($(this).data('data'));
        			objData = JSON.parse(objData);
        			var templateData = {
        				name: objData["Nom Projet"],
        				budget: objData["Budget Total Prévu: Dépenses réalisées"],
        				axe: objData["Code de l'axe stratégique de la vision 2035"],
        				sour: objData["Code du Sous-Secteur"],
        				number: objData["Numéro du projet phare / numéro de la réforme phare"],
        				status: objData["Statut"]
        			};

        			var template = doT.template($('#new-object-passport').html());
        			var template_b = doT.template($('#new-object-budgetting').html());

        			$('#new-project-passport .passport__content__new').empty().html(template(templateData));
        			$('#new-project-passport .passport__content__new__b').empty().html(template_b({}));
        			$('#new-project-passport').show();

        			$('.passport-tab').on('click', function () {
        				var name = $(this).data('name');
        				$('.passport-tab').removeClass('active');
        				$(this).addClass('active');

        				if (name == 'passport') {
        					$('.passport__content__new').show();
        					$('.passport__content__new__b').hide();
        				}
        				else if (name == 'budgetting') {
        					$('.passport__content__new').hide();
        					$('.passport__content__new__b').show();
        				}
        			});

        			$('.passport__close__new').on('click', function () {
        				$('#new-project-passport').hide();

        			});

        			self.infoWindow.close();

        			return false;
        		});
        	};

        	var self = this;

        	var markers = [];
        	this.clearMarkers();

        	for (var i = 0; i < data.length; i++) {

        		if (!isFinite(data[i].lat) || !isFinite(data[i].lng) || (data[i].lat === 0 && data[i].lng === 0))
        			continue;

        		var marker = new google.maps.Marker({
        			position: new google.maps.LatLng(data[i].lat, data[i].lng),
        			map: map
        		});

        		marker.set('tooltip', data[i].tooltip);
        		marker.addListener('click', markerClickHandler);

        		//google.maps.event.addListener(marker, 'click', this.showPassport.bind(this, data.data[rowOffset + 3], data.data[rowOffset + 2]));

        		markers.push(marker);
        	}

            this.markers = markers;
        };

        Application.prototype.getObjects = function () {

        	var url = host + '/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=' + objectsDataset;
        	var data = {
        		'Header': [],
        		'Stub': [],
        		'Filter': [{
        			'DimensionId': 'region',
        			'DimensionName': 'Region',
        			'DatasetId': objectsDataset,
        			'Members': ['1000000', '1000010', '1000020', '1000030', '1000040', '1000050', '1000060', '1000070', '1000080', '1000090', '1000100', '1000110', '1000120', '1000130', '1000140']
        		}],
        		'Frequencies': [],
        		'Dataset': objectsDataset,
        		'Segments': null,
        		'MeasureAggregations': null,
        		'RegionIdsRequired': true
        	};

            return $.post(url, data);
        };

        Application.prototype.getProjects = function () {

        	var url = host + '/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=' + projectsDataset;
        	var data = {
        		'Header': [],
        		'Stub': [],
        		'Filter': [{
        			'DimensionId': 'measure',
        			'DimensionName': 'Measure',
        			'DatasetId': projectsDataset,
        			'Members': ['5679690', '5679700', '5679710']
        		}],
        		'Frequencies': [],
        		'Dataset': projectsDataset,
        		'Segments': null,
        		'MeasureAggregations': null
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