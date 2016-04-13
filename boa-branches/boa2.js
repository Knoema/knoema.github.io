(function () {

	var datasetId = 'evbhfsc'; //'pekdtqb';

	app = function () {	};

	app.prototype.run = function () {
		var self = this;

		this.infoWindow = new google.maps.InfoWindow();

		//Will set to true in fillFilters
		this.flag = false;

		this.clients = [];
		this.credit = [];
		this.savings= [];
		this.total = [];	
		this.totalOutstanding = [];
		this.totalAmountNGN = [];

		this.layers = {};

		this.settings = {
			//Color & radius will be calculated using these attributes
			bubbleRadiusAttribute: null,
			bubbleColorAttribute: null
		};
		this.count = 0;

		this.getRadius = null;

		this.staffGrid = null;

		//TODO Refactor using branchKeys
		//Ogoja -> 1000010
		self.branches = {};
		$.getJSON('//knoema.com/api/1.0/meta/dataset/srvintb/dimension/business-outlets', function(branchDimension) {
			_.each(branchDimension.items, function(item) {
				//TODO Refactor using branchKeys
				self.branches[item.name] = item.key;
			});
		});

		//TODO Load these layers as part of the geoplayground object
		this.meta = {
			'branches': '8576b262-f9be-684a-b2e8-002339c4bf36',
			'branches-credit': '9bc1f577-16c9-097c-3f2d-debfd645d5bb',
			'branches-savings': '01063b13-f472-253c-d09f-bfc20ac16daa',
			'branches-total': 'fcd0a098-e20b-f47f-c38b-962b83dc0b73',
			'projects': '9d80eb9f-b542-632a-e6b3-d3c88f681421'
		};
		this.layers = {};
		this.view = 'map';
		this.boaBranchKeys = null;

		this.map = new google.maps.Map(document.getElementById('map-canvas'), {
			center: { lat: 6.363070, lng: 6.795044 },
			zoom: 7,
			streetViewControl: false,
			zoomControlOptions: {
				position: google.maps.ControlPosition.LEFT_TOP
			},
			mapTypeId: google.maps.MapTypeId.HYBRID
		});

		this.map.data.loadGeoJson('nigeria.json');
		this.map.data.setStyle({
			strokeWeight: 1,
			fillColor: 'white',
			visible: false,
			clickable: false
		});

		google.maps.event.addListener(this.map, 'zoom_changed', function() {
			self.count = 0;
		});

		google.maps.event.addListener(this.map, 'dragstart', function() {
			self.count = 0;
		});

		google.maps.event.addListener(this.map, 'dragend', function() {
			self.count = 0;
			//self.update('branches');
			self.updateMap();
		});

		google.maps.event.addListenerOnce(this.map, 'idle', function () {
			window.setTimeout(function () {
				self.load('branches');
				self.load('projects');
			}, 300);
		});

		this.bindEvents();

		$(window).trigger('resize');

	};

	app.prototype.loadFirstOption = _.once(function() {
		$('#size').val('branches-0').trigger('change');
	});

	app.prototype.load = function (id, eventName) {

		var self = this;

		var layer = this.layers[id];

		if (!layer) {

			$(document.body).addClass('loading');

			var layer = new GeoPlayground.Layer({
				map: self.map,
				layerId: this.meta[id],
				geoPlaygroundId: 'cpfelie'
			});

			layer.on('click', function (e) {
				self.tooltip(e, id);
			});

			//layer.on('beforeVisualize', function () {
			//	self.count = 0;
			//	$('.count label').text('NUMBER OF BRANCHES: ' + layer.layer.dataToDisplay.length);
			//	layer.visualize();
			//});

			layer.on('loaded', function (loadedLayer) {

				if (id.indexOf('branches') > -1) {
					$('.count label').text('NUMBER OF BRANCHES: ' + self.count);
					self.count = 0;
					self.fillFilters();
				}

				self.getBoaBranchDimension().done(function(dimension) {
					self.boaBranchKeys = {};
					dimension.items.forEach(function(dim) {
						self.boaBranchKeys[dim.name] = dim.key;
					});

					$(document.body).removeClass('loading');

					if (loadedLayer.layerId === "8576b262-f9be-684a-b2e8-002339c4bf36" && _.isUndefined(eventName)) {
						//First option of #size select should be 'Total amount, NGN' which is computed property
						//We can't load it directly because we need loaded layer to compute the value
						//So will load 'branches' layer first (Number of clients) and trigger 'change' event to load first option
						self.loadFirstOption();
					}
				})

			});

			layer.on('beforeDraw', function (feature, callback) {
				self.onBeforeDraw(feature, callback, id);
			});

			self.layers[id] = layer;
		}

		layer.load();
	};

	app.prototype.clean = function (id) {

		var layer = this.layers[id];
		
		if (layer)
			layer.clean();

		if (id.indexOf('branches') > -1) {
			$('#table tbody').empty();
			this.count = 0;
		}
	};

	app.prototype.hideLegend = function() {
		$('#color-legend').hide();
	};

	app.prototype.showLegend = function() {
		var self = this;
		var minMax = self.getMinMax(self.settings.bubbleColorAttribute);

		var minColor = self.getColor(minMax.min);
		var maxColor = self.getColor(minMax.max);

		$('#color-legend').find('.min').html(minMax.min);
		$('#color-legend').find('.max').html(minMax.max);

		$('#color-legend').find('.palette').css({
			"background": 'linear-gradient(90deg, ' + maxColor + ', ' + minColor + ')'
		});
		$('#color-legend').show();
	};

	app.prototype.updateMap = function () {
		this.count = 0;
		this.clean('branches');
		this.load('branches');
		if (this.settings.bubbleColorAttribute) {
			this.showLegend();
		} else {
			this.hideLegend();
		}
	};

	app.prototype.update = function (id) {
		this.count = 0;
		this.clean(id);
		this.load(id);
	};

	app.prototype.tooltip = function (event, id) {

		var data = event.data.tooltip;
		var copy = $.extend({}, data);

		for (var key in copy) {
			if ($.isNumeric(copy[key]))
				copy[key] = parseFloat(copy[key]).toLocaleString();
		};

		var self = this;
		var branchName = data['Business Outlets'];// -> Ogoja

		var dataDescriptor = {
			"Header": [],
			"Stub": [],
			"Filter": [
				{
					"DimensionId": "business-outlets",
					"Members": [
						//TODO Refactor using branchKeys
						self.branches[branchName]
					],
					"DimensionName": "Business Outlets",
					"DatasetId": "srvintb",
					"Order": "0"
				}
			],
			"Frequencies": [],
			"Dataset": "srvintb",
			"Segments": null,
			"MeasureAggregations": null
		};

		switch (id) {
			case 'projects':
				this.infoWindow.setContent($('<div>').append($('#tmpl-project-profile').tmpl({ data: copy })).html());
				this.infoWindow.setPosition(event.data.latLng);
				this.infoWindow.open(this.map);
				break;
			default:

				Knoema.Helpers.post('/api/1.0/data/details', dataDescriptor, function(branchStuff) {
					var staff = _.chunk(branchStuff.data, branchStuff.columns.length);
					var manager = _.remove(staff, function(d) {
						return _.isEmpty(d[1]);
					})[0];

					////TODO Implement excluded columns properly (now it is "index > 9" check in template)
					//var excludeColumn = function(c) {
					//	return ["SORT No", "SORT items", "Remarks Next Adjustment", "Zonal Stops", "Deptal/brs - s/no", "Directorate/Zonal - S/no", "Department", "State", "Zone", "Business Outlets"].indexOf(c.name) > -1;
					//};
					var staffData = {
						manager: {
							managerName: manager[20],
							//TODO Use length instead
							numberOfStaff: manager[19]
						},
						staffColumns: branchStuff.columns,
						staff: staff
					};
					var staffContent = $('#tmpl-staff').tmpl({
						staffData: staffData
					}).html();

					$('#branch-profile').find('.staff').find('.tab-content').html(staffContent);

					/*
					var staffColumns = _.map(_.slice(branchStuff.columns, 10), function(c) {
						return {
							id: c.name,
							name: c.name,
							field: c.name
						}
					})

					var staffData = _.map(staff, function(s) {
						var d = {};
						var arr = _.slice(s, 10);
						for (var i = 0; i < staffColumns.length; i++) {
							d[staffColumns[i].name] = arr[i];
						}
						return d;
					});

					//For some reason can't render all cells
					$('#staff-slickgrid').css({
						height: 300,
						width: '100%'
					});

					//container, data, columns, options
					self.staffGrid = new Slick.Grid(
						//container
						'#staff-slickgrid',

						//data
						staffData,

						//columns
						staffColumns,

						//options
						{
							enableColumnReorder: false,
							syncColumnCellResize: true
						});

					self.staffGrid.resizeCanvas();
					self.staffGrid.render();
					*/

					$('#branch-profile h1').text(data['Business Outlets']);
					$('#branch-profile').find('.general').find('.tab-content').html($('#tmpl-branch-profile').tmpl({ data: copy }));

					$('#branch-profile .tab.loans2').data('branch', branchName);

					$('.nav-tabs a').first().click();

					var contentHeight  = $('#content').height();

					$('#branch-profile').find('.tab-content').height(contentHeight - 110);

					$('#branch-profile').css({
						//"background-color": "goldenrod",
						"top": 0,
						"height": contentHeight + 45
					}).show();

				});

				break;
		}
	};

	app.prototype.getBoaBranchDimension = function () {
		return $.getJSON('http://knoema.com/api/1.0/meta/dataset/' + datasetId + '/dimension/boa-branch?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif');
	};

	app.prototype.getLoanData = function (boaBranchName) {
		//TODO Refactor usig Knoema.Helpers.post?
		return $.post('http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=' + datasetId, {
			Dataset: datasetId,
			Filter: [{
				DatasetId: datasetId,
				DimensionId: "boa-branch",
				DimensionName: "BoA Branch",
				Members: [ this.boaBranchKeys[boaBranchName] ],
				Order: "0"
			}],
			Frequencies: [],
			Header: [],
			MeasureAggregations: null,
			Segments: null,
			Stub: []
		});
	};

	app.prototype.fillFilters = function (data) {

		var self = this;

		if (this.flag)
			return;

		this.flag = true;

		function sortNumbers(a, b) {
			return a - b;
		}

		this.clients.sort(sortNumbers);
		this.credit.sort(sortNumbers);
		this.savings.sort(sortNumbers);
		this.total.sort(sortNumbers);

		this.settings['search'] = '';

		this.settings['clients'] = {
			min: this.clients[0],
			max: this.clients[this.clients.length - 1],
			_min: this.clients[0],
			_max: this.clients[this.clients.length - 1]
		};

		this.settings['credit'] = {
			min: this.credit[0],
			max: this.credit[this.credit.length - 1],
			_min: this.credit[0],
			_max: this.credit[this.credit.length - 1]
		};

		this.settings['savings'] = {
			min: this.savings[0],
			max: this.savings[this.savings.length - 1],
			_min: this.savings[0],
			_max: this.savings[this.savings.length - 1]
		};

		this.settings['total'] = {
			min: this.total[0],
			max: this.total[this.total.length - 1],
			_min: this.total[0],
			_max: this.total[this.total.length - 1]
		};

		this.settings['grade'] = ['A', 'B', 'C', 'D'];

		//Setup sliders
		this.setup('clients');
		this.setup('credit');
		this.setup('savings');
		this.setup('total');

		$('#rating-grade').selectpicker();

		$('#rating-grade').change(function () {
			self.settings['grade'] = $('#rating-grade').selectpicker('val');
			//self.update($('#size').val());
			self.updateMap();
		});

		$('#filters').find('.filters').show();
	};

	//setup slider
	app.prototype.setup = function (id) {

		var self = this;
		var setting = this.settings[id];
		var container = $('.' + id);
	
		var min = container.find('.min');
		var max = container.find('.max');
		var slider = container.find('.slider');

		min.val(format(setting.min));
		max.val(format(setting.max));

		function format(value) {
			return value.toLocaleString();
		}

		min.change(function () {

			var value = parseFloat($(this).val());

			if ($.isNumeric(value) && value <= setting._max && value >= setting._min) {
				setting.min = value;
				slider.slider('option', 'values', [setting.min, setting.max]);
				//self.update($('#size').val());
				self.updateMap();
			}
			
			min.val(format(setting.min));
			
		});

		max.change(function () {

			var value = parseFloat($(this).val());

			if ($.isNumeric(value) && value <= setting._max && value >= setting._min) {
				setting.max = value;
				slider.slider('option', 'values', [setting.min, setting.max]);
				//self.update($('#size').val());
				self.updateMap();
			}
			
			max.val(format(setting.max));
			
		});

		slider.slider({
			range: true,
			min: setting.min,
			max: setting.max,
			values: [setting.min, setting.max],
			change: function (event, ui) {

				self.settings[id] = {
					min: ui.values[0],
					max: ui.values[1]
				}

				min.val(format(self.settings[id].min));
				max.val(format(self.settings[id].max));

				//self.update($('#size').val());
				self.updateMap();
			}
		});
	};

	app.prototype.onBeforeDraw = function (feature, callback, id) {

		var self = this;
		if (id.indexOf('branches') == -1)
			return callback(feature.data);

		if (!$.isNumeric(feature.data.radius))
			return callback(feature.data);
		
		feature.data.visible = true;
		
		var data = feature.data.content;

		var clients =          $.isNumeric(parseFloat( data['Number of Clients']       )) ? parseFloat( data['Number of Clients']       ) : 0;
		var credit =           $.isNumeric(parseFloat( data['Total ratings, Credit']   )) ? parseFloat( data['Total ratings, Credit']   ) : 0;
		var savings =          $.isNumeric(parseFloat( data['Total ratings, Savings']  )) ? parseFloat( data['Total ratings, Savings']  ) : 0;
		var total =            $.isNumeric(parseFloat( data['Total ratings, Total']    )) ? parseFloat( data['Total ratings, Total']    ) : 0;
		var totalOutstanding = $.isNumeric(parseFloat( data['Outstanding, Total, NGN'] )) ? parseFloat( data['Outstanding, Total, NGN'] ) : 0;
		var totalAmountNGN   = this.getTotalAmountNGN(data);

		var grade = data['Total ratings, Grade'];

		//TODO Rename to branchName
		var name = data['Business Outlets'];

		var search = this.settings['search'] || '';

		if (!this.flag) {
			if ($.isNumeric(clients) && this.clients.indexOf(clients) == -1)
				this.clients.push(clients);

			if ($.isNumeric(credit) && this.credit.indexOf(credit) == -1)
				this.credit.push(credit);

			if ($.isNumeric(savings) && this.savings.indexOf(savings) == -1)
				this.savings.push(savings);

			if ($.isNumeric(total) && this.total.indexOf(total) == -1)
				this.total.push(total);

			if ($.isNumeric(totalOutstanding) && this.total.indexOf(totalOutstanding) == -1)
				this.totalOutstanding.push(totalOutstanding);

			if (this.totalAmountNGN.indexOf(totalAmountNGN) == -1) {
				this.totalAmountNGN.push(totalAmountNGN);
			}

		}
		else {

			var visible = true;

			if (visible && $.isNumeric(clients)) 
				visible = clients >= this.settings['clients'].min && clients <= this.settings['clients'].max;
			
			if (visible && $.isNumeric(credit)) 
				visible = credit >= this.settings['credit'].min && credit <= this.settings['credit'].max;
			
			if (visible && $.isNumeric(savings)) 
				visible = savings >= this.settings['savings'].min && savings <= this.settings['savings'].max;
			
			if (visible && $.isNumeric(total)) 
				visible = total >= this.settings['total'].min && total <= this.settings['total'].max;			

			if (visible && grade && this.settings['grade'])
				visible = this.settings['grade'].indexOf(grade) > -1;			


			//TODO How to combine this with "Color reflects"
			if (visible && search != '' && name.toLowerCase().indexOf(search) > -1)
				feature.data.fillColor = '#ff0000';
		
			feature.data.visible = visible;
		}

		if (feature.data.visible) {

			var copy = $.extend({}, data);

			for (var key in copy) {
				if ($.isNumeric(copy[key]))
					copy[key] = parseFloat(copy[key]).toLocaleString();
			};

			if (id !== 'projects') {
				this.count++;
			}

			var row = $('#tmpl-branch').tmpl({ data: copy });
			
			if (search != '' && row.find('td.name').text().toLowerCase().indexOf(search) > -1)
				row.css('background-color', '#FF908E');
				
			$('#table tbody').append(row);
		}

		if (feature.data.visible) {

			//TODO How to know min/max & get proper radius
			if (self.settings.bubbleRadiusAttribute) {

				var value;
				if (self.settings.bubbleRadiusAttribute === 'Total amount, NGN' || self.settings.bubbleRadiusAttribute === '["Disbursement, SME, NGN", "Disbursement, Micro Agriculture, NGN", "Disbursement, Micro Non-Agriculture, NGN"]') {
					value = self.getTotalAmountNGN(feature.data.content);
				} else {
					value = feature.data.content[self.settings.bubbleRadiusAttribute];
				}
				if (!$.isNumeric(value)) {
					feature.data.visible = false;
				} else {
					feature.data.radius = self.getRadius(value);
				}
			}

			if (self.settings.bubbleColorAttribute && _.isEmpty(search)) {
				var value;
				if (self.settings.bubbleColorAttribute === 'Total amount, NGN' || self.settings.bubbleColorAttribute === '["Disbursement, SME, NGN", "Disbursement, Micro Agriculture, NGN", "Disbursement, Micro Non-Agriculture, NGN"]') {
					value = self.getTotalAmountNGN(feature.data.content);
				} else {
					value = feature.data.content[self.settings.bubbleColorAttribute];
				}
				feature.data.fillColor = self.getColor(value);
			}
		}

		callback(feature.data);

	};

	app.prototype.getTotalAmountNGN = function(data) {
		return _.sum(_.filter([
			data['Disbursement, SME, NGN'],
			data['Disbursement, Micro Agriculture, NGN'],
			data['Disbursement, Micro Non-Agriculture, NGN']
		], function(d) {
			return !_.isUndefined(d);
		}));
	};

	app.prototype.getMinMax = function (attribute) {
		var self = this;
		var min, max;
		if (attribute.slice(0,1) === '[') {
			min = _.min(self.totalAmountNGN);
			max = _.max(self.totalAmountNGN);
		} else {
			switch (attribute) {
				case 'Outstanding, Total, NGN':
					min = _.min(self.totalOutstanding);
					max = _.max(self.totalOutstanding);
					break;
				case 'Number of Clients':
					min = _.min(self.clients);
					max = _.max(self.clients);
					break;
				case 'Total ratings, Credit':
					min = _.min(self.credit);
					max = _.max(self.credit);
					break;
				case 'Total ratings, Savings':
					min = _.min(self.savings);
					max = _.max(self.savings);
					break;
				case 'Total ratings, Total':
					min = _.min(self.total);
					max = _.max(self.total);
					break;
			}
		}
		return {
			min: min,
			max: max
		}
	};

	app.prototype.resize = function () {
		var newWindowHeight = $(window).height();
		$('#filters .filters').height(newWindowHeight - 120 - 45);//55-NUMBER OF BRANCHES
		$('#map-canvas').height(newWindowHeight - 120);//76#header+40.menu-bar
		$('#table').height(newWindowHeight - 120);//76#header+40.menu-bar
	};

	app.prototype.bindEvents = function () {

		var self = this;

		$(window).on('resize', $.proxy(this.resize, this));

		$('#map-view').on('click', function () {

			$('#main-menu').find('.btn').removeClass('active');
			$(this).addClass('active');
			self.switchView('map');
		});

		$('#table-view').on('click', function () {

			$('#main-menu').find('.btn').removeClass('active');
			$(this).addClass('active');
			self.switchView('table');
		});

		$('#projects').on('click', function () {
			if (this.checked)
				self.load('projects');
			else
				self.clean('projects');
		});

		$('#bubble-color').change(function (e) {
			self.settings.bubbleColorAttribute = $(e.target).val();
			if (self.settings.bubbleColorAttribute === 'null') {
				self.settings.bubbleColorAttribute = null;
			} else {
				var minMax = self.getMinMax(self.settings.bubbleColorAttribute);
				self.getColor = d3.scale.linear().domain([minMax.min, minMax.max]).range(["red", "gold"]);
			}
			self.updateMap();
		});
		$('#bubble-size').change(function (e) {
			self.settings.bubbleRadiusAttribute = $(e.target).val();
			var minMax = self.getMinMax(self.settings.bubbleRadiusAttribute);
			//self.getRadius = d3.scale.linear().domain([5, 25]).range([minMax.min, minMax.max]);
			//TODO Replace with d3.scale
			self.getRadius = function(value) {
				var minRadius = 5;
				var maxRadius = 25;
				return Math.floor(minRadius + (maxRadius - minRadius) * (value - minMax.min) / (minMax.max - minMax.min));
			};
			self.updateMap();
		});

		$('#size').change(function (e) {
			var layerId;
			var profileAttribute = $(e.target).find('option:selected').data('value');
			if (profileAttribute) {
				//Will load fake layer and calculate radius using profileAttribute
				layerId = 'branches';
				self.settings.bubbleRadiusAttribute = profileAttribute;
				var allAttributeValues = _.map(self.layers.branches.layer.dataToDisplay, function(d) {
					//See <select id="size" class="selectpicker"> (for hardcoded 'Total amount, NGN')
					var value;
					if (profileAttribute === 'Total amount, NGN') {
						value = self.getTotalAmountNGN(d.data);
					} else {
						value = d.data[profileAttribute];
					}
					return value;
				}).filter(function(d) {
					return !_.isUndefined(d);
				});
				var min = _.min(allAttributeValues);
				var max = _.max(allAttributeValues);

				self.getRadius = function(value) {
					var minRadius = 5;
					var maxRadius = 25;
					return Math.floor(minRadius + (maxRadius - minRadius) * (value - min) / (max - min));
				};
			} else {
				self.settings.bubbleRadiusAttribute = null;
				self.getRadius = null;
				layerId = $(this).val();
			}
			for (var id in self.meta)
				if (id.indexOf('branches') > -1) {
					self.clean(id);
				}
			self.load(layerId, 'change');
		});

		//TODO Refactor using debounce
		var delay = (function () {
			var timer = 0;
			return function (callback, ms) {
				clearTimeout(timer);
				timer = setTimeout(callback, ms);
			};
		})();
		$('input').keyup(function () {
			delay(function () {
				self.settings['search'] = $.trim($(this).val().toLowerCase());
				//self.update($('#size').val());
				self.updateMap();
			}.bind(this), 200);
		});

		$('.back-button a').on('click', function () {
			$('#branch-profile').hide();
			return false;
		});

		$('#branch-profile').find('.nav-tabs a').click(function () {

			var tab = $(this).data('tab-name');		

			$(this).tab('show');

			$('#branch-profile .tab').removeClass('active');
			var $tab = $('#branch-profile .tab.' + tab).addClass('active');
			$('#branch-profile iframe').height($('#content').height() - 150);

			if (tab == 'loans2') {
				$tab.addClass('loading');
				self.loanTabShown().then(function() {
					$tab.removeClass('loading');
				});
			}

			return false;
		});

		$(document).on('click', '.passport__close', function (event) {
			$(event.target).closest('.passport-popup').hide();
		});

		$('.region-profile-button').on('click', function () {

			var region = $('#regions').val();
			if (region == -1)
				return false;

			//TODO Change container #content
			$('#tmpl-region-profile').tmpl({ regionId: region }).appendTo('#content');

			return false;
		});

		$('#regions').on('change', function(event) {
			var regionName = $(event.delegateTarget).val();
			
			self.branchBubblesAreClickable = regionName == '-1';

			var bounds = new google.maps.LatLngBounds();

			var countOfVisibleFeatures = 0;

			self.map.data.forEach(function(feature) {

				self.map.data.revertStyle(feature);

				var visible = regionName == feature.getProperty('name');
				self.map.data.overrideStyle(feature, { visible: visible });

				if (visible) {
					countOfVisibleFeatures += 1;
					self.extendBoundsByGeometry(bounds, feature.getGeometry());
				}
			});
			if (countOfVisibleFeatures == 0) {
				bounds = self.layers.branches.layer.bounds;
			}

			self.map.fitBounds(bounds);
			setTimeout(function() {
				google.maps.event.trigger(self.map, 'resize');
			}, 100);

			//self.map.fitBounds(bounds, function() {
			//	google.maps.event.trigger(self.map, 'resize');
			//});

		});
	};
	
	app.prototype.loanTabShown = function () {
		var self = this;

		var columnsToHide = [
			//'S/No.',
			'State',
			'Region',
			'BoA Branch',
			/*'Moratorium(If any)',
			'Interest rate',
			'Repayment instalments',
			'Last repayment date',
			'Appraisal',
			'Processing',
			'Fees, Total',
			'Types of collaterals, A',
			'Types of collaterals, A Value',
			'Types of collaterals, B',
			'Types of collaterals, B Value',
			'Types of collaterals, C',
			'Types of collaterals, C Value',
			'Level of Perfection of Collateral',
			'Date of Collateral Valuation',
			'Total No of days',
			'Outstanding no of days at the year end',
			'Unearned fee'*/
		];

		function calcWidth(text, weight) {
			return 15 + Math.ceil($('#widthCalc')
				.css({ 'font-family': 'Calibri', 'font-size': '14px', 'font-weight': weight })
				.html(text)
				.width());
		}

		// Clean loan grid
		if (self.grid != null) {
			self.grid.setData([], true);
			self.grid.render();
		}

		var boaBranch = $('#branch-profile .tab.loans2').data('branch');
		return self.getLoanData(boaBranch).done(function(details) {
			var gridColumns = [];
			var gridColumnsDict = {};

			details.columns.forEach(function (column, index) { 
				if (columnsToHide.indexOf(column.name) < 0) {
					var columnName = column.name + (column.name.toLowerCase().indexOf('amount') >= 0 ? ' NGN' : '');
					var gridColumn = { name: columnName, rerenderOnResize: true };
					switch (gridColumn.name) {
						case 'Gender Information#Male': gridColumn.name = 'Gender Information - #Male'; break;
						case 'Gender Information#Female': gridColumn.name = 'Gender Information - #Female'; break;
						case 'Gender Information#Others': gridColumn.name = 'Gender Information - #Others'; break;
					}
					gridColumn.id = gridColumn.field = column.name;

					var headerWidth = calcWidth(gridColumn.name, 'bold');
					gridColumnsDict[gridColumn.field] = gridColumn;
					gridColumn.width = headerWidth < 250 ? headerWidth : 250

					gridColumns.push(gridColumn);
				}
			});

			var notEmptyColumns = [];
			var rows = [];
			for (var rowOffset = 0; rowOffset < details.data.length; rowOffset += details.columns.length) {
				var row = {};

				for (var colIndex = 0; colIndex < details.columns.length; colIndex++) {
					var column = details.columns[colIndex];

					if (column.name in gridColumnsDict) {
						var value = details.data[rowOffset + colIndex];
						// |Processing|Fees, Total
						var regex = /(S\/No.|Gender Information|Interest rate|Appraisal|Total No of days|Outstanding no of days at the year end)/;
						
						if (
							column.type == 'Number' && 
							value != null && value != '' && 
							column.name != '' &&
							!regex.test(column.name)
						) {
							value = numeral(value).format('0,0.00');
						}
						else if (value == null || value == 'N/A') {
							value = '';
						}

						if (column.name in gridColumnsDict) {
							if (value != '' && notEmptyColumns.indexOf(column.name) < 0) {
								notEmptyColumns.push(column.name);
							}

							// column width
							var valueWidth = calcWidth(value, 'normal');
							if (valueWidth > gridColumnsDict[column.name].width) {
								gridColumnsDict[column.name].width = valueWidth < 250 ? valueWidth : 250;
							}
						}

						row[column.name] = value;
					}
				}

				rows.push(row);
			}

			rows = rows.sort(function(a, b) {
				if (a['Category'] < b['Category']) {
					return -1;
				}
				else if (a['Category'] > b['Category']) {
					return 1;
				}
				else
				{
					return a['S/No.'] - b['S/No.'];
				}
			});

			// Highlight Total rows
			var highlightRows = {};
			rows.forEach(function(row, index) {
				if (row['Name of Client'] == 'Total') {
					var higlightedRow = highlightRows[index] = {};
					details.columns.forEach(function(column) { higlightedRow[column.name] = 'highlight'; });
				}
			});

			// filter out empty columns
			{
				var tmpColumns = [];
				gridColumns.forEach(function(gridColumn) {
					if (notEmptyColumns.indexOf(gridColumn.field) >= 0) {
						tmpColumns.push(gridColumn);
					}
				});
				gridColumns = tmpColumns;
			}

			if (self.grid == null) {
				self.grid = new Slick.Grid("#loan-table", rows, gridColumns, {
					enableColumnReorder: false,
					syncColumnCellResize: true
				});
			} else {
				self.grid.setColumns(gridColumns);
				self.grid.setData(rows, true);
				self.grid.render();
			}

			self.grid.setCellCssStyles('total_highlight', highlightRows);
		});
	};

	app.prototype.extendBoundsByGeometry = function (bounds, geometry) {
		var arr = geometry.getArray();
		for (var i = 0; i < arr.length; i++) {
			if (typeof(arr[i].getArray) == 'function') {
				this.extendBoundsByGeometry(bounds, arr[i]);
			} else {
				bounds.extend(arr[i]);
			}
		}
	};

	app.prototype.switchView = function (viewName) {

		switch (viewName) {

			case 'map':

				$('#table').hide();
				$('#map-canvas').show();
				$('#search-control input').val('');

				$('#regions-control').show();

				break;

			case 'table':
				$('#table').show();
				$('#map-canvas').hide();

				//$('.table').css({
				//	top: 120
				//});

				//scrollableArea: $('.scrollable-area')

				//Horizontal scroll doesn't work
				//$('.table').stickyTableHeaders({fixedOffset: 121});

				$('#regions-control').hide();

				break;
		}

		self.view = viewName;
	};
	
	google.maps.event.addDomListener(window, 'load', function () {
		new app().run();
	});
})();

