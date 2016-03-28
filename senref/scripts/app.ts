///<reference path='./defs/google.maps.d.ts' />
///<reference path='./defs/jquery.d.ts' />

class App {
	static datasetId;// = 'ojtymab';
	static host;// = 'collect.knoema.org';
	static dashSummary;// = 'mtbehfb';
	static dashDetails;// = 'gueosmc';
	static dashRegionSummary;// = 'mtbehfb';
	static dashRegionDetails;// = 'gueosmc';
	static dashCountrySummary;
	static dashCountryDetails;
	static skipFirstColumns;// = 3;
	static departmentColumnIndex;// = 2;
	static provinceColumnIndex;// = 1;
	static dateColumnIndex;// = 0;

	static percentToRGB(percent) {
		percent = 100 - percent;

		if (percent === 100) {
			percent = 99
		}
		var r, g, b;

		if (percent < 50) {
			// green to yellow
			r = Math.floor(255 * (percent / 50));
			g = 255;

		} else {
			// yellow to red
			r = 255;
			g = Math.floor(255 * ((50 - percent % 50) / 50));
		}
		b = 0;

		return "rgb(" + r + "," + g + "," + b + ")";
	}

    static init() {
		// read settings
		['datasetId', 'host', 'dashSummary', 'dashDetails', 'dashRegionSummary', 'dashRegionDetails', 'dashCountrySummary', 'dashCountryDetails'].forEach(field => {
			this[field] = $('#settings_' + field).val();
		});
		['skipFirstColumns', 'departmentColumnIndex', 'provinceColumnIndex', 'dateColumnIndex'].forEach(field => {
			this[field] = parseInt($('#settings_' + field).val());
		});
		
		// init legend
		{
			var $legend = $('#legend');
			for (var i = 0; i <= 10; i++) {
				var item = $('<div class="color-item" style="background-color: ' + this.percentToRGB(i * 10) + ';"></div>');
				$legend.append(item);
			}
		}

		var refreshVoteCount = () => {
			$.getJSON('http://' + this.host + '/api/forms/sr20160311/status').done(result => {
				var formatedVoteCount = window['numeral'](result.all).format('0,0');
				$('#voteCount').html(formatedVoteCount);
			});
		}
		refreshVoteCount();
		setInterval(refreshVoteCount, 5000);

		$('.passport-popup').on('click', '.passport__close', event => $(event.delegateTarget).hide());

		// init map
		var map = new google.maps.Map(document.getElementById('map'), <any>{
			mapTypeControl: false,
			zoom: 4,
			center: { lat: 0, lng: 0 }
        });

		$('#showCountrySummary').on('click', event => {
			if ($('#tab-country-summary iframe').length <= 0) {
				var summaryUrl = 'http://knoema.com/resource/embed/' + this.dashCountrySummary + '/?noHeader=1';
				var detailsUrl = 'http://knoema.com/resource/embed/' + this.dashCountryDetails + '/?noHeader=1';

				$('#tab-country-summary').html('<iframe src="' + summaryUrl + '">')
				$('#tab-country-details').html('<iframe src="' + detailsUrl + '">')
			}

			$('#countrySummaryPopup').show();
		});

		var showDepartmentPassposrt = (depName) => {
			if (depName != null) {
				var summaryUrl = 'http://knoema.com/resource/embed/' + this.dashSummary + '/?noHeader=1&department=' + encodeURI(depName);
				var detailsUrl = 'http://knoema.com/resource/embed/' + this.dashDetails + '/?noHeader=1&department=' + encodeURI(depName);
				$('#passportPopup .title').html(depName);
				$('#tab-summary').html('<iframe src="' + summaryUrl + '">')
				$('#tab-details').html('<iframe src="' + detailsUrl + '">')
				$('#passportPopup').show()
			}
		}

		var showProvincePassposrt = (depName) => {
			if (depName != null) {
				var summaryUrl = 'http://knoema.com/resource/embed/' + this.dashRegionSummary + '/?noHeader=1&region=' + encodeURI(depName);
				var detailsUrl = 'http://knoema.com/resource/embed/' + this.dashRegionDetails + '/?noHeader=1&region=' + encodeURI(depName);
				$('#passportPopup .title').html(depName);
				$('#tab-summary').html('<iframe src="' + summaryUrl + '">')
				$('#tab-details').html('<iframe src="' + detailsUrl + '">')
				$('#passportPopup').show()
			}
		}

		map['data'].loadGeoJson('./scripts/senegal-provinces.json');
		map['data'].loadGeoJson('./scripts/senegal-departments.json');
		map['data'].setStyle({
			strokeWeight: 1,
			visible: false
		});
		map['data'].addListener('click',(event) => {
			if ($('#optionDepartments').is(':checked')) {
				showDepartmentPassposrt(event.feature.getProperty('regionName'));
			} else {
				showProvincePassposrt(event.feature.getProperty('regionName'));
			}
		});

		// fit map to senegal
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({ 'address': 'Senegal' }, (results, status) => {
			if (status == google.maps.GeocoderStatus.OK) {
				map.fitBounds(results[0].geometry.bounds);
			} else {
				// Senegal
				map.fitBounds(new google.maps.LatLngBounds(
					new google.maps.LatLng(12.307289, -17.529848),
					new google.maps.LatLng(16.693054, -11.348607)
				));
			}
		});

		var markers: google.maps.Marker[];

		this.getDepartments().done((provinces, departments) =>
		{
			this.getData().done(data =>
			{
				var currentAnswers: string[];
				var currentColumnIndex: number;
				var currentDate: string;
				var $timeline = $('#timeline');

				// Firstly, init timeline and set currentDate
				{
					var dates = [];
					for (var rowOffset = 0; rowOffset < data.data.length; rowOffset += data.columns.length) {
						var date = data.data[rowOffset];
						if (date != null && dates.indexOf(date.value) < 0) {
							dates.push(date.value);
						}
					}

					dates = dates.sort();

					var width = 100 / dates.length;

					dates.forEach((date, index) => {
						var dateParts = date.split('/');
						$timeline.append('<div style="width:' + width + '%;" class="item ' + (index == (dates.length - 1) ? 'active' : '') + '" data-date="' + date +
							'"><span class="day">' + parseInt(dateParts[1]) + '</span>&nbsp;<span class="month">mars</span></div>');
					});

					currentDate = dates[dates.length - 1];
				}

				this.refreshSidebar(data, currentDate);

				var addMarkers = () => {
					if (markers != null) {
						markers.forEach(marker => marker.setMap(null));
						markers = null;
					}

					//if (currentColumnIndex != null) {
						var regions;
						var regionColumnIndex;
						if ($('#optionDepartments').is(':checked')) {
							regionColumnIndex = this.departmentColumnIndex;
							regions = departments;
						} else {
							regionColumnIndex = this.provinceColumnIndex;
							regions = provinces;
						}

						if (currentAnswers == null) {
							markers = this.showQuestionStat(map, currentColumnIndex, data, currentDate, regions, regionColumnIndex);
						} else {
							markers = this.showAnswerStat(map, currentColumnIndex, currentAnswers, data, currentDate, regions, regionColumnIndex);
						}
						
						if ($('#optionBubbles').is(':checked')) {
							map['data'].forEach(feature => map['data'].revertStyle(feature));
							markers.forEach(m => m.setMap(map));
						} else {
							var markersByRegionId = {};
							markers.forEach(m => markersByRegionId[m['_regionId']] = m);
							
							map['data'].forEach(feature => {
								map['data'].revertStyle(feature);

								var regionMarker = markersByRegionId[feature.getId()];
								if (regionMarker != null) {
									console.log(feature.getId(), regionMarker);

									var percent = regionMarker._percent;
									var regionName = regionMarker._departmentName;
									feature.setProperty('regionName', regionName);

									if (percent != null) {
										map['data'].overrideStyle(feature, {
											fillColor: this.percentToRGB(percent * 100),
											visible: true,
										});
									}
								}
							});
						}

						markers.forEach(m => google.maps.event.addListener(m, 'click', function (event) {
							if ($('#optionDepartments').is(':checked')) {
								showDepartmentPassposrt(this._departmentName);
							} else {
								showProvincePassposrt(this._departmentName);
							}
						}));
					//}
				}

				addMarkers();

				$('#statistics').on('click', '.results', event => {
					$(event.delegateTarget).find('.results.white').removeClass('white');
					$(event.delegateTarget).find('.bar.active').removeClass('active');

					currentColumnIndex = $(event.currentTarget).toggleClass('white', true).data('column-index');

					currentAnswers = null;

					addMarkers();
				});

				$('#statistics').on('click', '.sr-progress > .bar', event => {
					event.stopPropagation();

					$(event.delegateTarget).find('.results.white').removeClass('white');
					$(event.delegateTarget).find('.bar.active').removeClass('active');

					var $bar = $(event.currentTarget).toggleClass('active', true);
					currentAnswers = $bar.data('answers').split('|');
					currentColumnIndex = $bar.closest('.results').toggleClass('white', true).data('column-index');

					addMarkers();
				});

				$('#optionDepartments, #optionProvinces').on('change', event => addMarkers());

				$('#optionBubbles, #optionHeatmap').on('change', event => addMarkers());

				$timeline.on('click', '.item:not(.disabled)', event => {
					$(event.delegateTarget).find('.item.active').removeClass('active');
					currentDate = $(event.currentTarget).toggleClass('active', true).data('date');

					this.refreshSidebar(data, currentDate);

					if (currentColumnIndex != null) {
						if (currentAnswers != null) {
							var strAnswers = currentAnswers.join('|');

							var $bar;
							if (strAnswers.indexOf('|') >= 0) {
								$bar = $('#statistics .results[data-column-index="' + currentColumnIndex + '"] .bar[data-answers*="|"]');
							} else {
								$bar = $('#statistics .results[data-column-index="' + currentColumnIndex + '"] .bar[data-answers="' + strAnswers + '"]');
							}
							
							if ($bar.length > 0) {
								$bar.toggleClass('active', true).closest('.results').toggleClass('white', true);
							} else {
								currentColumnIndex = null;
								currentAnswers = null;
							}
						}
						else {
							var $results = $('#statistics .results[data-column-index="' + currentColumnIndex + '"]');
							$results.toggleClass('white', true);
						}
					}

					addMarkers();
				});
			});
		});
    }

