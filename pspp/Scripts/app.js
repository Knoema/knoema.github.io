/// <reference path="typings/jquery.d.ts"/>
/// <reference path="typings/google.maps.d.ts"/>

var Infrastructure;
(function (Infrastructure) {
	var host = 'http://pspp.knoema.com';

	var projectsDataset = 'hmunucb';
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
	var sectorIndex = -1;
	var budgetIndex = -1;

	var axes = {
		'1': 'Axe 1. Transformation structurelle de l’économie et croissance',
		'2': 'Axe 2. Capital humain, Protection sociale et Développement durable',
		'3': 'Axe 3. Gouvernance, Institutions, Paix et Sécurité'
	};

	var sectors = {
		'100': 'Agriculture et Sécurité alimentaire',
		'101': 'Artisanat',
		'102': 'Commerce',
		'103': 'Communication, Infrastructures et Services de télécommunication',
		'104': 'Coopération Internationale, Intégration régionale et SE',
		'105': 'Culture',
		'106': 'Elevage',
		'107': 'Industrie et Transformation agroalimentaire',
		'108': 'Infrastructure financière et Services financiers',
		'109': 'Transport',
		'110': 'Infrastructures et services énergétiques',
		'111': 'Mines et carrières',
		'112': 'Pêche et aquaculture',
		'113': 'Secteur privé et PME',
		'114': 'Sports',
		'115': 'Tourisme',
		'200': 'Eau Potable et Assainissement (EPA)',
		'201': 'Education Nationale',
		'202': 'Emploi, jeunesse, Population et développement',
		'203': 'Enseignement Supérieur et Recherche',
		'204': 'Environnement et Développement Durable',
		'205': 'Formation professionnelle et technique',
		'206': 'Gestion des Risques et Catastrophes',
		'207': 'Habitat et Cadre de vie',
		'208': 'Protection sociale',
		'209': 'Santé et Nutrition',
		'300': 'Administration publique et Réforme de l’Etat',
		'301': 'Aménagement du territoire, Développement local et Territorialisation',
		'302': 'Equité et Egalité de Genre',
		'303': 'Gouvernance stratégique, économique et financière',
		'304': 'Justice, Droits Humains et Etat de droit',
		'305': 'Paix et sécurité'
	};

	var statusIcons = {
		'1': '01-Envisage',
		'2': '02-Annonce',
		'3': '03-Entame',
		'En cours': '04-En-cours',
		'Opérationnel': '05-Operationel',
		'6': '06-Complete',
		'7': '07-Finalise'
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
            this.layerData = {};
            this.globalData = {};
            this.realizeData = {};
            this.senegalTabIsLoaded = false;
            this.preloadedObject = this.getParameterByName('code') ? this.getParameterByName('code') : -1;
            this.filterObjects = this.getParameterByName('objects');

            this.axes = axes;
            this.sectors = sectors;

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

            $('.close-button').on('click', function () {

            	$('#right-hand-panel').hide();
            	$('#senegal-right-hand-panel').hide();
            	$('#map-canvas').css({ right: '0px' });
            	google.maps.event.trigger(_this.map, 'resize');
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
            		if (name == 'Numéro du projet phare / numéro de la réforme phare. (PP# / RP#)') _this.ppIndex = i;
            		if (name == 'Statut Projets: Annoncé, En cours, Complété, opérationel Programmes/reformes: En') _this.statusIndex = i;
            		if (name == 'Code PTIP') _this.ptipIndex = i;
            		if (name == 'Code du Sous-Secteur (voir feuille Read me pour avoir les codes)') _this.sectorIndex = i;
            		if (name == 'Region, Département (Localité) (sinon mettre 0)') _this.localeIndex = i;
            		if (name == 'Budget Total Prévu: Dépenses Prévues') _this.budgetIndex = i;
            		if (name == 'Catégorie des réformes') _this.reformIndex = i;
            		if (name == 'Objectif Stratégique') _this.objectsIndex = i;
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

            	_this.hideNonPresentedProjectsButtons(_this.projectData);

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
            	var $srhp = $('#senegal-right-hand-panel');

            	if (regionId == 'SN' || regionId == -1) {
            		_this.hasGeoJson = false;

            		_this.map.setCenter({ lat: 14.5067, lng: -14.4167 });
            		_this.map.setZoom(8);
            		if (_this.infoWindow)
            			_this.infoWindow.close();

            		_this.map.data.revertStyle();
            		_this.map.data.setStyle(function (feature) {

            			return { visible: false };
            		});

            		if (regionId == 'SN') {
            			if (!_this.senegalTabIsLoaded)
            				_this.showSenegalPanel();
            			$srhp.show();
            			$('#map-canvas').css({ right: '350px' });
            		}
            		else {
            			$srhp.hide();
            			$('#map-canvas').css({ right: '0px' });
            		}

            		$rhp.hide();

            		return;
            	}

            	$srhp.hide();

            	$('input[name=layer]').filter('[value=none]').prop('checked', true);
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
            	$rhp.find('tbody').empty();
            	if (projects.length > 0) {
            		for (var i = 0; i < projects.length; i++) {

            			var ppNumber = '00';
            			if (projects[i].pp.length == 4)
            				ppNumber = projects[i].pp.substr(2, 3);
            			else if (projects[i].pp.length == 3)
            				ppNumber = '0' + projects[i].pp.substr(2, 3);

            			$trs.push($('<tr>', { 'data-name': projects[i].name })
							.append($('<td>').append($('<img>', { src: './img/right-panel/icons-' + ppNumber + '.png', 'class': 'pp-image-small' })))
							.append($('<td>', { text: projects[i].pp }))
							.append($('<td>', { text: projects[i].name }))
							.append($('<td>', { text: projects[i].status }))
						);
            		}

            		$rhp.find('tbody').append($trs);

            		$rhp.find('tr').on('click', function () {
            			var name = $(this).data('name');

            			_this.markers.forEach(function (marker) {

            				var tooltip = marker.get('tooltip');
            				if (tooltip[_this.projectColumns[_this.nameIndex].name] == name)
            					new google.maps.event.trigger(marker, 'click');
            			});
            		});
            	}

            	$rhp.show();
            	$('#map-canvas').css({ right: '350px' });

            	_this.getRegionData(regionId, function (data) {

            		var regionData = doT.template($('#region-profile').html());
            		$('#region-data').empty().append(regionData({
            			indicatorData: data
            		}));
            	});
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
						status: _this.projectData[offset + _this.statusIndex],
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

            					if($.inArray(ptipValue, params[j]) == -1)
            						addObject = false;
            					break;

            				case 'layer':

            					if (params[j][0] == 'none') {
            						if (!_this.hasGeoJson) {
            							_this.hasGeoJson = true;
            							_this.map.data.loadGeoJson('senegal.json');
            						}
            						_this.map.data.revertStyle();
            						_this.map.data.setStyle(function (feature) {
            							return { visible: false };
            						});
            						$("#legend").hide();

            						break;
            					}

            					$("#legend").show();

            					var dataLoader = null;
            					var layerName = params[j][0];
            					switch (layerName) {
            						case 'population':
            							dataLoader = _this.getDataLayerPopulation();
            							break;
            						case 'urbanization':
            							dataLoader = _this.getDataLayerUrbanization();
            							break;
            						case 'school':
            							dataLoader = _this.getDataLayerSchool();
            							break;
            						case 'poverty':
            							dataLoader = _this.getDataLayerPoverty();
            							break;
            					}

            					if (_this.layerData[layerName]) {
            						_this.displayLayerData(_this.layerData[layerName], layerName == 'population');
            					}
            					else {
            						dataLoader.done(function (data) {

            							_this.layerData[layerName] = data;
            							_this.displayLayerData(data, layerName == 'population');
            						});
            					}

            					break;
            			}

            			if (!addObject)
            				break;
            		}

            		if (selectedPPName.length > 0 && $.inArray(_this.projectData[offset + _this.ppIndex], selectedPPName) == -1)
            			addObject = false;

            		if (_this.filterObjects) {
            			if (_this.projectData[offset + _this.objectsIndex] != _this.filterObjects)
            				addObject = false;
            		}

            		if (addObject) {
            			var tooltipData = {};
            			tooltipData[_this.projectColumns[_this.nameIndex].name] = _this.projectData[offset + _this.nameIndex];
            			tooltipData[_this.projectColumns[_this.pseIndex].name] = _this.projectData[offset + _this.pseIndex] + ' - ' + _this.axes[_this.projectData[offset + _this.pseIndex]];
            			tooltipData[_this.projectColumns[_this.sectorIndex].name] = _this.projectData[offset + _this.sectorIndex] + ' - ' + _this.sectors[_this.projectData[offset + _this.sectorIndex]];
            			tooltipData[_this.projectColumns[_this.statusIndex].name] = _this.projectData[offset + _this.statusIndex];
            			tooltipData[_this.projectColumns[_this.ppIndex].name] = $('#ppp-projects').find('option[value=' + _this.projectData[offset + _this.ppIndex] + ']').text();;
            			tooltipData[_this.projectColumns[_this.ptipIndex].name] = _this.projectData[offset + _this.ptipIndex];
            			tooltipData[_this.projectColumns[_this.localeIndex].name] = _this.projectData[offset + _this.localeIndex];
            			tooltipData[_this.projectColumns[_this.budgetIndex].name] = _this.projectData[offset + _this.budgetIndex];

            			filtredProjects[_this.projectData[offset + _this.databaseCodeIndex]] = tooltipData;
            		}
            	}

            	for (var i = 0; i < _this.objectData.length / _this.objectColumns.length; i++) {

            		var offset = i * _this.objectColumns.length;

            		if (filtredProjects[_this.objectData[offset + _this.databaseCodeIndex_O]])
            			filtredObjects.push({
            				lat: _this.objectData[offset + _this.latIndex],
            				lng: _this.objectData[offset + _this.lngIndex],
            				tooltip: filtredProjects[_this.objectData[offset + _this.databaseCodeIndex_O]],
            				code: _this.objectData[offset + _this.databaseCodeIndex_O]
            			});
            	}


            	if (filtredObjects.length > 0) {
            		_this.filterTimeout = setTimeout(function () {

            			_this.addObjectsToMap(_this.map, filtredObjects);

            			if (_this.preloadedObject != -1) {
            				_this.showPreloadedObject();
            				_this.preloadedObject = -1;
            			}

            			if (_this.filterObjects) {
            				_this.showRightPanelForObjectCode(_this.filterObjects);
            				_this.filterObjects = null;
            			}
            		}, 500);
            	} else {

            		_this.clearMarkers();
            	}
            });

            $(document).on('click', '.passport__close', function(event) {
            	$(event.target).closest('.passport-popup').hide();
            	$(event.target).closest('.passport2-popup').hide();
            	$('#ppp-projects').selectpicker('show');
            });

            $('.ppp-item').on('click', function () {

            	if ($(this).find('.cap').length > 0)
            		return false;

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

        Application.prototype.hideNonPresentedProjectsButtons = function () {

        	var presented = [];
        	for (var i = 0; i < this.projectData.length / this.projectColumns.length; i++) {

        		var offset = i * this.projectColumns.length;

        		var pp = this.projectData[offset + this.ppIndex];

        		if ($.inArray(pp, presented) == -1)
        			presented.push(pp);
        	}

        	$('#ppp-projects option').each(function (index, item) {
        		var pp = $(this).val();

        		if ($.inArray(pp, presented) == -1)
        			$(this).prop('disabled', true);
        	});
        	$('#ppp-projects').selectpicker('refresh');

        	$('#ppp-frame-popup .ppp-item').each(function (index, item) {
        		var pp = $(this).data('value');

        		if ($.inArray(pp, presented) == -1)
        			$(this).prepend($('<div>', { 'class': 'cap' }));
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
        		self.infoWindow.setPosition(this.get('latlng'));

        		var tooltipData = this.get('tooltip');
        		var status = tooltipData["Statut Projets: Annoncé, En cours, Complété, opérationel Programmes/reformes: En"];
        		var html = '';
        		html += '<div class="map-tooltip">';

        		html += '<div class="img-block">';
        		html += '<img src="./img/nophoto.png" />';
        		html += '<div class="data-block s"><img src="./img/status/' + statusIcons[status] + '.png"/><div><label>Statut:</label><br />' + (status == null ? '' : status) + '</div></div>';
        		html += '</div>';

        		html += '<div class="data-block">';

        		html += '<div class="title-block">';
        		html += '<div style="max-width: 300px;"><label>Nom Projet:</label><br />' + (tooltipData['Nom Projet'] == null ? '' : tooltipData['Nom Projet']) + '</div>';
        		html += '</div>';

        		html += '<div class="data-block col1">';

        		html += '<div><label>Localité:</label><br />' + (tooltipData['Region, Département (Localité) (sinon mettre 0)'] == null ? '' : tooltipData['Region, Département (Localité) (sinon mettre 0)']) + '</div>';
        		html += '<div><label>Budget Total Prévu:</label><br />' + (tooltipData['Budget Total Prévu: Dépenses Prévues'] == null ? '0' : tooltipData['Budget Total Prévu: Dépenses Prévues']) + '</div>';
        		html += "<div><label>Code de l'axe stratégique de la vision 2035:</label><br />" + (tooltipData["Code de l'axe stratégique de la vision 2035"] == null ? '' : tooltipData["Code de l'axe stratégique de la vision 2035"]) + '</div>';

        		html += '</div>';

        		html += '<div class="data-block col2">';

        		html += '<div><label>Sous Secteur:</label><br />' + (tooltipData['Code du Sous-Secteur (voir feuille Read me pour avoir les codes)'] == null ? '' : tooltipData['Code du Sous-Secteur (voir feuille Read me pour avoir les codes)']) + '</div>';
        		html += '<div><label>Plan Senegal Emergent project:</label><br />' + (tooltipData['Numéro du projet phare / numéro de la réforme phare. (PP# / RP#)'] == null ? '' : tooltipData['Numéro du projet phare / numéro de la réforme phare. (PP# / RP#)']) + '</div>';
        		html += '<div><label>Code PTIP:</label><br />' + (tooltipData['Code PTIP'] == null ? '' : tooltipData['Code PTIP']) + '</div>';
        		html += '<div><label>Dépenses réalisées:</label><br />' + (tooltipData['Budget Total Prévu: Dépenses Prévues'] == null ? '0' : tooltipData['Budget Total Prévu: Dépenses Prévues']) + '</div>';
        		

        		html += '</div>';

        		html += '</div>';

        		html += '<a href="#" data-data="' + encodeURI(JSON.stringify(tooltipData)) + '" class="opp-button">Passeport projet ouvert</a>';

        		html += '</div>';

        		self.infoWindow.setContent(html);
        		self.infoWindow.open(self.map);

        		$('.opp-button').on('click', function () {
        			var objData = decodeURI($(this).data('data'));
        			objData = JSON.parse(objData);

        			var templateData = {
        				name: objData["Nom Projet"],
        				budget: (objData["Budget Total Prévu: Dépenses Prévues"] ? objData["Budget Total Prévu: Dépenses Prévues"] : 0),
        				axe: objData["Code de l'axe stratégique de la vision 2035"],
        				sour: objData["Code du Sous-Secteur (voir feuille Read me pour avoir les codes)"],
        				number: objData["Numéro du projet phare / numéro de la réforme phare. (PP# / RP#)"],
        				statusIcon: statusIcons[status],
        				status: status,
        				ptip: objData["Code PTIP"],
        				locale: objData["Region, Département (Localité) (sinon mettre 0)"]
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

        		marker.set('code', data[i].code);
        		marker.set('latlng', new google.maps.LatLng(data[i].lat, data[i].lng));
        		marker.set('tooltip', data[i].tooltip);
        		marker.addListener('click', markerClickHandler);

        		//google.maps.event.addListener(marker, 'click', this.showPassport.bind(this, data.data[rowOffset + 3], data.data[rowOffset + 2]));

        		markers.push(marker);
        	}

            this.markers = markers;
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
        			"Members": ['1000010', '1000020', '1000030', '1000040', '1000050', '1000070', '1000080', '1000090', '1000100'],
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
        			'Members': []
        		}],
        		'Frequencies': [],
        		'Dataset': projectsDataset
        	};

        	return $.post(url, data);
        };
		
        Application.prototype.getDataLayerPopulation = function () {

        	var url = 'https://knoema.com' + '/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=SERSSD2011';

        	var descriptor = {
        		"Header": [
				   {
				   	"DimensionId": "Time",
				   	"Members": ["2013"],
				   	"UiMode": "individualMembers"
				   }
        		],
        		"Stub": [
				   {
				   	"DimensionId": "location",
				   	"Members": ["1000010", "1000020", "1000030", "1000040", "1000050", "1000060", "1000070", "1000080", "1000090", "1000100", "1000110", "1000120", "1000130", "1000140"]
				   }
        		],
        		"Filter": [
				   {
				   	"DimensionId": "variable",
				   	"Members": ["1000040"]
				   }
        		],
        		"Frequencies": ["A"],
        		"Dataset": "SERSSD2011"
        	};

        	return $.post(url, descriptor);
        };

        Application.prototype.getDataLayerUrbanization = function () {

        	var url = 'https://knoema.com' + '/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=SERSSD2011';

        	var descriptor = {
        		"Header": [{
        			"DimensionId": "Time",
        			"Members": ["2011"],
					"UiMode": "individualMembers"
        		}],
				"Stub": [{
					"DimensionId": "location",
					"Members": []
				}],
				"Filter": [{
					"DimensionId": "variable",
					"Members": ["1000550"]
				}, {
					"DimensionId": "sex",
					"Members": ["1000020"]
				}],
				"Frequencies": ["A"],
				"Dataset": "SEPFS2011"
        };

        	return $.post(url, descriptor);
        };

        Application.prototype.getDataLayerSchool = function () {

        	var url = 'https://knoema.com' + '/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=SEDHSMI2011';

        	var description = {
        		"Header": [{
        			"DimensionId": "Time",
        			"Members": ["2011"],
        			"UiMode": "individualMembers"
        		}],
        		"Stub": [{
        			"DimensionId": "location",
        			"Members": []
        		}],
        		"Filter": [{
        			"DimensionId": "variable",
        			"Members": ["1002820"]
        		}, {
        			"DimensionId": "sex",
        			"Members": ["1000020"]
        		}],
        		"Frequencies": ["A"],
        		"Dataset": "SEDHSMI2011"
        	};

        	return $.post(url, description);
        };

        Application.prototype.getDataLayerPoverty = function () {

        	var url = 'https://knoema.com' + '/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=SEIPC2006';

        	var description = {
        		"Header": [{
        			"DimensionId": "Time",
        			"Members": ["2002"],
        			"UiMode": "individualMembers"
        		}],
        		"Stub": [{
        			"DimensionId": "location",
        			"Members": [],
        		}],
        		"Filter": [{
        			"DimensionId": "variable",
        			"Members": ["1000000"]
        		}],
        		"Frequencies": ["A"],
        		"Dataset": "SEIPC2006",
        	};

        	return $.post(url, description);
        };

        Application.prototype.displayLayerData = function (data, needToNorm) {

        	var regionIdIndex = -1;
        	var valueIndex = -1;

        	for (var i = 0; i < data.columns.length; i++) {
        		if (data.columns[i].name == 'RegionId')
        			regionIdIndex = i;

        		if (data.columns[i].name == 'Value')
        			valueIndex = i;
        	}

        	var rawData = {};
        	var minValue = Number.POSITIVE_INFINITY;
        	var maxValue = Number.NEGATIVE_INFINITY;

        	var rowCount = Math.floor(data.data.length / data.columns.length);
        	for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        		var rowOffset = rowIndex * data.columns.length;
        		var value = data.data[rowOffset + valueIndex];

        		rawData[data.data[rowOffset + regionIdIndex]] = value;

        		if (value < minValue)
        			minValue = value;
        		if (value > maxValue)
        			maxValue = value;
        	}

        	var normData = {};
        	if(needToNorm)
        		for (var regionId in rawData)
        			normData[regionId] = ((rawData[regionId] - minValue) / (maxValue - minValue)) * 100;
        	else
        		normData = rawData;

        	var coloredData = {};
        	for (var regionId in normData)
        		coloredData[regionId] = this.percentToRGB(normData[regionId]);

        	if (!this.hasGeoJson) {
        		this.hasGeoJson = true;
        		this.map.data.loadGeoJson('senegal.json');
        	}
        	this.map.data.revertStyle();

        	this.map.data.setStyle(function (feature) {

        		var color = coloredData[feature.getProperty('Id')];
        		if (color)
        			return {
        				fillColor: color,
        				fillOpacity: '0.3',
        				strokeWeight: 1,
        				strokeColor: '#000',
        				visible: true
        			};
        		else
        			return {
        				visible: false
        			};
        	});
        };

        Application.prototype.percentToRGB = function (percent) {

        	percent = 100 - percent;
        	if (percent === 100) {
        		percent = 99;
        	}
        	var r, g, b;
        	if (percent < 50) {
        		// green to yellow
        		r = Math.floor(255 * (percent / 50));
        		g = 255;
        	}
        	else {
        		// yellow to red
        		r = 255;
        		g = Math.floor(255 * ((50 - percent % 50) / 50));
        	}
        	b = 0;
        	return "rgb(" + r + "," + g + "," + b + ")";
        };

        Application.prototype.getDataSenedalGlobal = function () {

        	var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=SECPI2016';
        	var descriptor = {
        		"Header": [{
        			"DimensionId": "Time",
        			"Members": ["2014"],
        			"UiMode": "individualMembers"
        		}],
        		"Stub": [{
        			"DimensionId": "indicator",
        			"Members": ["1000020", "1000030", "1000040", "1000050", "1000060", "1000070", "1000360", "1000370", "1000380", "1000710", "1000720", "1000730", "1000740", "1000800", "1000810", "1000820", "1001100", "1001110", "1001120", "1001130"]
        		}],
        		"Filter": [{
        			"DimensionId": "measure",
        			"Members": ["1000000"]
        		}],
        		"Frequencies": ["A"],
        		"Dataset": "SECPI2016"
        	};

        	return $.post(url, descriptor);
        };

        Application.prototype.getDataSenegalRealisation = function () {

        	var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=PSEIDS2016V1';
        	var description = {
        		"Header": [{
        			"DimensionId": "Time",
        			"Members": ["2014", "2015"],
        			"UiMode": "individualMembers"
        		}],
        		"Stub": [{
        			"DimensionId": "indicateur",
        			"Members": ["1002690", "1002730", "1002760", "1002800"]//"1000020", "1000030", "1000070", "1000080", "1000180", "1000200", "1000210", "1000220", "1000230", "1000240", "1000360", "1000370", "1000380", "1000420", "1000430", "1000440", "1000460", "1000470", "1000480", "1000490", "1000510", "1000620", "1000630", "1000640", "1000650", "1000660", "1000670", "1000680", "1000710", "1000720", "1000730", "1000740", "1000850", "1000860", "1000870", "1000880", "1000890", "1000900", "1000910", "1001000", "1001070", "1001080", "1001100", "1001160", "1001170", "1001190", "1001200", "1001210", "1001230", "1001240", "1001250", "1001260", "1001270", "1001280", "1001290", "1001310", "1001320", "1001330", "1001360", "1001390", "1001400", "1001410", "1001420", "1001430", "1001450", "1001460", "1001470", "1001480", "1001490", "1001500", "1001510", "1001520", "1001530", "1001540", "1001550", "1001560", "1001570", "1001580", "1001590", "1001600", "1001630", "1001650", "1001660", "1001670", "1001680", "1001690", "1001700", "1001710", "1001720", "1001730", "1001750", "1001760", "1001770", "1001780", "1001790", "1001800", "1001810", "1001820", "1001840", "1001850", "1001860", "1001870", "1001880", "1001890", "1002560", "1002530", "1002500", "1001900", "1001910", "1001920", "1001930", "1001950", "1002030", "1002080", "1002110", "1002120", "1002270", "1002280", "1002290", "1002300", "1002310", "1002320", "1002330", "1002340", "1002350", "1002360", "1002370", "1002380", "1002390", "1002400", "1002410", "1002420", "1002430", "1002440", "1002450", "1002460", "1002470", "1002480", "1002490", "1002500", "1002530", "1002540", "1002560", "1002570", "1002580", "1002590", "1002600", "1002610", "1002630", "1002670", "1002680", "1002690", "1002700", "1002710", "1002720", "1002730", "1002740", "1002750", "1002760", "1002770", "1002780", "1002790", "1002800", "1002810", "1002820", "1002830", "1002840"]
        		}],
        		"Filter": [{
        			"DimensionId": "mesure",
        			"Members": ["1000010"]
        		}],
        		"Frequencies": ["A"],
        		"Dataset": "PSEIDS2016V1"
        	};

        	return $.post(url, description);
        };

        Application.prototype.showSenegalPanel = function () {

        	var _this = this;
        	$.when(this.getDataSenedalGlobal(), this.getDataSenegalRealisation()).done(function (globalPivot, realisationPivot) {

        		//_this.globalData = globalPivot[0];

        		var nameIndex = -1;
        		var valueIndex = -1;

        		//for (var i = 0; i < _this.globalData.columns.length; i++) {
        		//	if (_this.globalData.columns[i].dimensionId == 'indicator' && _this.globalData.columns[i].name == 'EnglishName')
        		//		nameIndex = i;

        		//	if (_this.globalData.columns[i].name == 'Value')
        		//		valueIndex = i;
        		//}

        		//var globalData = {};

        		//var rowCount = Math.floor(_this.globalData.data.length / _this.globalData.columns.length);
        		//for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        		//	var rowOffset = rowIndex * _this.globalData.columns.length;

        		//	globalData[_this.globalData.data[rowOffset + nameIndex]] = _this.globalData.data[rowOffset + valueIndex];
        		//}

        		//var globalT = doT.template($('#senegal-profile').html());
        		//$('#senegal-right-hand-panel .global-indicators tbody').html(globalT(globalData));


        		_this.realizeData = realisationPivot[0];

        		nameIndex = -1;
        		valueIndex = -1;
        		var dateIndex = -1;

        		for (var i = 0; i < _this.realizeData.columns.length; i++) {
        			if (_this.realizeData.columns[i].dimensionId == 'indicateur' && _this.realizeData.columns[i].name == 'Indicateur')
        				nameIndex = i;

        			if (_this.realizeData.columns[i].name == 'Value')
        				valueIndex = i;

        			if (_this.realizeData.columns[i].name == 'Date')
        				dateIndex = i;
        		}

        		var realizeData = [];
        		rowCount = Math.floor(_this.realizeData.data.length / _this.realizeData.columns.length);
        		for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        			var rowOffset = rowIndex * _this.realizeData.columns.length;

        			if (!realizeData[_this.realizeData.data[rowOffset + nameIndex]])
        				realizeData[_this.realizeData.data[rowOffset + nameIndex]] = {};

        			var year = _this.realizeData.data[rowOffset + dateIndex].value.split('/')[2];

        			realizeData[_this.realizeData.data[rowOffset + nameIndex]][year] = _this.realizeData.data[rowOffset + valueIndex];
        		}

        		var realizeTData = [];
        		for (var indicator in realizeData) {
        			var coeff = (((parseFloat(realizeData[indicator]['2015']) - parseFloat(realizeData[indicator]['2014'])) / parseFloat(realizeData[indicator]['2015'])) * 100).toFixed(2);

        			realizeTData.push($('<tr>')
						.append($('<td>', { text: indicator }))
						.append($('<td>', { text: realizeData[indicator]['2015'] }))
						.append($('<td>', { text: coeff }))
        			);
        		}
        		$('#senegal-right-hand-panel .realisation-indicators tbody').append(realizeTData);


        		var axeData = { '1': 0, '2': 0, '3': 0 };
        		rowCount = Math.floor(_this.projectData.length / _this.projectColumns.length);
        		for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        			var rowOffset = rowIndex * _this.projectColumns.length;

        			if (_this.projectData[rowOffset + _this.objectTypeIndex] == 'P')
        				axeData[_this.projectData[rowOffset + _this.pseIndex]] += 1;
        		}

        		var axeTrs = [];
        		axeTrs.push($('<tr>').append($('<td>', { text: axes['1'] })).append($('<td>', { text: axeData['1'] })));
        		axeTrs.push($('<tr>').append($('<td>', { text: axes['2'] })).append($('<td>', { text: axeData['2'] })));
        		axeTrs.push($('<tr>').append($('<td>', { text: axes['3'] })).append($('<td>', { text: axeData['3'] })));
        		$('#senegal-right-hand-panel .axe-summ tbody').append(axeTrs);

				
        		var PPData = {};
        		var budgetData = {};
        		rowCount = Math.floor(_this.projectData.length / _this.projectColumns.length);
        		for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        			var rowOffset = rowIndex * _this.projectColumns.length;

        			if (_this.projectData[rowOffset + _this.objectTypeIndex] != 'P')
        				continue;

        			if (!PPData[_this.projectData[rowOffset + _this.ppIndex]])
        				PPData[_this.projectData[rowOffset + _this.ppIndex]] = 0;

        			PPData[_this.projectData[rowOffset + _this.ppIndex]] += 1;

        			if (!budgetData[_this.projectData[rowOffset + _this.ppIndex]])
        				budgetData[_this.projectData[rowOffset + _this.ppIndex]] = 0;

        			budgetData[_this.projectData[rowOffset + _this.ppIndex]] += parseFloat((_this.projectData[rowOffset + _this.budgetIndex] ? _this.projectData[rowOffset + _this.budgetIndex] : 0), 10);
        		}

        		var PPSortedData = [];
        		for (var i = 1; i <= 27; i++) {
        			var pp = 'PP' + i;

        			if (!PPData[pp] && !budgetData[pp])
        				continue;

        			PPSortedData.push([pp, PPData[pp], budgetData[pp], (i <10 ? '0' + i : i)]);
        		}

        		PPSortedData.sort(function (n1, n2) {
        			return n2[2] - n1[2];
        		});

        		var ppTrs = [];
        		for (var i = 0; i < PPSortedData.length; i++) {
        			ppTrs.push($('<tr>')
						.append($('<td>').append($('<img src="./img/right-panel/icons-' + PPSortedData[i][3] + '.png" class="pp-image-small">')))
						.append($('<td>', { text: PPSortedData[i][0] }))
						.append($('<td>', { text: PPSortedData[i][1] }))
						.append($('<td>', { text: PPSortedData[i][2] }))
					);
        		}
        		$('#senegal-right-hand-panel .pp-summ tbody').append(ppTrs);


        		var reformsData = {
        			'Environnement des affaires et régulation': 0,
        			'Infrastructures': 0,
        			'Capital Humain': 0,
        			'Economie numérique': 0,
        			'Financement de l’économie': 0
        		};
        		rowCount = Math.floor(_this.projectData.length / _this.projectColumns.length);
        		for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        			var rowOffset = rowIndex * _this.projectColumns.length;

        			if (_this.projectData[rowOffset + _this.objectTypeIndex] != 'R')
        				continue;

        			reformsData[_this.projectData[rowOffset + _this.reformIndex]] += 1;
        		}

        		var reformTrs = [];
        		for (var ref in reformsData) {
        			reformTrs.push($('<tr>').append($('<td>', { text: ref })).append($('<td>', { text: reformsData[ref] })));
        		}
        		$('#senegal-right-hand-panel .reforms-groups tbody').append(reformTrs);

        		_this.senegalTabIsLoaded = true;
        	});
        };

        Application.prototype.getParameterByName = function (name) {

        	var url = window.location.href;
        	name = name.replace(/[\[\]]/g, "\\$&");

        	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
        	var results = regex.exec(url);

        	if (!results)
        		return null;
        	if (!results[2])
        		return '';

        	return decodeURIComponent(results[2].replace(/\+/g, " "));
        };

        Application.prototype.showPreloadedObject = function () {

        	var _this = this;
        	this.markers.forEach(function (marker) {

        		var code = marker.get('code');
        		if (code == _this.preloadedObject)
        			new google.maps.event.trigger(marker, 'click');
        	});
        };

        Application.prototype.showRightPanelForObjectCode = function(code) {

        	var getProjectByObjectCode = function (code) {
        		var res = [];
        		var unicPP = [];

        		for (var i = 0; i < _this.projectData.length / _this.projectColumns.length; i++) {

        			var offset = i * _this.projectColumns.length;

        			//only for projects
        			if (_this.projectData[offset + _this.objectTypeIndex] != 'P')
        				continue;

        			if (_this.projectData[offset + _this.objectsIndex] != code)
        				continue;

        			if ($.inArray(_this.projectData[offset + _this.ppIndex], unicPP) != -1)
        				continue;

        			unicPP.push(_this.projectData[offset + _this.ppIndex]);

        			res.push({
        				pp: _this.projectData[offset + _this.ppIndex],
        				name: _this.projectData[offset + _this.nameIndex],
        				status: _this.projectData[offset + _this.statusIndex],
        			});
        		}

        		return res;
        	};

        	var _this = this;
        	var projects = getProjectByObjectCode(code);
        	var $trs = [];
        	var $rhp = $('#right-hand-panel');
        	$rhp.find('tbody').empty();
        	if (projects.length > 0) {
        		for (var i = 0; i < projects.length; i++) {

        			var ppNumber = '00';
        			if (projects[i].pp.length == 4)
        				ppNumber = projects[i].pp.substr(2, 3);
        			else if (projects[i].pp.length == 3)
        				ppNumber = '0' + projects[i].pp.substr(2, 3);

        			$trs.push($('<tr>', { 'data-name': projects[i].name })
						.append($('<td>').append($('<img>', { src: './img/right-panel/icons-' + ppNumber + '.png', 'class': 'pp-image-small' })))
						.append($('<td>', { text: projects[i].pp }))
						.append($('<td>', { text: projects[i].name }))
						.append($('<td>', { text: projects[i].status }))
					);
        		}

        		$rhp.find('tbody').append($trs);

        		$rhp.find('tr').on('click', function () {
        			var name = $(this).data('name');

        			_this.markers.forEach(function (marker) {

        				var tooltip = marker.get('tooltip');
        				if (tooltip[_this.projectColumns[_this.nameIndex].name] == name)
        					new google.maps.event.trigger(marker, 'click');
        			});
        		});
        	}

        	$rhp.show();
        	$('#map-canvas').css({ right: '350px' });
        	google.maps.event.trigger(_this.map, 'resize');
        };

        return Application;
    })();

    google.maps.event.addDomListener(window, 'load', function () {
        var greeter = new Application();
        greeter.run();
    });
})(Infrastructure || (Infrastructure = {}));
//# sourceMappingURL=app.js.map