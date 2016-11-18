/// <reference path="typings/jquery.d.ts"/>
/// <reference path="typings/google.maps.d.ts"/>

var Infrastructure;
(function (Infrastructure) {
	var host = 'http://namibiagpt.knoema.com';

	var projectsDataset = 'voqoeh';
	var objectsDataset = 'nrlbgwc';

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
		'1': 'Pillar 1. Effective Governance and Service Delivery',
		'2': 'Pillar 2. Economic Advancement',
		'3': 'Pillar 3. Social Progression',
		'4': 'Pillar 4. Infrastructure Development',
		'5': 'Pillar 5. International Relations and Cooperation',
	};
	var axes_2 = {
		'1': 'Effective Governance and Service Delivery',
		'2': 'Economic Advancement',
		'3': 'Social Progression',
		'4': 'Infrastructure Development',
		'5': 'International Relations and Cooperation',
	};

	var sectors = {
		'100': 'Ensure sufficient water supply reserves for business activity, including industrialisation, residential land servicing and housing development during the Harambee period',
		'101': 'Craft',
		'102': 'Trade',
		'103': 'Communication, Infrastructure and Telecommunications services',
		'104': 'International Cooperation, Regional Integration and SE',
		'105': 'Culture',
		'106': 'Breeding',
		'107': 'Increase access to finance by Micro, Small and Medium Enterprises from 22 percent to 50 percent by 2020',
		'108': 'Financial Infrastructure and Financial Services',
		'109': 'Twenty six thousand (26,000) new residential plots will be serviced country wide during the Harambee period',
		'110': 'Economic empowerment leading to higher inclusion of disadvantaged groups into formal economy',
		'111': 'Mining and quarrying',
		'112': 'Fisheries and aquaculture',
		'113': 'Private Sector and SMEs',
		'114': 'Sports',
		'115': 'Tourism',
		'200': 'Drinking Water and Sanitation (EPA)',
		'201': 'Education',
		'202': 'Employment, Youth, Population and Development',
		'203': 'Higher Education and Research',
		'204': 'Environment and Sustainable Development',
		'205': 'Vocational and technical training',
		'206': 'Risk Management and Disaster',
		'207': 'There will be a significant reduction in infant and maternal mortality rate by 2020',
		'208': 'Social Protection',
		'209': 'Health and Nutrition',
		'300': 'Public Administration and State Reform',
		'301': 'Regional Planning, Local Development and Territorialisation',
		'302': 'Equity and Gender Equality',
		'303': 'Strategic Governance, Economic and Financial',
		'304': 'Justice, Human Rights and Rule of Law',
		'305': 'Peace and Security',
	};

	var statusIcons = {
		'1': '01-Envisage',
		'Announced': '02-Annonce',
		'3': '03-Entame',
		'In progress': '04-En-cours',
		'Operational': '05-Operationel',
		'6': '06-Complete',
		'7': '07-Finalise'
	};

	var statusMapIcons = {
		'1': '01-Envisage',
		'Announced': '02',
		'3': '03-Entame',
		'In progress': '04',
		'Operational': '05',
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
    	'NA-CA': { lat: -18.0904, lng: 24.4576 },
    	'NA-ER': { lat: -22.2904, lng: 16.0576 },
    	'NA-HA': { lat: -24.4904, lng: 17.9576 },
    	'NA-KA': { lat: -27.1004, lng: 18.5576 },
    	'NA-KH': { lat: -23.0904, lng: 17.9576 },
    	'NA-KU': { lat: -19.1904, lng: 14.9576 },
    	'NA-OD': { lat: -20.4904, lng: 19.5576 },
    	'NA-OH': { lat: -22.0904, lng: 20.4576 },
    	'NA-OK': { lat: -18.2904, lng: 21.1576 },
    	'NA-ON': { lat: -18.4904, lng: 16.3576 },
    	'NA-OS': { lat: -18.4504, lng: 15.3576 },
    	'NA-OT': { lat: -18.6904, lng: 17.3576 },
    	'NA-OW': { lat: -17.7004, lng: 17.2076 }
    };

    var RegionsZoom = {
    	'NA-CA': 9,
    	'NA-ER': 8,
    	'NA-HA': 8,
    	'NA-KA': 8,
    	'NA-KH': 8,
    	'NA-KU': 8,
    	'NA-OD': 8,
    	'NA-OH': 8,
    	'NA-OK': 8,
    	'NA-ON': 9,
    	'NA-OS': 9,
    	'NA-OT': 9,
    	'NA-OW': 9,
    };

    var Application = (function () {
        function Application() {
        }
        Application.prototype.run = function () {
            var _this = this;
            this.markers = [];
            this.infoWindow = new google.maps.InfoWindow();
            this.regionData = [];
            this.senegalData = {};
            this.layerData = {};
            this.layerDataForTooltip = {};
            this.currentLayerName = null;
            this.globalData = {};
            this.realizeData = {};
            this.preloadedObject = this.getParameterByName('code') ? this.getParameterByName('code') : -1;
            this.filterObjects = this.getParameterByName('objects');
            this.hasGeoJson = false;
            this.year = 2016;

            this.axes = axes;
            this.axes_2 = axes_2;
            this.sectors = sectors;

            $('#slider-range').slider({
            	range: true,
            	min: 0,
            	max: 100,
            	values: [0, 100]
            });

            $('#ppp-projects').selectpicker({ size: 10, container: 'body' });
            $('#ppp-projects').on('changed.bs.select', function (e) {
				
            	$('#overviewFilter').trigger('change');
            });

            $('#regions').on('change', function (e) {

            	showRegion();
            });
            //$('#regions').on('click', function (e) {

            //	if (e.offsetY < 0)
            //		showRegion();
            //});

            $('img.export').on('click', function () {

            	_this.export();
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


            $('.year-item').on('click', function () {

            	$('.year-item').removeClass('active');
            	$(this).addClass('active');

            	_this.year = parseInt($(this).data('year'));

            	$('#overviewFilter').trigger('change');

            	var regionId = $('#regions').val();
            	_this.showRegionPanel(regionId);
            	_this.showSenegalPanel();
            });

            this.map = new google.maps.Map(document.getElementById('map-canvas'), {
            	center: { lat: -22.4904, lng: 18.9576 },
                zoom: 6,
                streetViewControl: false,
                zoomControlOptions: {
                	position: google.maps.ControlPosition.LEFT_TOP
                },
                mapTypeId: google.maps.MapTypeId.HYBRID
            });
            this.map.data.addListener('click', $.proxy(this.clickDataLayerListener, this));

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
            		if (name == 'Year') _this.dateIndex = i;
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

            	if (regionId == 'NA' || regionId == -1) {

            		_this.map.setCenter({ lat: -22.4904, lng: 18.9576 });
            		_this.map.setZoom(6);
            		if (_this.infoWindow)
            			_this.infoWindow.close();

            		_this.map.data.revertStyle();
            		_this.map.data.setStyle(function (feature) {

            			if (regionId == 'NA')
            				return {
            					fillColor: '#fff',
            					fillOpacity: '0.3',
            					strokeWeight: 0,
            					strokeColor: '#fff',
            					visible: true
            				};
            			else
            				return {
            					visible: false
            				};
            		});

            		if (regionId == 'NA') {
            			_this.showSenegalPanel();
            			_this.currentLayerName = 'none';

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
            	_this.currentLayerName = 'none';
            	$('input[name=layer]').filter('[value=none]').prop('checked', true);
            	_this.loadGeoJSON();
            	_this.map.data.revertStyle();
            	_this.map.data.setStyle(function (feature) {

            		if (feature.getId()== regionId)
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

            	_this.showRegionPanel(regionId);

            	$rhp.show();
            	$('#map-canvas').css({ right: '350px' });
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

            	_this.loop(_this.projectData, _this.projectColumns, _this.year, function (i, item, columns) {

            		//only for projects
            		if (item[_this.objectTypeIndex] != 'P')
            			return;
					
            		var addObject = true;
            		for (var j in params) {

            			switch (j) {

            				case 'pse':
            					if ($.inArray(item[_this.pseIndex], params[j]) == -1)
            						addObject = false;
            					break;

            				case 'status':
            					if ($.inArray(item[_this.statusIndex], params[j]) == -1)
            						addObject = false;
            					break;

            				case 'plan':
            					var ptipValue = item[_this.ptipIndex] == '' ? 'no' : 'yes';

            					if($.inArray(ptipValue, params[j]) == -1)
            						addObject = false;
            					break;

            				case 'layer':

            					var layerName = params[j][0];
            					_this.currentLayerName = layerName;

            					if (layerName == 'none') {
            						_this.loadGeoJSON();
            						_this.map.data.revertStyle();
            						_this.map.data.setStyle(function (feature) {
            							return { visible: false };
            						});
            						$("#legend").hide();

            						break;
            					}

            					$("#legend").show();

            					var dataLoader = null;
            					switch (layerName) {
            						case 'population':
            							dataLoader = _this.getDataLayerPopulation();
            							break;
            						case 'area':
            							dataLoader = _this.getDataLayerArea();
            							break;
            						case 'density':
            							dataLoader = _this.getDataLayerDensity();
            							break;
            						case 'houshold':
            							dataLoader = _this.getDataLayerHoushold();
            							break;
            					}

            					if (_this.layerData[layerName]) {
            						_this.displayLayerData(layerName, _this.layerData[layerName], true);
            					}
            					else {
            						dataLoader.done(function (data) {

            							_this.layerData[layerName] = data;
            							_this.displayLayerData(layerName, data, true);
            						});
            					}

            					break;
            			}

            			if (!addObject)
            				break;
            		}

            		if (selectedPPName.length > 0 && $.inArray(item[_this.ppIndex], selectedPPName) == -1)
            			addObject = false;

            		if (_this.filterObjects) {
            			if (item[_this.objectsIndex] != _this.filterObjects)
            				addObject = false;
            		}

            		if (addObject) {
            			var tooltipData = {};
            			tooltipData[columns[_this.nameIndex]] = item[_this.nameIndex];
            			tooltipData[columns[_this.pseIndex]] = _this.axes_2[item[_this.pseIndex]];
            			tooltipData[columns[_this.sectorIndex]] = _this.sectors[item[_this.sectorIndex]];
            			tooltipData[columns[_this.statusIndex]] = item[_this.statusIndex];
            			tooltipData[columns[_this.ppIndex]] = $('#ppp-projects').find('option[value=' + item[_this.ppIndex] + ']').text();;
            			tooltipData[columns[_this.ptipIndex]] = item[_this.ptipIndex];
            			tooltipData[columns[_this.localeIndex]] = item[_this.localeIndex];
            			tooltipData[columns[_this.budgetIndex]] = item[_this.budgetIndex];

            			filtredProjects[item[_this.databaseCodeIndex]] = tooltipData;
            		}
            	});

            	var locales = {};
            	_this.loop(_this.objectData, _this.objectColumns, null, function (i, item) {

            		if (!locales[item[_this.databaseCodeIndex_O]])
            			locales[item[_this.databaseCodeIndex_O]] = [];

            		locales[item[_this.databaseCodeIndex_O]].push(item[_this.latIndex] + ', ' + item[_this.lngIndex]);
            	});

            	_this.loop(_this.objectData, _this.objectColumns, null, function (i, item) {

            		var tooltip = filtredProjects[item[_this.databaseCodeIndex_O]];
            		if (tooltip) {

            			tooltip['locales'] = locales[item[_this.databaseCodeIndex_O]].join('; ');

            			filtredObjects.push({
            				lat: item[_this.latIndex],
            				lng: item[_this.lngIndex],
            				tooltip: tooltip,
            				code: item[_this.databaseCodeIndex_O]
            			});
            		}
            	});
            	
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

        	var _this = this;
        	var presented = [];
        	this.loop(this.projectData, this.projectColumns, null, function (i, item) {

        		var pp = item[_this.ppIndex];

        		if ($.inArray(pp, presented) == -1)
        			presented.push(pp);
        	});

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

        Application.prototype.clearMarkers = function () {
            if (Array.isArray(this.markers)) {
                this.markers.forEach(function(marker) {
                    marker.setMap(null);
                });
                this.markers = null;
            }
        };

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
        		html += '<div style="max-width: 300px;"><label>Project Name:</label><br />' + (tooltipData['Nom Projet'] == null ? '' : tooltipData['Nom Projet']) + '</div>';
        		html += '</div>';

        		html += '<div class="data-block col1">';

        		html += '<div><label>Coordinates:</label><br />' + tooltipData['locales'] + '</div>';
        		html += '<div><label>Total Planned Budget:</label><br />' + (tooltipData['Budget Total Prévu: Dépenses Prévues'] == null ? '0' : tooltipData['Budget Total Prévu: Dépenses Prévues']) + '</div>';
        		html += "<div><label>Harambee Prosperity Plan Pillar:</label><br />" + (tooltipData["Code de l'axe stratégique de la vision 2035"] == null ? '' : tooltipData["Code de l'axe stratégique de la vision 2035"]) + '</div>';

        		html += '</div>';

        		html += '<div class="data-block col2">';

        		html += '<div><label>HARAMBEE TARGET:</label><br />' + (tooltipData['Code du Sous-Secteur (voir feuille Read me pour avoir les codes)'] == null ? '' : tooltipData['Code du Sous-Secteur (voir feuille Read me pour avoir les codes)']) + '</div>';
        		html += '<div><label>Harambee Prosperity Plan:</label><br />' + (tooltipData['Numéro du projet phare / numéro de la réforme phare. (PP# / RP#)'] == null ? '' : tooltipData['Numéro du projet phare / numéro de la réforme phare. (PP# / RP#)']) + '</div>';
        		html += '<div><label>Code HPP:</label><br />' + (tooltipData['Code PTIP'] == null ? '' : tooltipData['Code PTIP']) + '</div>';
        		html += '<div><label>Expenses Incurred:</label><br />' + (tooltipData['Budget Total Prévu: Dépenses Prévues'] == null ? '0' : tooltipData['Budget Total Prévu: Dépenses Prévues']) + '</div>';
        		

        		html += '</div>';

        		html += '</div>';

        		html += '<a href="#" data-data="' + encodeURI(JSON.stringify(tooltipData)) + '" class="opp-button">Project Passport</a>';

        		html += '</div>';

        		self.infoWindow.setContent(html);
        		self.infoWindow.open(self.map);

        		$('.opp-button').on('click', function () {
        			var objData = decodeURI($(this).data('data'));
        			objData = JSON.parse(objData);

        			var templateData = {
        				nameEn: objData["Nom Projet"].split('é').join('e').split('à').join('a').split('ï').join('i').split('è').join('e'),
        				name: objData["Nom Projet"],
        				budget: (objData["Budget Total Prévu: Dépenses Prévues"] ? objData["Budget Total Prévu: Dépenses Prévues"] : 0),
        				axe: objData["Code de l'axe stratégique de la vision 2035"],
        				sour: objData["Code du Sous-Secteur (voir feuille Read me pour avoir les codes)"],
        				number: objData["Numéro du projet phare / numéro de la réforme phare. (PP# / RP#)"],
        				statusIcon: statusIcons[status],
        				status: status,
        				ptip: objData["Code PTIP"],
        				locale: objData["locales"],
        			};
					
        			var template = doT.template($('#new-object-passport').html());
        			var template_b = doT.template($('#new-object-budgetting').html());

        			$('#new-project-passport .passport__content__new').empty().html(template(templateData));
        			$('#new-project-passport .passport__content__new__b').empty().html(template_b({ name: objData["Nom Projet"] }));
        			$('#new-project-passport').show();

        			self.pushPassportContentToExportForm();

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

        			$('.status-button').on('click', function () {

        				self.export();
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
        		marker.setIcon('img/status/' + statusMapIcons[data[i].tooltip['Statut Projets: Annoncé, En cours, Complété, opérationel Programmes/reformes: En']] + '.png');
        		marker.addListener('click', markerClickHandler);

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
        		$.when(self.getRegionsData(), self.getRegionsData2()).done(function (regionData1, regionData2) {

        			self.loop(regionData1[0].data, regionData1[0].columns, null, function (i, item) {

        				self.regionData.push({ regionId: item[1], indicator: item[5], value: item[13] * 1 });
        			});

        			self.loop(regionData2[0].data, regionData2[0].columns, null, function (i, item) {

        				self.regionData.push({ regionId: item[1], indicator: item[5], value: item[6] * 1 });
        			});
        			
        			callback(filterByRegion(regionId));
        		});
        	}
        	else {
        		callback(filterByRegion(regionId));
        	}
        };

        Application.prototype.getRegionsData = function () {

        	return $.post('http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif', {
        		"Header": [{
        			"DimensionId": "Time",
        			"Members": ["2012"],
        			"UiMode": "individualMembers"
        		}],
        		"Stub": [{
        			"DimensionId": "indicator",
        			"Members": ["1001180", "1001060", "1000880", "1000210", "1000050"]
        		}, {
        			"DimensionId": "region",
        			"Members": ["1000010", "1000020", "1000030", "1000040", "1000050", "1000060", "1000070", "1000080", "1000090", "1000100", "1000110", "1000120", "1000130"]
        		}, {
        			"DimensionId": "zone",
        			"Members": ["1000000"]
        		}, {
        			"DimensionId": "sex",
        			"Members": ["1000000"]
        		}, {
        			"DimensionId": "age-group",
        			"Members": ["1000000"]
        		}, {
        			"DimensionId": "measure",
        			"Members": ["1000000"]
        		}],
        		"Filter": [],
        		"Frequencies": ["A"],
        		"Dataset": "NLFSD2015"
        	});
        };
        Application.prototype.getRegionsData2 = function () {

        	return $.post('http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif', {
        		"Header": [{
        			"DimensionId": "Time",
        			"Members": ["2011"],
        			"UiMode": "individualMembers"
        		}],
        		"Stub": [{
        			"DimensionId": "region",
        			"Members": ["1000010", "1000080", "1000160", "1000230", "1000300", "1000400", "1000510", "1000580", "1000700", "1000780", "1000910", "1001020", "1001130"]
        		}, {
        			"DimensionId": "variable",
        			"Members": ["1000010", "1000040", "1000050", "1000060", "1000070"]
        		}],
        		"Filter": [],
        		"Frequencies": ["A"],
        		"Dataset": "dcrhbbb"
        	});
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

        	return $.post('https://knoema.com' + '/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=SERSSD2011', {
        		"Header": [{
        			"DimensionId": "Time",
        			"Members": ["2011"],
        			"UiMode": "individualMembers"
        		}],
        		"Stub": [{
        			"DimensionId": "region",
        			"Members": ["1000010", "1000080", "1000160", "1000230", "1000300", "1000400", "1000510", "1000580", "1000700", "1000780", "1000910", "1001020", "1001130"]
        		}],
        		"Filter": [{
        			"DimensionId": "variable",
        			"Members": ["1000010"]
        		}],
        		"Frequencies": ["A"],
        		"Dataset": "dcrhbbb"
        	});
        };

        Application.prototype.getDataLayerArea = function () {

        	return $.post('https://knoema.com' + '/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=SERSSD2011', {
        		"Header": [{
        			"DimensionId": "Time",
        			"Members": ["2011"],
        			"UiMode": "individualMembers"
        		}],
        		"Stub": [{
        			"DimensionId": "region",
        			"Members": ["1000010", "1000080", "1000160", "1000230", "1000300", "1000400", "1000510", "1000580", "1000700", "1000780", "1000910", "1001020", "1001130"]
        		}],
        		"Filter": [{
        			"DimensionId": "variable",
        			"Members": ["1000060"]
        		}],
        		"Frequencies": ["A"],
        		"Dataset": "dcrhbbb"
        	});
        };

        Application.prototype.getDataLayerDensity = function () {

        	return $.post('https://knoema.com' + '/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=SEDHSMI2011', {
        		"Header": [{
        			"DimensionId": "Time",
        			"Members": ["2011"],
        			"UiMode": "individualMembers"
        		}],
        		"Stub": [{
        			"DimensionId": "region",
        			"Members": ["1000010", "1000080", "1000160", "1000230", "1000300", "1000400", "1000510", "1000580", "1000700", "1000780", "1000910", "1001020", "1001130"]
        		}],
        		"Filter": [{
        			"DimensionId": "variable",
        			"Members": ["1000070"]
        		}],
        		"Frequencies": ["A"],
        		"Dataset": "dcrhbbb"
        	});
        };

        Application.prototype.getDataLayerHoushold = function () {

        	return $.post('https://knoema.com' + '/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=SEIPC2006', {
        		"Header": [{
        			"DimensionId": "Time",
        			"Members": ["2011"],
        			"UiMode": "individualMembers"
        		}],
        		"Stub": [{
        			"DimensionId": "region",
        			"Members": ["1000010", "1000080", "1000160", "1000230", "1000300", "1000400", "1000510", "1000580", "1000700", "1000780", "1000910", "1001020", "1001130"]
        		}],
        		"Filter": [{
        			"DimensionId": "variable",
        			"Members": ["1000130"]
        		}],
        		"Frequencies": ["A"],
        		"Dataset": "dcrhbbb"
        	});
        };

        Application.prototype.displayLayerData = function (layer, data, needToNorm) {

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


        	this.loop(data.data, data.columns, null, function (i, item) {

        		var value = item[valueIndex];

        		rawData[item[regionIdIndex]] = value;

        		if (value < minValue)
        			minValue = value;
        		if (value > maxValue)
        			maxValue = value;
        	});

        	if (!this.layerDataForTooltip[layer])
        		this.layerDataForTooltip[layer] = rawData;

        	var normData = {};
        	if(needToNorm)
        		for (var regionId in rawData)
        			normData[regionId] = ((rawData[regionId] - minValue) / (maxValue - minValue)) * 100;
        	else
        		normData = rawData;

        	var coloredData = {};
        	for (var regionId in normData)
        		coloredData[regionId] = this.percentToRGB(normData[regionId]);

        	this.loadGeoJSON();
        	this.map.data.revertStyle();

        	this.map.data.setStyle(function (feature) {

        		var color = coloredData[feature.getId()];
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

        	return $.post('http://namibia.opendataforafrica.org/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=PSEIDS2016V1', {
        		"Header": [{
        			"DimensionId": "Time",
        			"Members": ["2011", "2012"],
        			"UiMode": "individualMembers"
        		}],
        		"Stub": [{
        			"DimensionId": "indicator",
        			"Members": ["1003690", "1000290", "1000100", "1001000"]
        		}],
        		"Filter": [],
        		"Frequencies": ["A"],
        		"Dataset": "NANA2015"
        	});
        };

        Application.prototype.getProjectByRegion = function(regionId) {

        	var _this = this;
        	var res = [];
        	var dbCodes = [];

        	_this.loop(_this.objectData, _this.objectColumns, null, function (i, item) {

        		if (regionId != item[_this.regionIdIndex])
        			return;

        		var code = item[_this.databaseCodeIndex_O];
        		if ($.inArray(code, dbCodes) == -1)
        			dbCodes.push(code);
        	});

        	_this.loop(_this.projectData, _this.projectColumns, _this.year, function (i, item) {

        		var dbcode = parseInt(item[_this.databaseCodeIndex]);

        		//only for projects
        		if (item[_this.objectTypeIndex] != 'P')
        			return;

        		if ($.inArray(dbcode, dbCodes) == -1)
        			return;

        		res.push({
        			pp: item[_this.ppIndex],
        			name: item[_this.nameIndex],
        			status: item[_this.statusIndex],
        		});
        	});

        	return res;
        };

        Application.prototype.showRegionPanel = function (regionId) {

        	var _this = this;
        	var $rhp = $('#right-hand-panel');

        	var regionName = $('#regions option[value=' + regionId + ']').text();
        	$rhp.find('.region-name').text(regionName);

        	var projects = this.getProjectByRegion(regionId);
        	var $trs = [];
        	$rhp.find('tbody').empty();
        	if (projects.length > 0) {
        		$('.table-container').show();

        		for (var i = 0; i < projects.length; i++) {

        			var ppNumber = '00';
        			if (projects[i].pp.length == 5)
        				ppNumber = projects[i].pp.substr(3, 4);
        			else if (projects[i].pp.length == 4)
        				ppNumber = '0' + projects[i].pp.substr(3, 4);

        			$trs.push($('<tr>', { 'data-name': projects[i].name })
						.append($('<td>').append($('<img>', { src: './img/right-panel/' + ppNumber + '.png', 'class': 'pp-image-small' })))
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
        	else {
        		$('.table-container').hide();
        	}

        	this.getRegionData(regionId, function (data) {

        		var dataForDisplay = {};
        		for (var indicator in data)
        			dataForDisplay[indicator] = _this.formatNumberUS(data[indicator]);

        		var regionData = doT.template($('#region-profile').html());
        		$('#region-data').empty().append(regionData({
        			indicatorData: dataForDisplay
        		}));

        		_this.pushRightPanelContentToExportForm($rhp, regionName);
        	});
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
        			if (_this.realizeData.columns[i].dimensionId == 'indicator' && _this.realizeData.columns[i].name == 'Indicator')
        				nameIndex = i;

        			if (_this.realizeData.columns[i].name == 'Value')
        				valueIndex = i;

        			if (_this.realizeData.columns[i].name == 'Date')
        				dateIndex = i;
        		}

        		var realizeData = [];
        		_this.loop(_this.realizeData.data, _this.realizeData.columns, null, function (i, item) {

        			if (!realizeData[item[nameIndex]])
        				realizeData[item[nameIndex]] = {};

        			var year = item[dateIndex].value.split('/')[2];

        			realizeData[item[nameIndex]][year] = item[valueIndex];
        		});

        		var realizeTData = [];
        		for (var indicator in realizeData) {
        			var coeff = (((parseFloat(realizeData[indicator]['2012']) - parseFloat(realizeData[indicator]['2011'])) / parseFloat(realizeData[indicator]['2012'])) * 100).toFixed(2);

        			realizeTData.push($('<tr>')
						.append($('<td>', { text: indicator }))
						.append($('<td>', { text: _this.formatNumberUS(realizeData[indicator]['2012'].toFixed(2)) }))
						.append($('<td>', { text: _this.formatNumberUS(coeff) }))
        			);
        		}
        		$('#senegal-right-hand-panel .realisation-indicators tbody').empty().append(realizeTData);


        		var axeData = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
        		var unicNames = [];
        		_this.loop(_this.projectData, _this.projectColumns, null, function (i, item) {

        			if ($.inArray(item[_this.nameIndex], unicNames) != -1)
        				return;

        			unicNames.push(item[_this.nameIndex]);

        			if (item[_this.objectTypeIndex] == 'P')
        				axeData[item[_this.pseIndex]] += 1;
        		});

        		var axeTrs = [];
        		axeTrs.push($('<tr>').append($('<td>', { text: axes['1'] })).append($('<td>', { text: axeData['1'] })));
        		axeTrs.push($('<tr>').append($('<td>', { text: axes['2'] })).append($('<td>', { text: axeData['2'] })));
        		axeTrs.push($('<tr>').append($('<td>', { text: axes['3'] })).append($('<td>', { text: axeData['3'] })));
        		axeTrs.push($('<tr>').append($('<td>', { text: axes['4'] })).append($('<td>', { text: axeData['4'] })));
        		axeTrs.push($('<tr>').append($('<td>', { text: axes['5'] })).append($('<td>', { text: axeData['5'] })));
        		$('#senegal-right-hand-panel .axe-summ tbody').empty().append(axeTrs);

				
        		var PPData = {};
        		var budgetData = {};
        		_this.loop(_this.projectData, _this.projectColumns, _this.year, function (i, item) {

        			if (item[_this.objectTypeIndex] != 'P')
        				return;

        			if (!PPData[item[_this.ppIndex]])
        				PPData[item[_this.ppIndex]] = 0;

        			PPData[item[_this.ppIndex]] += 1;

        			if (!budgetData[item[_this.ppIndex]])
        				budgetData[item[_this.ppIndex]] = 0;

        			budgetData[item[_this.ppIndex]] += parseFloat((item[_this.budgetIndex] ? item[_this.budgetIndex] : 0), 10);
        		});

        		var PPSortedData = [];
        		for (var i = 1; i <= 15; i++) {
        			var pp = 'HPP' + i;

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
						.append($('<td>').append($('<img src="./img/right-panel/' + PPSortedData[i][3] + '.png" class="pp-image-small">')))
						.append($('<td>', { text: PPSortedData[i][0] }))
						.append($('<td>', { text: PPSortedData[i][1] }))
						.append($('<td>', { text: _this.formatNumberUS(PPSortedData[i][2]) }))
					);
        		}
        		$('#senegal-right-hand-panel .pp-summ tbody').empty().append(ppTrs);


        		var reformsData = {
        			'Business environment and regulation': 0,
        			'Infrastructures': 0,
        			'Human capital': 0,
        			'Digital economy': 0,
        			'Financing of the economy': 0
        		};
        		_this.loop(_this.projectData, _this.projectColumns, null, function(i, item){
        			if (item[_this.objectTypeIndex] != 'R')
        				return;

        			reformsData[item[_this.reformIndex]] += 1;
        		});

        		var reformTrs = [];
        		for (var ref in reformsData)
        			reformTrs.push($('<tr>').append($('<td>', { text: ref })).append($('<td>', { text: reformsData[ref] })));

        		$('#senegal-right-hand-panel .reforms-groups tbody').empty().append(reformTrs);

        		_this.pushRightPanelContentToExportForm($('#senegal-right-hand-panel'), 'Namibia');
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

        		_this.loop(_this.projectData, _this.projectColumns, null, function (i, item) {

        			//only for projects
        			if (item[_this.objectTypeIndex] != 'P')
        				return;

        			if (item[_this.objectsIndex] != code)
        				return;

        			if ($.inArray(item[_this.ppIndex], unicPP) != -1)
        				return;

        			unicPP.push(item[_this.ppIndex]);

        			res.push({
        				pp: item[_this.ppIndex],
        				name: item[_this.nameIndex],
        				status: item[_this.statusIndex],
        			});
        		});

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

        Application.prototype.pushRightPanelContentToExportForm = function (container, fileName) {

        	var clone = container.clone();
        	clone.find('.panel-title img.export').remove();
        	clone.find('.close-button').remove();
        	clone.wrap('<div></div>')

        	var content = clone.parent().html();
        	content = content.split('./').join(location.protocol + '//' + location.host + '/nnamibiagpt/');

        	var template = doT.template($('#export-content').html());
        	$('#export-form [name=content]').val(template({
        		content: content
        	}));
        	$('#export-form [name=fileName]').val(fileName);
        	$('#export-form [name=landscape]').val('FALSE');
        };

        Application.prototype.pushPassportContentToExportForm = function () {

        	var firstPage = $('.passport__content__new').clone().wrap('<div></div>').parent();
        	var secondPage = $('.passport__content__new__b').clone().wrap('<div></div>').parent();

        	firstPage.find('.status-button').remove();

        	var content = firstPage.html();// + '<div style="page-break-before: always"></div>' + secondPage.html();
        	content = content.split('./').join(location.protocol + '//' + location.host + '/namibiagpt/');

        	var template = doT.template($('#export-content').html());
        	$('#export-form [name=content]').val(template({
        		content: content
        	}));
        	$('#export-form [name=fileName]').val('- Passport');
        	$('#export-form [name=landscape]').val('TRUE');
        };

        Application.prototype.export = function () {

        	var exportForm = $('#export-form');
        	exportForm.submit();
        };

        Application.prototype.loadGeoJSON = function () {

        	if (!this.hasGeoJson) {
        		this.hasGeoJson = true;
        		this.map.data.loadGeoJson('namibia.json');
        	}
        };

        Application.prototype.loop = function (data, columns, date, eachCallback) {

        	if (!$.isArray(data) || !$.isArray(columns) || !$.isFunction(eachCallback))
        		return;

        	var dateIndex = -1;
        	var columnNames = [];
        	for (var i = 0; i < columns.length; i++) {
        		columnNames.push(columns[i].name);

        		if (columns[i].type == 'Date')
        			dateIndex = i;
        	}

        	if (date && dateIndex == -1)
        		return;

        	var rowCount = data.length / columns.length;
        	for (var i = 0; i < rowCount; i++) {
        		var offset = i * columns.length;

        		if (date) {
        			var itemDate = data[offset + dateIndex];
        			if (!itemDate)
        				continue;

        			var year = itemDate.value.split('/')[2];
        			if (year != date.toString())
        				continue;
        		}

        		var item = [];

        		for (var j = 0; j < columns.length; j++)
        			item.push(data[offset + j]);

        		eachCallback(i, item, columnNames);
        	}
        };

        Application.prototype.clickDataLayerListener = function (event) {
			
        	if (this.infoWindow != null)
        		this.infoWindow.close();

        	var regionId = event.feature.getId();
        	var value = this.formatNumberUS(this.layerDataForTooltip[this.currentLayerName][regionId]);
        	var content = '<b>Region:&nbsp;</b>' + event.feature.getProperty('name') + '<br /><b>Value:&nbsp;</b>' + value;

        	this.infoWindow = new google.maps.InfoWindow({
        		content: content,
        		position: event.latLng
        	});

        	this.infoWindow.open(this.map);
        };

        Application.prototype.formatNumberUS = function (number) {

        	return number.toString().replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g, "\$1,")
        };

        return Application;
    })();

    google.maps.event.addDomListener(window, 'load', function () {
        var greeter = new Application();
        greeter.run();
    });
})(Infrastructure || (Infrastructure = {}));
//# sourceMappingURL=app.js.map