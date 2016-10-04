var access_token = '';

var params = Knoema.Helpers.parseHashParams();
if (params == null) {
	Knoema.Helpers.getAccessToken('Ysyd9Tw', window.location, false, 'publish');
}
else {
	if (typeof params["access_token"] !== 'undefined') {
		access_token = params["access_token"];
	}
}

function App() {
	this._map = null;
	this.geoPlaygroundId = 'zabecdg';
	this._layers = {};
	this._currentLayer = null;
	this._divisionTypes = [{
		name: 'Nationale',
		className: 'nationale'
	}, {
		name: 'Région',
		className: 'region'
	}, {
		name: 'Département',
		className: 'department'
	}, {
		name: 'Communale',
		className: 'communale'
	}];
	this._activeRegionalDivision = '';
};

App.prototype.init = function () {

	this.loadTemplates($.proxy(function onTemplatesLoaded() {

		var $topButtons = $.tmpl('regional-divisions.html', {
			divisionTypes: this._divisionTypes,
			className2: 'btn btn-default'
		});

		var $modalButtons = $.tmpl('regional-divisions.html', {
			divisionTypes: this._divisionTypes,
			className2: 'regional-division-type'
		});

		var $modal = $('#regional-division-modal-switcher');
		$modal.find('.regional-division-buttons').empty().append($modalButtons);

		$modal.modal({
			open: true
		});

		//top buttons
		$('#regional-division-map-switcher').empty().append($topButtons);

		this._map = new google.maps.Map($('#map-container')[0], {
			mapTypeId: google.maps.MapTypeId.HYBRID,
			mapTypeControl: false,
			zoom: 6,
			center: {
				lat: 20.215167,
				lng: -10.777588
			}
		});

		var self = this;
		//TODO Load all layers
		google.maps.event.addListenerOnce(this._map, 'idle', function () {

			var idleTimeout = window.setTimeout(function () {
				$.get('//knoema.com/api/1.0/frontend/resource/' + self.geoPlaygroundId + '/content', function(content) {

					var groupedLayers = _.groupBy(_.values(content.layers), function(f) { return f.groupping.groupName });

					var items = [
						{
							title: "Population et Infrastructures",
							className: 'infrastructures',
							children: [
								{
									title: "Infrastructures",
									children: [
										{
											title: "Les centres de santé",
											children: groupedLayers["Health Centers"]
										},
										{
											//'Water points'
											title: "Les points d'eau"
										},
										{
											//"Schools by town"
											title: "Les écoles par la ville"
										},
										{
											//"Roads"
											title: "Routes"
										},
										{
											//"Current projects"
											title: "Projets actuels"
										}
									]
								},
								{
									title: "Population",
									children: [
										{
											title: "Démographie",
											children: groupedLayers["Demography"]
										},
										{
											//"RGPH"
											title: "RGPH"
										},
										{
											//"Education"
											title: "Éducation",
											children: [
												{
													//"Bac results"
													name: "Bac résultats"
												},
												{
													//"Bepc results"
													name: "Bepc résultats"
												}
											]
										}
									]
								}
							]
						},
						{
							title: "La pluie et la végétation",
							className: 'climate',
							children: [
								{
									//"Past"
									title: "Passé",
									children: [
										{
											//"Vegetation"
											title: "Végétation"
										},
										{
											//"Rains"
											title: "Des pluies"
										}
									]
								},
								{
									//"Forecast"
									title: "Prévoir",
									children: [
										{
											//"Rains 7 days"
											title: "Rains 7 jours"
										},
										{
											//"Confidence"
											title: "Confiance"
										}
									]
								}
							]
						},
						{
							title: "Élections",
							className: 'elections',
							children: [
								{
									title: "Social",
									children: [
										{
											//"Actors"
											title: "Acteurs"
										},
										{
											//"Other tables"
											title: "Autres tables"
										}
									]
								},
								{
									//"Electoral roll"
									title: "Liste électorale"
								},
								{
									//"Results"
									title: "Résultats",
									children: [
										{
											title: "Présidentielle 2014",
											children: groupedLayers["Presidential 2014"]
										},
										{
											title: "2013 Parlementaire",
											children: groupedLayers["2013 Parliamentary"]
										}
									]
								}
							]
						}
					];

					$('#side-bar').find('.filters-holder').append($.tmpl('filters-tree.html', {
						items: items
					}));

					self.bindEvents();

					$(window).trigger('resize');

				});

			}, 300);

		});

	}, this));//end onTemplatesLoaded

};

App.prototype.switchDivision = function (division) {
	this._activeDivision = division;
	console.log('Active regional division is:', division);
	//TODO Reload or something
};

App.prototype.onResize = function () {
	var windowHeight = $(window).height();
	var $sideBar = $('#side-bar');
	$sideBar.height($(window).height());
	$sideBar.find('.filters-holder').height(windowHeight - 180);
};

App.prototype.bindEvents = function () {
	var self = this;
	$('#regional-division-map-switcher').on('click', 'button', function(event) {
		self.switchDivision($(event.target).data('division'));
	});

	$('#regional-division-modal-switcher').on('click', '.regional-division-type', function() {
		self.switchDivision($(event.target).data('division'));
		$('#regional-division-modal-switcher').modal('hide');
	});

	$(window).on('resize', $.proxy(this.onResize, this));

	$('#side-bar').find('.filters-holder').mCustomScrollbar({
		theme: "dark"
	});

	//TODO Refactor to use bootstrap's accordion
	// $('#filters > ul li').on('click', function () {
	// 	$('#filters>ul li').removeClass('active');
	// 	$(this).addClass('active');
	// });
	// $('.item-content li').on('click', function () {
	// 	var input = $(this).find('input');
	// 	if (input.prop('checked')) {
	// 		input.prop('checked', false);
	// 	}
	// 	else {
	// 		$('.item-content li input').prop('checked', false);
	// 		input.prop('checked', true);
    //
	// 		var layerId = input.val();
	// 		self.loadLayer(layerId);
	// 	}
	// });

};

App.prototype.loadLayer = function (layerId) {
	var self = this;
	this.cleanLayer(this._currentLayer);

	if (this._layers[layerId]) {
		this._layers[layerId].load();
	}
	else {
		var infoWindow = new google.maps.InfoWindow();
		var layer = new GeoPlayground.Layer({
			map: self._map,
			layerId: layerId,
			geoPlaygroundId: self.geoPlaygroundId,
			infoWindow: infoWindow
		}, function (layerData) {
		});

		layer.load();
		this._layers[layerId] = layer;
	}

	this._currentLayer = layerId;
};

App.prototype.cleanLayer = function (layerId) {
	if (!this._layers[layerId]) {
		return;
	}
	this._layers[layerId].clean();
};

App.prototype.loadTemplates = function (callback) {
	var self = this;
	function compileTemplate(templateSrc) {
		var templateId = this.url.replace('tmpl/', '');
		templateId = templateId.substring(0, templateId.indexOf('?'))
		$.template(templateId, templateSrc);
	}
	var templates = [
		$.get('tmpl/regional-divisions.html?random=' + Math.random(), compileTemplate),
		$.get('tmpl/filters-tree.html?random=' + Math.random(), compileTemplate)
	];
	$.when.apply(null, templates).done(function onTemplatesLoaded() {
		if ($.isFunction(callback)) {
			callback();
		}
	});
};