	static refreshSidebar(data: any, currentDate: string) {
		// prepare stat structure (skip 3 first columns)
		var stat = data.columns.slice(this.skipFirstColumns).map(column => {
			return {
				question: column.name,
				answers: {}
			};
		});

		// calc counts (skip 3 first columns)
		var voteCount = 0;
		for (var rowOffset = 0; rowOffset < data.data.length; rowOffset += data.columns.length) {
			if (data.data[rowOffset + this.dateColumnIndex] != null && data.data[rowOffset + this.dateColumnIndex].value == currentDate) {
				voteCount++;

				for (var colIndex = this.skipFirstColumns; colIndex < data.columns.length; colIndex++) {
					var answers = stat[colIndex - this.skipFirstColumns].answers
					var value = data.data[rowOffset + colIndex];

					if (value != null) {
						if (value in answers) {
							answers[value] += 1;
						} else {
							answers[value] = 1;
						}
					}
				}
			}
		}

		var formatedVoteCount = window['numeral'](voteCount).format('0,0');
		$('#voteCountByDate').html(formatedVoteCount);

		var questionAnswers = {
			'HowYouVote': ['OUI', 'NON', 'ABSTENTION'],
			'ChangedYourMind': ['OUI', 'NON'],
			'Sex': ['Homme', 'Femme']
		};

		// calc percentages
		stat.forEach(item => {
			var total = 0;
			var answers = [];

			if (item.question in questionAnswers) {
				answers = questionAnswers[item.question];
			} else {
				for (var answer in item.answers) {
					answers.push(answer);
				}
			}

			answers.forEach(answer => total += item.answers[answer])
			
			var percentages = answers
				.map(answer => {
					var percent = Math.round(item.answers[answer] / total * 100);
					return {
						label: answer,
						value: percent,
						answers: [answer]
					};
				});

			if (!(item.question in questionAnswers)) {
				percentages = percentages.sort((a, b) => b.value - a.value);
			}

			item.percentages = percentages.slice(0, 4);
			
			var percentSum = 0;
			item.percentages.slice(0, item.percentages.length - 1).forEach(answer => percentSum += answer.value);

			var lastPercentage = item.percentages[item.percentages.length - 1];
			if (lastPercentage != null) {
				lastPercentage.value = 100 - percentSum;

				if (answers.length > 4) {
					lastPercentage.label = 'AUTRE';
					lastPercentage.answers = percentages.slice(3).map(p => p.label);
				}
			}
		});

		var $stat = $('#statistics').html('');

		var colors = {
			1: 'green',
			2: 'pink',
			3: 'lightgreen'
		};

		stat.forEach((item, itemIndex) => {
			if (item.question == 'YourReason') return;
			var values = item.percentages.map(p => p.label + ': ' + p.value + '%');

			var progress = item.percentages
				//.slice(0, item.percentages.length - 1)
				.map((p, i) => '<div class="bar ' + ((i + 1) in colors ? colors[i + 1] : '') + '" style="width: ' + p.value + '%" data-answers="' + p.answers.join('|') + '"></div>');
			
			$stat.append(
				'<div class="results" data-column-index="' + (itemIndex + this.skipFirstColumns) + '">' +
					'<div class="sr-label">' + this.datasetColumnNames[item.question] + '</div>' +
					'<div class="sr-progress">' + progress.join('') + '</div>' +
					'<span class="values">' + values.join(', ') + '</span>' +
				'</div>'
			);
		});
	}
	
