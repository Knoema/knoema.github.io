/// <reference path="typings/jquery.d.ts"/>

(function () {
	var host = 'http://zambiagpt.knoema.com';

	var projectsDataset = 'lrsnuag';

	var projectData = [];
	var projectColumns = [];

	var reforms = (function () {
		function reforms() {
		};

		reforms.prototype.run = function () {

			var _this = this;

			this.getProjects().done(function (projectData) {

				_this.projectData = projectData.data;
				_this.projectColumns = projectData.columns;

				for (var i = 0; i < _this.projectColumns.length; i++) {

					var name = _this.projectColumns[i].name;

					if (name == 'Projet/Reforme') _this.objectTypeIndex = i;
					if (name == 'Nom Projet') _this.nameIndex = i;
					if (name.indexOf('Deadline') == 0) _this.deadlineIndex = i;
					if (name == 'Database Code') _this.codeIndex = i;
					if (name == 'Catégorie des réformes') _this.categoryIndex = i;
					if (name == 'Type') _this.typeIndex = i;
					if (name == "Période d'adoption: Politique Complétement exécuté? oui-1, non-0") _this.periodIndex = i;
					if (name == "Source réforme : Element Déclencheur") _this.sourceIndex = i;

					if (name == "Période d'adoption: Politique Duree critiques") _this.pPolDurCri = i;
					if (name == "Période d'adoption: Politique Jour de démarrage") _this.pPolJouDem = i;
					if (name == "Période d'adoption: Politique Jour de finalisation") _this.pPolJouFin = i;
					if (name == "Période d'adoption: Politique Complétement exécuté? oui-1, non-0") _this.pPolOuiNon = i;
					if (name == "Période d'adoption: Politique Livrables") _this.pPolLiv = i;
					if (name == "Principal Responsible: Politique") _this.pPrincResPol = i;

					if (name == "Période d'exécution: validation Technique Duree critiques") _this.pTecDurCri = i;
					if (name == "Période d'exécution: validation Technique Jour de démarrage") _this.pTecJouDem = i;
					if (name == "Période d'exécution: validation Technique Jour de finalisation") _this.pTecJourFin = i;
					if (name == "Période d'exécution: validation Technique Complétement exécuté? oui-1, non-0") _this.pTecOuiNon = i;
					if (name == "Période d'exécution: validation Technique Livrables") _this.pTecLiv = i;
					if (name == "Principal Responsible: Technique") _this.pPrincResTec = i;

					if (name == "Période d'Exécution: Preparation et formulation: Duree critiques") _this.pForDurCri = i;
					if (name == "Période d'Exécution: Preparation et formulation: Jour de démarrage") _this.pForJouDem = i;
					if (name == "Période d'Exécution: Preparation et formulation: Jour de finalisation") _this.pForJouFin = i;
					if (name == "Période d'Exécution: Preparation et formulation Complétement exécuté? oui-1, non") _this.pForOuiNon = i;
					if (name == "Période d'Exécution: Preparation et formulation: Livrables") _this.pForLiv = i;
					if (name == "Principal Responsible: Préparation") _this.pPrincResPre = i;
				}

				_this.fillTable('total');
			});

			$('.reforms-container ul li').on('click', function () {
				$('.reforms-container ul li').removeClass('active');
				$(this).addClass('active');

				_this.fillTable($(this).data('tab-name'));
			});

			reforms.prototype.fillTable = function (status) {

				var getDate = function (strDate) {
					var partsOfDate = strDate.split('/');

					if (partsOfDate.length != 3)
						return null;

					return new Date(partsOfDate[2] + '-' + partsOfDate[1] + '-' + partsOfDate[0]);
				};

				var diffBetweenDates = function (date1, date2) {

					if (!date1 || !date2)
						return Infinity;

					return Math.abs((date1.getTime() - date2.getTime()) / (1000 * 3600 * 24 * 30));
				};
				
				var totalTrs = [];
				var delayedTrs = [];
				var ongoingTrs = [];
				var completedTrs = [];

				for (var i = 0; i < _this.projectData.length / _this.projectColumns.length; i++) {

					var offset = i * _this.projectColumns.length;

					//only for reforms
					if (_this.projectData[offset + _this.objectTypeIndex] != 'R')
						continue;

					var code = _this.projectData[offset + _this.codeIndex];

					var ongoing = true;
					var completed = false;

					//completed
					if (_this.projectData[offset + _this.periodIndex] == '1') {
						ongoing = false;
						completed = true;
						completedTrs.push($('<tr>', { 'data-code': code })
							.append($('<td>', { text: _this.projectData[offset + _this.nameIndex] }))
							.append($('<td>', { text: _this.projectData[offset + _this.deadlineIndex] }))
							.append($('<td>').append($('<img>', { src: './img/icon-arrow.png', 'class': 'arrow-icon' })))
						);
					}

					//delaued
					var first = parseInt(_this.projectData[offset + _this.pPolDurCri]) > diffBetweenDates(getDate(_this.projectData[offset + _this.pPolJouDem]), getDate(_this.projectData[offset + _this.pPolJouFin]));
					var secont = parseInt(_this.projectData[offset + _this.pTecDurCri]) > diffBetweenDates(getDate(_this.projectData[offset + _this.pTecJouDem]), getDate(_this.projectData[offset + _this.pTecJourFin]));
					var third = parseInt(_this.projectData[offset + _this.pForDurCri]) > diffBetweenDates(getDate(_this.projectData[offset + _this.pForJouDem]), getDate(_this.projectData[offset + _this.pForJouFin]));
					if ((first || secont || third) && !completed ) {
						ongoing = false;
						delayedTrs.push($('<tr>', { 'data-code': code })
							.append($('<td>', { text: _this.projectData[offset + _this.nameIndex] }))
							.append($('<td>', { text: _this.projectData[offset + _this.deadlineIndex] }))
							.append($('<td>').append($('<img>', { src: './img/icon-arrow.png', 'class': 'arrow-icon' })))
						);
					}

					//ongoing
					if (ongoing) {
						ongoingTrs.push($('<tr>', { 'data-code': code })
							.append($('<td>', { text: _this.projectData[offset + _this.nameIndex] }))
							.append($('<td>', { text: _this.projectData[offset + _this.deadlineIndex] }))
							.append($('<td>').append($('<img>', { src: './img/icon-arrow.png', 'class': 'arrow-icon' })))
						);
					}

					//total
					totalTrs.push($('<tr>', { 'data-code': code })
						.append($('<td>', { text: _this.projectData[offset + _this.nameIndex] }))
						.append($('<td>', { text: _this.projectData[offset + _this.deadlineIndex] }))
						.append($('<td>').append($('<img>', { src: './img/icon-arrow.png', 'class': 'arrow-icon' })))
					);
				}


				$('#count-total').text(totalTrs.length);
				$('#count-delayed').text(delayedTrs.length);
				$('#count-ongoing').text(ongoingTrs.length);
				$('#count-completed').text(completedTrs.length);

				_this.clearReformData();

				var $trs = [];
				switch (status) {
					case 'total': $trs = totalTrs; break;
					case 'delayed': $trs = delayedTrs; break;
					case 'ongoing': $trs = ongoingTrs; break;
					case 'completed': $trs = completedTrs; break;
				}
				$('.left-part').find('table tbody').empty().append($trs);

				$('.reforms-table .left-part table tbody tr').off('click');
				$('.reforms-table .left-part table tbody tr').on('click', function () {
					$('.reforms-table .left-part table tbody tr').removeClass('active');
					$('.reforms-table .left-part table tbody tr img.arrow-icon').hide();
					$(this).addClass('active');
					$(this).find('img.arrow-icon').show();

					_this.displayReformData($(this).data('code'));
				});
				$($('.reforms-table .left-part table tbody tr').get(0)).trigger('click');
			};

			reforms.prototype.displayReformData = function (code) {

				_this.clearReformData();

				for (var i = 0; i < _this.projectData.length / _this.projectColumns.length; i++) {

					var offset = i * _this.projectColumns.length;

					//only for reforms
					if (_this.projectData[offset + _this.objectTypeIndex] != 'R')
						continue;

					if (_this.projectData[offset + _this.codeIndex] != code)
						continue;

					var reformName = _this.projectData[offset + _this.nameIndex];
					var specialReform = false;//reformName == "Intégration de l'apprentissage et le stage dans le code du travail";
					var data = [
						reformName,
						_this.projectData[offset + _this.deadlineIndex],
						_this.projectData[offset + _this.typeIndex] + '. ' + _this.projectData[offset + _this.categoryIndex],
						_this.projectData[offset + _this.sourceIndex]
					];

					var pre = (_this.projectData[offset + _this.pForOuiNon] == '1' ? true : (_this.projectData[offset + _this.pForOuiNon] == '0' ? false : null));
					var tec = (_this.projectData[offset + _this.pTecOuiNon] == '1' ? true : (_this.projectData[offset + _this.pTecOuiNon] == '0' ? false : null));
					var pol = (_this.projectData[offset + _this.pPolOuiNon] == '1' ? true : (_this.projectData[offset + _this.pPolOuiNon] == '0' ? false : null));
					var periodData = [
						"Execution Period",
						"Preparation",
						"Technical",
						"Policy",

						"Fully executed?",
						(_this.projectData[offset + _this.pForOuiNon] == '1' ? 'Yes' : (_this.projectData[offset + _this.pForOuiNon] == '0' ? 'No' : '')),
						(_this.projectData[offset + _this.pTecOuiNon] == '1' ? 'Yes' : (_this.projectData[offset + _this.pTecOuiNon] == '0' ? 'No' : '')),
						(_this.projectData[offset + _this.pPolOuiNon] == '1' ? 'Yes' : (_this.projectData[offset + _this.pPolOuiNon] == '0' ? 'No' : '')),

						"Start day",
						_this.projectData[offset + _this.pForJouDem],
						_this.projectData[offset + _this.pTecJouDem],
						_this.projectData[offset + _this.pPolJouDem],

						"Day finalized",
						_this.projectData[offset + _this.pForJouFin],
						_this.projectData[offset + _this.pTecJourFin],
						_this.projectData[offset + _this.pPolJouFin],

						"Critical duration (months)",
						_this.projectData[offset + _this.pForDurCri],
						_this.projectData[offset + _this.pTecDurCri],
						_this.projectData[offset + _this.pPolDurCri],

						"Senior Manager",
						_this.projectData[offset + _this.pPrincResPre],
						_this.projectData[offset + _this.pPrincResTec],
						_this.projectData[offset + _this.pPrincResPol],

						"Deliverables",
						_this.projectData[offset + _this.pForLiv],
						_this.projectData[offset + _this.pTecLiv],
						_this.projectData[offset + _this.pPolLiv],
					];

					var hintText = [
						'<ul><li>TDR or committee to prepare the reform</li><li>Exchange with stakeholders (deliverable report or report)</li><li>Draft (s) of the draft text</li><li>Draft text transmitted to the Government SG</li></ul>',
						'<ul><li>Primature internal committee (conformity assessment)</li><li>Annealing of the draft text to the different administrative units involved or impacted</li><li>Comments and opinions on the draft text (back administrative entities)</li><li>Draft incorporating comments</li><li>Internal Committee (follow consideration of observations)</li><li>Technical Committee (Technical validation background)</li><li>Draft text transmitted Supreme Court opinion if applicable</li><li>Internal Committee (follow consideration technical review committee and / or Supreme Court)</li><li>Draft text registered for consideration by the Cabinet</li></ul>',
						'<ul><li>Draft text Council of Ministers (rejection adoption with reservations, final adoption)</li><li>Monitoring committee for integration reserves Cabinet</li><li>Decree referral meeting if Bill</li><li>Adoption National Assembly (technical commission, commission law, plenary)</li><li>Decree of promulgation of the law</li><li>Text Numbering</li><li>Signature of the text by the PM and PR</li><li>Publication in the Official Journal of the text</li></ul>'
					];

					var thead = $('<thead>');
					var headTr = $('<tr>');
					headTr.append($('<th>', { text: periodData[0] }));
					headTr.append($('<th>', { text: periodData[1], 'class': (pre ? 'uoi' : (pre === false ? 'non' : '')) }).append($('<img>', { src: './img/icon_info.png', 'class': 'hint', 'data-hint': hintText[0] })));
					headTr.append($('<th>', { text: periodData[2], 'class': (tec ? 'uoi' : (tec === false ? 'non' : '')) }).append($('<img>', { src: './img/icon_info.png', 'class': 'hint', 'data-hint': hintText[1] })));
					headTr.append($('<th>', { text: periodData[3], 'class': (pol ? 'uoi' : (pol === false ? 'non' : '')) }).append($('<img>', { src: './img/icon_info.png', 'class': 'hint', 'data-hint': hintText[2] })));
					thead.append(headTr);
					$('table.period').append(thead);

					for (var k = 1; k < 7; k++) {
						var tr = $('<tr>');

						if (k == 6 && specialReform) {
							tr.append($('<td>', { text: periodData[4 * 6], 'class': '' }));
							tr.append($('<td>', { 'class': 'uoi' }));
							tr.append($('<td>', { 'class': 'uoi' })
								.append($('<a>', { href: "./documents/decret contrat d'apprentissage-technique.pdf", target: '_blank' }).append($('<img>', { src: './img/pdf.png', 'class': 'doc-image' })))
								.append($('<a>', { href: './documents/reforme apprentissage et stage-technique.docx', target: '_blank' }).append($('<img>', { src: './img/doc.png', 'class': 'doc-image' })))
							);
							tr.append($('<td>', { 'class': 'uoi' })
								.append($('<a>', { href: './documents/decret sur le stage version signee-politique.pdf', target: '_blank' }).append($('<img>', { src: './img/pdf.png', 'class': 'doc-image' })))
								.append($('<a>', { href: './documents/loi 2015-04 sur le stage-politique.pdf', target: '_blank' }).append($('<img>', { src: './img/pdf.png', 'class': 'doc-image' })))
							);
						}
						else {
							for (var j = 0; j < 4; j++) {

								var strClass = '';
								switch (j) {
									case 1: strClass = (pre ? 'uoi' : (pre === false ? 'non' : ''));
										break;
									case 2: strClass = (tec ? 'uoi' : (tec === false ? 'non' : ''));
										break;
									case 3: strClass = (pol ? 'uoi' : (pol === false ? 'non' : ''));
										break;
								}
								tr.append($('<td>', { text: periodData[4 * k + j], 'class': strClass }));
							}
						}

						$('table.period').append(tr);
					}

					var $bubbleContainer = $('<div>', { style: "display:none;", id: "bubble-container" });
					$bubbleContainer.appendTo($('body'));
					$('img.hint').on('mouseover', function (e) {

						$bubbleContainer
							.empty()
							.append($(this).data('hint'))
							.css({ left: e.pageX + 10, top: e.pageY + 10, bottom: 'auto', right: 'auto' })
							.show();
					});
					$('img.hint').on('mouseleave', function () {
						$bubbleContainer.hide();
					});

					$('.right-part .general-info tr').each(function (index, item) {

						$($(item).find('td')[1]).text(data[index]);
					});

					break;
				}
			};

			reforms.prototype.clearReformData = function () {

				$('.right-part .period').empty();

				$('.right-part .general-info tr').each(function (index, item) {

					$($(item).find('td')[1]).text('');
				});
			};
		};

		reforms.prototype.getProjects = function () {

			var url = host + '/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=' + projectsDataset;
			var data = {
				'Header': [],
				'Stub': [],
				'Filter': [],
				//'Filter': [{
				//	'DimensionId': 'measure',
				//	'DimensionName': 'Measure',
				//	'DatasetId': projectsDataset,
				//	'Members': ['6144510', '6144520', '6144530']
				//}],
				'Frequencies': [],
				'Dataset': projectsDataset,
				'Segments': null,
				'MeasureAggregations': null
			};

			return $.post(url, data);
		};

		return reforms;
	})();

	var r = new reforms();
	r.run();
})();