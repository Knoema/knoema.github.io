(function () {
	var numberOfClick = 0;
	var values = '';

	var handler = function (context) {

		var li = $(context);
		var circle = li.find('.circle');

		values += li.data('value');
		if (!circle.hasClass('selected')) {

			circle.addClass('selected ' + 'n' + numberOfClick);
			numberOfClick++;

			if (numberOfClick == 5) {
				$('ul.scale li .circle:not(.selected)').trigger('click');
			}
		}
	};

	var loadData = function () {

		var desc = {
			'Header': [
			   {
			   	'DimensionId': 'Time',
			   	'Members': [],
			   	'DimensionName': 'Time',
			   	'UiMode': 'range',
			   	'DateFields': [
				   {
				   	'DateColumn': '0',
				   	'DatasetId': 'zkwnurc'
				   }
			   	]
			   }
			],
			'Stub': [
			   {
			   	'DimensionId': 'country',
			   	'Members': [],
			   	'DimensionName': 'Country'
			   },
			   {
			   	'DimensionId': 'variants',
			   	'Members': [
				   '1000010',
				   '1000020',
				   '1000060',
				   '1000110',
				   '1000120',
				   '1000140'
			   	],
			   	'DimensionName': 'Variants'
			   }
			],
			'Filter': [
			   {
			   	'DimensionId': 'question',
			   	'Members': [
				   '1000000'
			   	],
			   	'DimensionName': 'Question'
			   },
			   {
			   	'DimensionId': 'measure',
			   	'Members': [
				   {
				   	'Key': -640,
				   	'Name': 's',
				   	'Formula': [
					   '5472080',
					   'sum',
					   '5472090',
					   'sum',
					   '+'
				   	]
				   }
			   	],
			   	'DimensionName': 'Measure'
			   }
			],
			'Frequencies': [
			   'D'
			],
			'Calendar': 0,
			'Dataset': 'zkwnurc',
			'RegionIdsRequired': true,
			'RegionDimensionId': 'country'
		};

		return $.post('https://knoema.com/api/1.0/data/pivot', desc);
	};

	var loadPopulationData = function () {

		var desc = {
			'Header': [{
				'DimensionId': 'Time',
				'Members': ['2016'],
				'DimensionName': 'Time',
				'DatasetId': 'UNWPP2015R',
				'Order': '0',
				'UiMode': 'individualMembers'
			}],
			'Stub': [{
				'DimensionId': 'location',
				'Members': ['1000000', '1000140', '1000150', '1000160', '1000170', '1000180', '1000190', '1000200', '1000210', '1000220', '1000230', '1000240', '1000250', '1000260', '1000270', '1000280', '1000290', '1000300', '1000310', '1000320', '1000330', '1000350', '1000360', '1000370', '1000380', '1000390', '1000400', '1000410', '1000420', '1000430', '1000450', '1000460', '1000470', '1000480', '1000490', '1000500', '1000510', '1000530', '1000540', '1000550', '1000560', '1000570', '1000590', '1000600', '1000610', '1000620', '1000630', '1000640', '1000650', '1000660', '1000670', '1000680', '1000690', '1000700', '1000710', '1000720', '1000730', '1000740', '1000750', '1000780', '1000790', '1000800', '1000810', '1000820', '1000830', '1000840', '1000850', '1001040', '1001050', '1001060', '1001070', '1001080', '1001090', '1001100', '1001110', '1001120', '1001130', '1001140', '1001160', '1001170', '1001180', '1001190', '1001200', '1001210', '1001220', '1001230', '1001240', '1001250', '1001260', '1001270', '1001280', '1001290', '1001300', '1001310', '1001320', '1001330', '1001360', '1001370', '1001380', '1001390', '1001400', '1001410', '1001420', '1001430', '1001440', '1001450', '1001470', '1001480', '1001490', '1001500', '1001510', '1001520', '1001530', '1001540', '1001550', '1001560', '1001570', '1001580', '1001590', '1001610', '1001620', '1001630', '1001640', '1001650', '1001660', '1001670', '1001680', '1001690', '1001700', '1001710', '1001720', '1001730', '1001740', '1001750', '1001760', '1001780', '1001790', '1001800', '1001810', '1001820', '1001830', '1001840', '1001850', '1001860', '1001890', '1001900', '1001910', '1001920', '1001930', '1001940', '1001950', '1001960', '1001970', '1001980', '1001990', '1002000', '1002010', '1002020', '1002030', '1002040', '1002050', '1002060', '1002070', '1002080', '1002090', '1002100', '1002110', '1002120', '1002130', '1002140', '1002160', '1002170', '1002180', '1002190', '1002200', '1002210', '1002220', '1002230', '1002250', '1002260', '1002270', '1002280', '1002290', '1002300', '1002310', '1002320', '1002330', '1002340', '1002350', '1002360', '1002370', '1002380', '1002470', '1002480', '1002500', '1002510', '1002520', '1002530', '1002540', '1002560', '1002570', '1002580', '1002590', '1002600', '1002610', '1002620', '1002640', '1002650', '1002660', '1002670', '1002680', '1002690', '1002700', '1002710', '1002720', '1000970', '1000880', '1000890', '1000900', '1000910', '1000920', '1000940', '1000950', '1000960', '1000980', '1000990', '1001000', '1001010', '1001020', '1002400', '1002410', '1002420', '1002430', '1002440'],
				'DimensionName': 'Location',
				'DatasetId': 'UNWPP2015R',
				'Order': '0',
				'isGeo': true
			}, {
				'DimensionId': 'variant',
				'Members': ['1000020'],
				'DimensionName': 'Variant',
				'DatasetId': 'UNWPP2015R',
				'Order': '1'
			}],
			'Filter': [{
				'DimensionId': 'variable',
				'Members': ['1000020'],
				'DimensionName': 'Variable',
				'DatasetId': 'UNWPP2015R',
				'Order': '0'
			}],
			'Frequencies': ['A'],
			'Dataset': 'UNWPP2015R',
			'Segments': null,
			'MeasureAggregations': null,
			'Calendar': 0,
			'RegionIdsRequired': true,
			'RegionDimensionId': 'location'
		};

		return $.post('https://knoema.com/api/1.0/data/pivot', desc);
	};

	var countriesByValues = function (pivotData) {

		var tmp = {};
		var regions = {};

		for (var i = 0; i < pivotData.length; i++) {
			var tuple = pivotData[i];
			if(!tmp[tuple['country']])
				tmp[tuple['country']] = [];

			tmp[tuple['country']].push({
				'variant': tuple.variants,
				'value': tuple.Value
			});

			regions[tuple['country']] = tuple.RegionId;
		}

		var countriesVyValues = {};
		for (var country in tmp) {

			var countryValues = tmp[country].sort(function (a, b) {
				var aint = parseInt(a.value, 10);
				var bint = parseInt(b.value, 10);

				return aint > bint ? -1 : 1;
			});

			var values = '';
			for (var i = 0; i < countryValues.length; i++) {
				values += countryValues[i].variant;
			}

			if (!countriesVyValues[values])
				countriesVyValues[values] = [];

			countriesVyValues[values].push({
				country: country,
				region: regions[country]
			});
		}

		return countriesVyValues;
	};

	var getPercentOfPopulation = function (countries, populationPivotData) {

		var worldPopulation = 0;
		var summ = 0;

		var regions = [];
		if (countries)
			for (var i = 0; i < countries.length; i++)
				regions.push(countries[i].region);

		for (var i = 0; i < populationPivotData.length; i++) {
			var tuple = populationPivotData[i];

			if ($.inArray(tuple.RegionId, regions) != -1)
				summ += tuple.Value;

			if (tuple.RegionId == 'WLD')
				worldPopulation = tuple.Value;
		}

		if (summ != 0)
			return { sum: summ / 1000, percent: (summ / worldPopulation) * 100 };

		return { sum: 0, percent: 0 };
	};

	var pieChart = function (container, percent) {
		container.highcharts({
			chart: {
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false,
				type: 'pie'
			},
			title: {
				text: null
			},
			tooltip: {
				pointFormat: '<b>{point.percentage:.1f}%</b>'
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: true,
						format: '{point.percentage:.1f} %',
						style: {
							color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
						}
					}
				}
			},
			series: [{
				name: '',
				colorByPoint: true,
				data: [{
					name: 'Your part',
					y: percent,
					sliced: true,
					selected: true
				}, {
					name: 'Another parh of population',
					y: 100 - percent
				}]
			}]
		});
	};

	$.when(loadData(), loadPopulationData()).done(function (pivot, populationPivot) {

		pivot = pivot[0];
		populationPivot = populationPivot[0];

		$('.start-button').on('click', function () {

			$('.start-screen').hide();
			$('.main-screen').show();
			
			$('.main-screen ul.scale li').on('click', function () {

				handler(this);

				if (numberOfClick == 6) {
					numberOfClick = 0;

					var sameCountries = countriesByValues(pivot.data)[values];
					var people = getPercentOfPopulation(sameCountries, populationPivot.data);

					if (sameCountries) {
						var lis = [];
						for (var i = 0; i < sameCountries.length; i++) {
							lis.push($('<li>', {
									text: sameCountries[i].country
								})
								.prepend($('<img>', {
									src: '//cdn.knoema.com/flags/normal/' + sameCountries[i].region.toLowerCase() + '.png'
								}))
							);
						}

						$('.same-countries').append(lis);
						$('.number').text(people.sum.toFixed(2));
						pieChart($('.percent'), people.percent);
					}
					else {
						$('.population-part').empty().append($('<p>', {
								text: 'You are pretty unique person. Your system of values does not match 24 most popular ones. Let the world know!'
							}));
					}

					$('.main-screen').hide();

					var newUl = $('<ul>', { 'class': 'scale' });
					for (var i = 0; i < 6; i++) {
						var item = $('.main-screen .circle.n' + i).parent().wrap('<div>').parent().html();
						newUl.append(item);
					}
					$('.finish-screen .scale-container').append($(newUl));
					$('.finish-screen').show();
				}
			});
		});
	});
})()