	static getData(): JQueryDeferred<{ data: any[]; columns: any[]}> {
		var def = $.Deferred();

		$.getJSON('http://knoema.com/api/1.0/meta/dataset/' + this.datasetId + '/dimension/region').done(dimension => {
			$.post('http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=' + this.datasetId, {
				"Header": [],
				"Stub": [],
				"Filter": [{
					"DimensionId": "region",
					"Members": dimension.items.map(i => i.key),
					"DimensionName": "region",
					"DatasetId": this.datasetId,
					"Order": "0",
					"isGeo": true
				}],
				"Frequencies": [],
				"Dataset": this.datasetId,
				"Segments": null,
				"MeasureAggregations": null
			})
			.done(data => def.resolve(data));
		});

		return def;
	}

	static getDepartments(): JQueryDeferred<{}> {
		var def = $.Deferred();

		$.getJSON('./scripts/regions.json').done(senegal => {
			var departments = {};
			var regions = {};
			senegal.Regions.forEach(region => {
				regions[region.Name == 'Thies' ? 'Thiès' : region.Name] = region;
				region.Regions.forEach(department => {
					var depName = this.datasetDepartmentNames[department.Id];
					if (depName != null) {
						departments[depName] = department;
					} else {
						console.log(department.Id, 'is not found in databaseDepartmentNames');
					}
				});
			});
			def.resolve(regions, departments);
		});

		return def;
	}

