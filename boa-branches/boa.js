(function () {

	var datasetId = 'evbhfsc'; //'pekdtqb';

	app = function () {	};

	app.prototype.run = function () {
		var self = this;

		this.infoWindow = new google.maps.InfoWindow();
		this.clients = [];
		this.credit = [];
		this.savings= [];
		this.total = [];	
		this.layers = {};
		this.flag = false;
		this.settings = {};
		this.count = 0;
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

		google.maps.event.addListenerOnce(this.map, 'idle', function () {
			var idleTimeout = window.setTimeout(function () {				

				self.bubblesLayer = new Knoema.GeoPlayground.BubblesLayer(self.map);
				self.load('branches');
				self.load('projects');

			}, 300);
		});

		this.bindEvents();
	};

	/*app.prototype.loadLoan = function (member, callback) {

		Knoema.Helpers.post('/api/1.0/data/details', {	
			"Filter": [
				{
					"DimensionId": "boa-branch",
					"Members": [
						member
					],
					"DimensionName": "BoA Branch",
					"DatasetId": "kauagwc",
					"Order": "0"
				}
			],
			"Frequencies": [],
			"Dataset": "kauagwc",
		},
		function (response) {
			callback(response);
		});
	};*/

	app.prototype.load = function (id) {

		var self = this;
	
		var layer = this.layers[id];

		$(document.body).addClass('loading');

		if (!layer) {

			var layer = new GeoPlayground.Layer({
				map: self.map,
				layerId: this.meta[id],
				geoPlaygroundId: 'cpfelie',
				bubblesLayer: self.bubblesLayer
			}, function (e) {
				if (id.indexOf('branches') > -1) {
					$('.count label').text('NUMBER OF BRANCHES: ' + self.count);
					self.fillFilters();
				}

				self.getBoaBranchDimension().done(function(dimension) {
					self.boaBranchKeys = {};
					dimension.items.forEach(function(dim) {
						self.boaBranchKeys[dim.name] = dim.key;
					});

					$(document.body).removeClass('loading');
				})
			});

			layer.on('click', function (e) {
				//if ($('#regions').val() == -1) {
					self.tooltip(e, id);
				//}
			});

			layer.on('beforeDraw', function (e, callback) {
				self.onBeforeDraw(e, callback, id);
			});

			self.layers[id] = layer;
		}

		layer.load();
	}

	app.prototype.clean = function (id) {

		var layer = this.layers[id];
		
		if (layer)
			layer.clean();

		if (id.indexOf('branches') > -1) {
			$('#table tbody').empty();
			this.count = 0;
		}
	};

	app.prototype.update = function (id) {
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

		switch (id) {
			case 'projects':
				this.infoWindow.setContent($('<div>').append($('#tmpl-project-profile').tmpl({ data: copy })).html());
				this.infoWindow.setPosition(event.data.latLng);
				this.infoWindow.open(this.map);
				break;
			default:
				$('#branch-profile h1').text(data['Business Outlets']);
				$('#branch-profile .tab.general').html($('#tmpl-branch-profile').tmpl({ data: copy }));

				$('#branch-profile .tab.loans2').data('branch', data['Business Outlets']);

				$('.nav-tabs a').first().click();
				$('#branch-profile').show();
				break;
		}
	};

	app.prototype.getBoaBranchDimension = function () {
		return $.getJSON('http://knoema.com/api/1.0/meta/dataset/' + datasetId + '/dimension/boa-branch?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif');
	};

	app.prototype.getLoanData = function (boaBranchName) {
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
			_max: this.clients[this.clients.length - 1],
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

		this.setup('clients');
		this.setup('credit');
		this.setup('savings');
		this.setup('total');

		$('#rating-grade').selectpicker();

		$('#rating-grade').change(function () {
			self.settings['grade'] = $('#rating-grade').selectpicker('val');
			self.update($('#size').val());
		});

		$('#filters').show();
	};

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
				self.update($('#size').val());
			}
			
			min.val(format(setting.min));
			
		});

		max.change(function () {

			var value = parseFloat($(this).val());

			if ($.isNumeric(value) && value <= setting._max && value >= setting._min) {
				setting.max = value;
				slider.slider('option', 'values', [setting.min, setting.max]);
				self.update($('#size').val());
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

				self.update($('#size').val());
			}
		});
	};

	app.prototype.onBeforeDraw = function (event, callback, id) {
		
		if (id.indexOf('branches') == -1)
			return callback(event.data);

		if (!$.isNumeric(event.data.radius))
			return callback(event.data);
		
		event.data.visible = true;
		
		var data = event.data.content;
		var clients = $.isNumeric(parseFloat(data['Number of Clients'])) ? parseFloat(data['Number of Clients']) : 0;
		var credit = $.isNumeric(parseFloat(data['Total ratings, Credit'])) ? parseFloat(data['Total ratings, Credit']) : 0;
		var savings = $.isNumeric(parseFloat(data['Total ratings, Savings'])) ? parseFloat(data['Total ratings, Savings']) : 0;
		var total = $.isNumeric(parseFloat(data['Total ratings, Total'])) ? parseFloat(data['Total ratings, Total']) : 0;
		var grade = data['Total ratings, Grade'];
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

			if (visible && grade) 
				visible = this.settings['grade'].indexOf(grade) > -1;			

			if (visible && search != '' && name.toLowerCase().indexOf(search) > -1)
				event.data.fillColor = '#CC3333';
		
			event.data.visible = visible;
		}

		if (event.data.visible) {

			var copy = $.extend({}, data);

			for (var key in copy) {
				if ($.isNumeric(copy[key]))
					copy[key] = parseFloat(copy[key]).toLocaleString();
			};

			this.count++;

			var row = $('#tmpl-branch').tmpl({ data: copy });
			
			if (search != '' && row.find('td.name').text().toLowerCase().indexOf(search) > -1)
				row.css('background-color', '#FF908E');
				
			$('#table tbody').append(row);
		}

		callback(event.data);
	}

	app.prototype.bindEvents = function () {

		var self = this;

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

		$('#size').change(function () {

			var layerId = $(this).val();

			for (var id in self.meta)
				if (id.indexOf('branches') > -1)
					self.clean(id);

			self.load(layerId);
		});

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
				self.update($('#size').val());
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

			$('#tmpl-region-profile').tmpl({ regionId: region }).appendTo('#content');

			return false;
		});

		$('#regions').on('change', function(event) {
			var regionName = $(event.delegateTarget).val();
			
			self.branchBubblesAreClickable = regionName == '-1';

			self.map.data.forEach(function(feature) {
				self.map.data.revertStyle(feature);

				var visible = regionName == feature.getProperty('name');
				self.map.data.overrideStyle(feature, { visible: visible });

				if (visible) {
					var bounds = new google.maps.LatLngBounds();
					self.extendBoundsByGeometry(bounds, feature.getGeometry());
					self.map.fitBounds(bounds);
				}				
			});
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

			/*gridColumns.forEach(function(gridColumn) { 
				var headerWidth = calcWidth(gridColumn.name, 'bold');
				gridColumnsDict[gridColumn.field] = gridColumn;
				gridColumn.width = headerWidth < 250 ? headerWidth : 250
			});*/

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
				break;

			case 'table':
				$('#table').show();
				$('#map-canvas').hide();
				$('.table').stickyTableHeaders();
				
				break;
		}

		self.view = viewName;
	};
	
	google.maps.event.addDomListener(window, 'load', function () {
		new app().run();
	});
})();