/// <reference path="typings/jquery.d.ts"/>

(function () {
	var host = 'http://pspp.knoema.com';

	var projectsDataset = 'tyunxic';

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

					if (name == "Période d'adoption: Politique Duree critiques") _this.pPolDurCri = i;
					if (name == "Période d'adoption: Politique Jour de démarrage") _this.pPolJouDem = i;
					if (name == "Période d'adoption: Politique Jour de finalisation") _this.pPolJouFin = i;
					if (name == "Période d'exécution: validation Technique Duree critiques") _this.pTecDurCri = i;
					if (name == "Période d'exécution: validation Technique Jour de démarrage") _this.pTecJouDem = i;
					if (name == "Période d'exécution: validation Technique Jour de finalisation") _this.pTecJourFin = i;
					if (name == "Période d'Exécution: Preparation et formulation: Duree critiques") _this.pForDurCri = i;
					if (name == "Période d'Exécution: Preparation et formulation: Jour de démarrage") _this.pForJouDem = i;
					if (name == "Période d'Exécution: Preparation et formulation: Jour de finalisation") _this.pForJouFin = i;
				}

				_this.fillTable('total');
			});

			$('.reforms-container ul li').on('click', function () {
				$('.reforms-container ul li').removeClass('active');
				$(this).addClass('active');

				_this.fillTable($(this).data('tab-name'));
			});

			reforms.prototype.fillTable = function (status) {
				
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

					//total
					totalTrs.push($('<tr>', { 'data-code': code })
						.append($('<td>', { text: _this.projectData[offset + _this.nameIndex] }))
						.append($('<td>', { text: _this.projectData[offset + _this.deadlineIndex] }))
						.append($('<td>').append($('<img>', { src: './img/icon-arrow.png', 'class': 'arrow-icon' })))
					);

					//delaued
					var first = _this.projectData[offset + _this.pPolDurCri] > (_this.projectData[offset + _this.pPolJouDem] - _this.projectData[offset + _this.pPolJouFin]);
					var secont = _this.projectData[offset + _this.pTecDurCri] > (_this.projectData[offset + _this.pTecJouDem] - _this.projectData[offset + _this.pTecJourFin]);
					var third = _this.projectData[offset + _this.pForDurCri] > (_this.projectData[offset + _this.pForJouDem] - _this.projectData[offset + _this.pForJouFin]);
					if (first || secont || third)
						delayedTrs.push($('<tr>', { 'data-code': code })
							.append($('<td>', { text: _this.projectData[offset + _this.nameIndex] }))
							.append($('<td>', { text: _this.projectData[offset + _this.deadlineIndex] }))
							.append($('<td>').append($('<img>', { src: './img/icon-arrow.png', 'class': 'arrow-icon' })))
						);

					//ongoing
					if (_this.projectData[offset + _this.periodIndex] == '0')
						ongoingTrs.push($('<tr>', { 'data-code': code })
							.append($('<td>', { text: _this.projectData[offset + _this.nameIndex] }))
							.append($('<td>', { text: _this.projectData[offset + _this.deadlineIndex] }))
							.append($('<td>').append($('<img>', { src: './img/icon-arrow.png', 'class': 'arrow-icon' })))
						);

					//completed
					if (_this.projectData[offset + _this.periodIndex] == '1')
						completedTrs.push($('<tr>', { 'data-code': code })
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

					var data = [
						_this.projectData[offset + _this.nameIndex],
						_this.projectData[offset + _this.deadlineIndex],
						_this.projectData[offset + _this.typeIndex] + '. ' + _this.projectData[offset + _this.categoryIndex],
					];

					$('.right-part .general-info tr').each(function (index, item) {

						$($(item).find('td')[1]).text(data[index]);
					});
				}
			};

			reforms.prototype.clearReformData = function () {

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

		return reforms;
	})();

	var r = new reforms();
	r.run();
})();