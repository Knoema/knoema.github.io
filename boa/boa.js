(function () {

	app = function () {
	};

	app.prototype.run = function () {

		var self = this;
		this.markers = {};
		this.markerClusters = {};
		this.infoWindow = new google.maps.InfoWindow();
		this.farmData = {};

		this.currentViewType = 'map';
		this.machineryType = 'all';
		this.cultivatedAreaMin = -1;
		this.cultivatedAreaMax = -1;
		this.cultivatedAreaMinAbs = -1;
		this.cultivatedAreaMax = -1;

		this.loanTab = false;

		$('#slider-range').slider({
			range: true,
			min: 0,
			max: 500,
			values: [0, 500]
		});

		this.map = new google.maps.Map(document.getElementById('map-canvas'), {
			center: { lat: 6.363070, lng: 6.795044 },
			zoom: 8,
			streetViewControl: false,
			zoomControlOptions: {
				position: google.maps.ControlPosition.LEFT_TOP
			},
			mapTypeId: google.maps.MapTypeId.HYBRID
		});

		var farmOptions = {
			valueIndex: 13,
			fillColor: '#FFAE00',
			strokeColor: '#fff',
			offsetTable: false,
			latlngTransform: false,
			latOffset: 1.8,
			lngOffset: 1.8,
			dontMoveEach: 4
		};

		this.getFarms().done(function (data) {
			self.farmData = data;
			self.addObjectsToMap(self.map, data, 'farms', 15, 16, false, true, farmOptions);
			self.addObjectsToTable($('#table'), data);
			self.fillFilters(data);

			if ($(document.body).hasClass('loading'))
				$(document.body).removeClass('loading');
		});

		this.bindEvents();
	};

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

		$('#search-control input').on('change', function () {

			if (self.currentViewType == 'table') {
				self.update();
			}
		});
	};

	app.prototype.clearMarkers = function (indicator) {
		if (Array.isArray(this.markers[indicator])) {
			this.markers[indicator].forEach(function (marker) {
				marker.setMap(null);
			});
			this.markers[indicator] = null;
		}

		if (this.markerClusters[indicator]) {
			this.markerClusters[indicator].clearMarkers();
			this.markerClusters[indicator] = null;
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
				break;
		}

		this.currentViewType = viewName;
		this.update();
	};

	app.prototype.fillFilters = function (data) {

		var self = this;
		var $machineryOptions = [];
		var machinery = [];

		var minArea = Infinity;
		var maxArea = -Infinity;

		var rowCount = Math.floor(data.data.length / data.columns.length);
		for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
			var rowOffset = rowIndex * data.columns.length;

			var machineryItem = data.data[rowOffset + 14];
			if ($.inArray(machineryItem, machinery) == -1) {
				$machineryOptions.push($('<option>', { value: machineryItem, text: machineryItem }));
				machinery.push(machineryItem);
			}

			var cultivatedAreaItem = data.data[rowOffset + 13];
			if (cultivatedAreaItem < minArea)
				minArea = cultivatedAreaItem;
			if (cultivatedAreaItem > maxArea)
				maxArea = cultivatedAreaItem;
		}

		$('#machinery').append($machineryOptions);

		self.cultivatedAreaMin = minArea;
		self.cultivatedAreaMinAbs = minArea;
		$('#slider-range').slider('option', 'min', minArea);
		$('#cultivated-area-min').val(minArea);
		self.cultivatedAreaMax = maxArea;
		self.cultivatedAreaMaxAbs = maxArea;
		$('#slider-range').slider('option', 'max', maxArea);
		$('#cultivated-area-max').val(maxArea);


		$('#machinery').on('change', function () {

			self.machineryType = $('#machinery').val();
			self.update();
		});

		$('#slider-range').on('slidechange', function (e, ui) {

			self.cultivatedAreaMin = ui.values[0];
			$('#cultivated-area-min').val(ui.values[0]);
			self.cultivatedAreaMax = ui.values[1];
			$('#cultivated-area-max').val(ui.values[1]);
			self.update();
		});

		$('#cultivated-area-min').on('change', function () {

			var value = $('#cultivated-area-min').val();
			if (value < self.cultivatedAreaMinAbs) {
				$('#cultivated-area-min').val(self.cultivatedAreaMinAbs);
				value = self.cultivatedAreaMinAbs;
			}

			$('#slider-range').slider("values", 0, value);
			self.cultivatedAreaMin = value;
		});

		$('#cultivated-area-max').on('change', function () {

			var value = $('#cultivated-area-max').val();
			if (value > self.cultivatedAreaMaxAbs) {
				$('#cultivated-area-max').val(self.cultivatedAreaMaxAbs);
				value = self.cultivatedAreaMaxAbs;
			}

			$('#slider-range').slider("values", 1, value);
			self.cultivatedAreaMax = value;
		});
	};

	app.prototype.update = function () {

		var data = window.AppMapData['farms'];

		switch (this.currentViewType) {
			case 'map':
				var farmOptions = {
					valueIndex: 13,
					fillColor: '#FFAE00',
					strokeColor: '#fff',
					offsetTable: false,
					latlngTransform: false,
					latOffset: 1.8,
					lngOffset: 1.8,
					dontMoveEach: 4
				};

				this.addObjectsToMap(this.map, data, 'farms', 15, 16, false, true, farmOptions);
				break;
			case 'table':
				this.addObjectsToTable($('#table'), data);
				break;
		}
	};

	app.prototype.addObjectsToTable = function ($tableContainer, data) {

		var items = [];
		var rowCount = Math.floor(data.data.length / data.columns.length);
		var tableContent = '';

		for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
			var rowOffset = rowIndex * data.columns.length;

			items.push({
				'Machinery': data.data[rowOffset + 14],
				'Cultivated area size': data.data[rowOffset + 13],
				'Full Name': data.data[rowOffset + 0],
				'Score': data.data[rowOffset + 4],
				'Location': data.data[rowOffset + 3],
				'Age': data.data[rowOffset + 5],
				'Education': data.data[rowOffset + 6],
				'Number of people in family': data.data[rowOffset + 7],
				'Crop': data.data[rowOffset + 8],
				'Variety yield': data.data[rowOffset + 10],
				'Motive': data.data[rowOffset + 11],
				'Water source': data.data[rowOffset + 12]
			});
		}

		items.sort(function (a, b) {

			var as = a['Score'];
			var bs = b['Score'];
			if (isNaN(as))
				as = 100;

			if (isNaN(bs))
				bs = 100;

			return bs - as;
		});

		for (var i = 0; i < items.length; i++) {

			var item = items[i];

			if (this.machineryType != 'all') {
				if (this.machineryType != item['Machinery'])
					continue;
			}

			var cultArea = item['Cultivated area size'] * 1;
			if (this.cultivatedAreaMin != -1 && this.cultivatedAreaMax != -1) {
				if (this.cultivatedAreaMin > cultArea || cultArea > this.cultivatedAreaMax)
					continue;
			}

			var filter = $('#search-control input').val().trim();
			if (filter) {
				if (item['Full Name'].toUpperCase().search(filter.toUpperCase()) == -1) {
					continue;
				}
			}

			var score = item['Score'] * 1;
			var rowColor = '';
			if (isNaN(score)) {
				rowColor = 'FDE6EC';
			}
			else {
				rowColor = score > 7 ? 'E9F5E7' : 'FCFBDC';
			}

			tableContent += '<tr style="background-color: #' + rowColor + ';">';
			tableContent += '<td>' + item['Full Name'] + '</td>';
			tableContent += '<td>' + item['Location']+ '</td>';
			tableContent += '<td>' + item['Score']+ '</td>';
			tableContent += '<td>' + item['Age']+ '</td>';
			tableContent += '<td>' + item['Education']+ '</td>';
			tableContent += '<td>' + item['Number of people in family']+ '</td>';
			tableContent += '<td>' + item['Crop']+ ', ' + item['Variety yield']+ ', ' + item['Motive']+ ', ' + item['Water source']+ '</td>';
			tableContent += '</tr>';
		}

		$tableContainer.find('tbody').empty().append(tableContent);

		$('#table table tbody tr').on('click', $.proxy(function () {

			this.showFarmProfile();
		}, this));
	};

	app.prototype.addObjectsToMap = function (map, data, indicator, latIndex, lngIndex, clustering, circles, options) {

		function markerClickHandler(event) {
			self.infoWindow.setPosition(event.latLng);

			var tooltipData = this.get('tooltip');
			var data = tooltipData.data;
			var html = '';

			switch (tooltipData.indicator) {
				case 'farms':
					html += '<div class="map-tooltip farms">';

					html += '<div class="data-block">';
					html += '<div><label>Name:&nbsp;</label>' + data['Name'] + '</div>';
					html += '<div><label>Sex:&nbsp;</label>' + data['Sex'] + '</div>';
					html += '<div><label>Birthday:&nbsp;</label>' + new Date(data['Birthday']).toLocaleDateString() + '</div>';
					html += '<div><label>Agricultural active:&nbsp;</label>' + data['AgriculturalActive'] + '</div>';
					html += '<div><label>Member type:&nbsp;</label>' + data['MemberType'] + '</div>';
					html += '<div><label>Card number:&nbsp;</label>' + data['CardNumber'] + '</div>';
					html += '<div><label>Farmer education:&nbsp;</label>' + data['FarmerEducation'] + '</div>';
					html += '</div>';

					html += '<div class="data-block">';
					html += '<div><label>Crop name:&nbsp;</label>' + data['Crop Name'] + '</div>';
					html += '<div><label>Area:&nbsp;</label>' + data['Area'] + '</div>';
					html += '<div><label>Area unit:&nbsp;</label>' + data['AreaUnit'] + '</div>';
					html += '<div><label>Water source:&nbsp;</label>' + data['WaterSource'] + '</div>';
					html += '<div><label>Motivation:&nbsp;</label>' + data['Motivation'] + '</div>';
					html += '<div><label>Machineries name:&nbsp;</label>' + data['Machineries Name'] + '</div>';
					html += '<div><label>Quantity:&nbsp;</label>' + data['Quantity'] + '</div>';
					html += '</div>';

					html += '<div class="data-block">';
					html += '<div><label>Region:&nbsp;</label>' + data['Region'] + '</div>';
					html += '<div><label>Latitude:&nbsp;</label>' + data['Latitude'] + '</div>';
					html += '<div><label>Longitude:&nbsp;</label>' + data['Longitude'] + '</div>';
					html += '<div><label>Head name:&nbsp;</label>' + data['HeadName'] + '</div>';
					html += '<div><label>Farm size:&nbsp;</label>' + data['FarmSize'] + '</div>';
					html += '<div><label>Cultivated size:&nbsp;</label>' + data['CultivatedSize'] + '</div>';
					html += '</div>';
					break;

				case 'churches':
					html += '<div class="map-tooltip churches">';

					html += '<p>' + (data['Church Name'] || data['Mosque Name']) + '</p>';
					html += '<div><label>Address:&nbsp;</label>' + data['Address'] + '</div>';
					break;

				case 'fatalities':
				case 'bocoharam':
					html += '<div class="map-tooltip bocoharam">';

					html += '<div><label>Event type:&nbsp;</label>' + data['EVENT_TYPE'] + '</div>';
					html += '<div><label>Interaction:&nbsp;</label>' + data['INTERACTION'] + '</div>';
					html += '<div><label>Fatalities:&nbsp;</label>' + data['FATALITIES'] + '</div>';
					html += '<div><label>Source:&nbsp;</label>' + data['SOURCE'] + '</div>';
					html += '<div>' + data['NOTES'] + '</div>';
					break;

				case 'schools':
					html += '<div class="map-tooltip schools">';

					html += '<p>' + data['School Name'] + '</p>';
					html += '<div><label>Address:&nbsp;</label>' + data['School Address'] + '</div>';
					html += '<div><label>Level of education:&nbsp;</label>' + data['Level of Education'] + '</div>';
					html += '<div><label>Number of students:&nbsp;</label>' + data['Number of Students, Total'] + '</div>';
					break;

				case 'hospital':
					html += '<div class="map-tooltip hospital">';

					html += '<p>' + data['Facility Name'] + '</p>';
					html += '<div><label>Facility type:&nbsp;</label>' + data['Facility Type'] + '</div>';
					html += '<div><label>Management:&nbsp;</label>' + data['Management'] + '</div>';
					break;

				case 'buildings':
					html += '<div class="map-tooltip buildings">';

					html += '<p>' + data['Governemnt office'] + '</p>';
					html += '<div><label>Address:&nbsp;</label>' + data['Address'] + '</div>';
					break;

				case 'refineries':
					html += '<div class="map-tooltip refineries">';

					html += '<div>' + data['Notes'] + '</div>';
					html += '<div><label>Estimated Quantity (Million scf):&nbsp;</label>' + data['Estimated Quantity (Million scf)'] + '</div>';
					break;

				default:
					html += '<div class="map-tooltip">';

					for (var i in data)
						html += self.buildTooltipMarkup(i + (data[i] == null ? '' : ':'), data[i]);
					break;
			}

			html += '</div>';

			self.infoWindow.setContent(html);
			self.infoWindow.open(self.map);
		}

		var options = options || {};

		var self = this;
		var rowCount = Math.floor(data.data.length / data.columns.length);
		var markers = [];
		var heatmapArray = [];

		this.clearMarkers(indicator);

		// hack - need to passe data into [data-target="more-data"] click handler
		if (!window.AppMapData)
			window.AppMapData = {};
		window.AppMapData[indicator] = data;

		var visibleColumnCount = data.columns.length < 15 ? data.columns.length : 15;
		for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
			var rowOffset = rowIndex * data.columns.length;

			var lat = data.data[rowOffset + latIndex] * 1;
			var lng = data.data[rowOffset + lngIndex] * 1;

			if (!isFinite(lat) || !isFinite(lng) || (lat === 0 && lng === 0)) {
				continue;
			}


			var markerIconName = indicator;
			if (options.partData && self.showDataTable[indicator]) {
				var showDataKoeff = self.showDataTable[indicator][self.timeBarMonth * 1 - 1];


				if (rowIndex / rowCount >= showDataKoeff) {
					markerIconName = 'markets';
				}
			}

			if (options.filterByDate) {
				var month = (new Date(data.data[rowOffset + options.dateIndex].value)).getMonth() + 1;

				if (self.timeBarMonth != month) {
					continue;
				}
			}

			var move = true;
			if (options.dontMoveEach) {
				move = (rowIndex + 1) % options.dontMoveEach != 0;
			}

			var latLng = options.latlngTransform ?
				self.latLngTransform(lat, lng, options.transformKoef, options.latOffset, options.lngOffset, options.rnd, options.offsetTable ? this.koeffTable[indicator] : null, move) :
				new google.maps.LatLng(lat, lng);
			heatmapArray.push(latLng);


			if (self.machineryType != 'all') {
				if (self.machineryType != data.data[rowOffset + 14])
					continue;
			}

			var cultArea = data.data[rowOffset + 13] * 1;
			if (self.cultivatedAreaMin != -1 && self.cultivatedAreaMax != -1) {
				if (self.cultivatedAreaMin > cultArea || cultArea > self.cultivatedAreaMax)
					continue;
			}

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
				indicator: indicator,
				data: tooltip
			};
			// end tooltip

			if (circles) {
				var val = data.data[rowOffset + options.valueIndex] * 1;

				if (val == 0)
					continue;

				var marker = new google.maps.Circle({
					strokeColor: options.strokeColor || '#FF0000',
					strokeOpacity: 0.6,
					strokeWeight: 1,
					fillColor: options.fillColor || '#FF0000',
					fillOpacity: 0.6,
					map: map,
					center: latLng,
					radius: options.size ? options.size : 3000 * Math.log(val) * (options.norm ? options.norm : 1)
				});

				if (indicator == 'markets' || indicator == 'alcogol') { }
				else {
					marker.set('tooltip', tooltipData);
					//marker.addListener('click', markerClickHandler);
					marker.addListener('click', function () {

						self.showFarmProfile();
					});
				}
			}
			else {
				var marker = new google.maps.Marker();
				marker.setPosition(latLng);
				marker.setIcon('img/icons_' + markerIconName + '.png?v=1');
				marker.setMap(map);

				if (indicator == 'markets' || indicator == 'alcogol') { }
				else {
					marker.set('tooltip', tooltipData);
					//marker.addListener('click', markerClickHandler);
					marker.addListener('click', function () {

						self.showFarmProfile();
					});
				}
			}

			//google.maps.event.addListener(marker, 'click', this.showPassport.bind(this, data.data[rowOffset + 1], data.data[rowOffset]));

			markers.push(marker);
		}

		if (!this.markers)
			this.markers = {};

		this.markers[indicator] = markers;

		if (!self.markerClusters)
			self.markerClusters = {};

		if (clustering) {
			if (!self.markerClusters[indicator]) {
				// http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/docs/reference.html
				self.markerClusters[indicator] = new window['MarkerClusterer'](map, markers, {
					ignoreHidden: true,
					styles: [
						{
							url: 'img/icons_' + markerIconName + '.png?v=1',
							width: 40,
							height: 40,
							textSize: 18,
							textColor: '#ffffff'
						}]
				});
			}
		}
	};

	app.prototype.getFarms = function () {
		var url = 'http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=ejetlie';
		var data = {
			"Header": [],
			"Stub": [],
			"Filter": [{
				"DimensionId": "measure",
				"Members": ['4389700']
			}],
			"Frequencies": [],
			"Dataset": "ejetlie"
		};

		return $.post(url, data);
	};

	app.prototype.showFarmProfile = function () {

		var self = this;

		$('#farm-profile-tmpl').tmpl({}).appendTo('#content');

		$('#back-button a').on('click', function () {

			$('#farm-profile').remove();
		});

		$('.score a').on('click', function () {

			if (self.loanTab) {
				$('.loan-item').hide();
				$(this).find('img').hide();
				$(this).find('span').text('APPROVE');
				$(this).removeClass('approved');
				self.loanTab = false;
			}
			else {
				$('.loan-item').show();
				$(this).find('img').show();
				$(this).find('span').text('APPROVED');
				$(this).addClass('approved');
				self.loanTab = true;
			}

			return false;
		});

		$('.profile-tabs li').on('click', function () {

			$('.profile-tabs li').removeClass('active');
			$(this).addClass('active');

			var tabName = $(this).data('tab-name');

			switch (tabName) {
				case 'farm':
					$('.farm-content').show();
					$('.project-content').hide();
					$('.loan-content').hide();
					break;
				case 'project':
					$('.project-content').show();
					$('.loan-content').hide();
					$('.farm-content').hide();
					break;
				case 'loan':
					$('.farm-content').hide();
					$('.project-content').hide();
					$('.loan-content').show();
					break;
				default:
					$('.farm-content').show();
					$('.project-content').hide();
					$('.loan-content').hide();
					break;
			}

			return false;
		});

		$('.stagesContainer').on('click', function () {

			if ($('.stages.good-scenario').hasClass('active')) {
				$('.stages.good-scenario').hide();
				$('.stages.bad-scenario').show();
				$('.stages.bad-scenario').addClass('active');
				$('.stages.good-scenario').removeClass('active');
			}
			else if ($('.stages.bad-scenario').hasClass('active')) {
				$('.stages.good-scenario').show();
				$('.stages.bad-scenario').hide();
				$('.stages.bad-scenario').removeClass('active');
				$('.stages.good-scenario').addClass('active');
			}
		});
	};

	google.maps.event.addDomListener(window, 'load', function () {
		var greeter = new app();
		greeter.run();
	});
})();