	static showQuestionStat(map: google.maps.Map, columnIndex: number, data: any, currentDate: string, departments: any, regionColumnIndex: number): google.maps.Marker[] {
		var depStat = {};

		for (var rowOffset = 0; rowOffset < data.data.length; rowOffset += data.columns.length) {
			if (data.data[rowOffset + this.dateColumnIndex] != null && data.data[rowOffset + this.dateColumnIndex].value == currentDate) {
				if (columnIndex == null || data.data[rowOffset + columnIndex] != null) {
					var depName = data.data[rowOffset + regionColumnIndex];
					if (depName in depStat) {
						depStat[depName] += 1;
					} else {
						depStat[depName] = 1;
					}
				}
			}
		}
		
		var markers = [];

		var max = 0;
		for (var depName in depStat) {
			if (depStat[depName] > max) {
				max = depStat[depName];
			}
		}

		for (var depName in depStat) {
			if (depName in departments) {
				var department = departments[depName];

				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(department.Latitude, department.Longitude),
					icon: {
						path: google.maps.SymbolPath.CIRCLE,
						fillColor: 'orange',
						fillOpacity: 0.8,
						strokeColor: 'black',
						strokeWeight: 1,
						scale: 5 + depStat[depName] / max * 30,
					},
					_departmentName: depName //$('#optionDepartments').is(':checked') ? depName : null
				});

				markers.push(marker);
			} else {
				console.log(depName);
			}
		}

		return markers;
	}

	static showAnswerStat(map: google.maps.Map, columnIndex: number, targetAnswers: string[], data: any, currentDate: string, departments: any, regionColumnIndex: number): google.maps.Marker[]{
		// vote count by question for each department
		var depStat = {};
		
		// vote count by answer for each departmnet
		var depAnswerStat = {};

		for (var rowOffset = 0; rowOffset < data.data.length; rowOffset += data.columns.length) {
			if (data.data[rowOffset + this.dateColumnIndex] != null && data.data[rowOffset + this.dateColumnIndex].value == currentDate) {

				var depName = data.data[rowOffset + regionColumnIndex];
				if (depName in depStat) {
					depStat[depName] += 1;
				} else {
					depStat[depName] = 1;
				}

				if (!(depName in depAnswerStat)) {
					depAnswerStat[depName] = 0;
				}

				var answer = data.data[rowOffset + columnIndex];
				if (answer != null && targetAnswers.indexOf(answer) >= 0) {
					depAnswerStat[depName] += 1;
				}
			}
		}

		var max = 0;
		for (var depName in depStat) {
			if (depStat[depName] > max) {
				max = depStat[depName];
			}
		}

		var markers = [];

		for (var depName in depStat) {
			if (depName in departments) {
				var department = departments[depName];

				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(department.Latitude, department.Longitude),
					icon: {
						path: google.maps.SymbolPath.CIRCLE,
						fillColor: this.percentToRGB(depAnswerStat[depName] / depStat[depName] * 100),
						fillOpacity: 0.5,
						strokeColor: 'black',
						strokeWeight: 1,
						scale: 5 + depStat[depName] / max * 30
					},
					_percent: depAnswerStat[depName] / depStat[depName],
					_regionId: department.Id,
					_departmentName: depName // $('#optionDepartments').is(':checked') ? depName : null
				});

				console.log(marker['marker'], marker['_percent']);

				markers.push(marker);
			} else {
				console.log(depName);
			}
		}

		return markers;
	}

	private static datasetColumnNames = {
		'HowYouVote': 'Comment avez-vous vote pour ce referendum ?',
		'ChangedYourMind': 'Avez-vous considere vote autrement dans un premier temps ?',
		'YourReason': 'Quelle raison principale a motive votre choix ?',
		'Sex': 'Etes-vous',
		'Education': 'Quel est votre niveau d’education ?',
		'Occupation': 'Quelle est votre situation professionnelle ?',
		'YouLikePresident': 'Comment evaluez-vous le travail du president macky sall depuis 2012 ?',
		'Age': 'Quel est votre groupe d’age ?',
		'CountryDirection': 'Pensez-vous que le pays va vers la bonne direction ?',
		'Religion': 'Quelle est votre affiliation religieuse ?',
		'Ethnos': 'Quel est votre groupe ethnique ?',
		'Politics': 'Pour qui avez-vous vote en 2012 ?',
	};

	private static datasetDepartmentNames = {
		'SN-DK-DD': 'Département de Dakar',
		'SN-DK-GU': 'Département de Guédiawaye',
		'SN-DK-PI': 'Département de Pikine',
		'SN-DK-RU': 'Département de Rufisque',
		'SN-DB-BA': 'Département de Bambey',
		'SN-DB-MB': 'Département de Mbacké',
		'SN-DB-DD': 'Département de Diourbel',
		'SN-FK-FD': 'Département de Fatick',
		'SN-FK-FO': 'Département de Foundiougne',
		'SN-FK-GO': 'Département de Gossas',
		'SN-KA-BI': 'Département de Birkelane',
		'SN-KA-KA': 'Département de Kaffrine',
		'SN-KA-KO': 'Département de Koungheul',
		'SN-KA-MH': 'Département de Malem-Hodar',
		'SN-KL-GU': 'Département de Guinguinéo',
		'SN-KL-KA': 'Département de Kaolack',
		'SN-KL-ND': 'Département de Nioro du Rip',
		'SN-KD-KD': 'Département de Kolda',
		'SN-KD-MY': 'Département de Médina Yoro Foulah',
		'SN-KD-VE': 'Département de Vélingara',
		'SN-KE-KE': 'Département de Kédougou',
		'SN-KE-SL': 'Département de Salemata',
		'SN-KE-SA': 'Département de Saraya',
		'SN-LG-KE': 'Département de Kébémer',
		'SN-LG-LI': 'Département de Linguère',
		'SN-LG-LD': 'Département de Louga',
		'SN-MT-KA': 'Département de Kanel',
		'SN-MT-MA': 'Département de Matam',
		'SN-MT-RF': 'Département de Ranérou-Ferlo',
		'SN-SE-BO': 'Département de Bounkiling',
		'SN-SE-GO': 'Département de Goudomp',
		'SN-SE-SD': 'Département de Sédhiou',
		'SN-SL-DA': 'Département de Dagana',
		'SN-SL-PO': 'Département de Podor',
		'SN-SL-SD': 'Département de Saint-Louis',
		'SN-TC-BA': 'Département de Bakel',
		'SN-TC-GO': 'Département de Goudiry',
		'SN-TC-KO': 'Département de Koumpentoum',
		'SN-TC-TD': 'Département de Tambacounda',
		'SN-TH-MB': 'Département de M\'bour',
		'SN-TH-TD': 'Département de Thiès',
		'SN-TH-TI': 'Département de Tivaouane',
		'SN-ZG-BI': 'Département de Bignona',
		'SN-ZG-OU': 'Département Oussouye',
		'SN-ZG-ZD': 'Département de Ziguinchor',
	};
}