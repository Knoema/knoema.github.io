/// <reference path="typings/jquery.d.ts"/>

(function () {
	var host = 'http://pspp.knoema.com';
	//var host = 'https://beta.knoema.org';

	var projectsDataset = 'sardyld';

	var projectData = [];
	var projectColumns = [];

	var codeIndex = -1;
	var objectTypeIndex = -1;
	var nameIndex = -1;
	var deadlineIndex = -1;
	var categoryIndex = -1;
	var typeIndex = -1;

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
					if (name == 'Deadline') _this.deadlineIndex = i;
					if (name == 'Database Code') _this.codeIndex = i;
					if (name == 'Catégorie des réformes') _this.categoryIndex = i;
					if (name == 'Type') _this.typeIndex = i;
				}

				_this.fillTable('total');
			});

			$('.reforms-container ul li').on('click', function () {
				$('.reforms-container ul li').removeClass('active');
				$(this).addClass('active');

				_this.fillTable($(this).data('tab-name'));
			});

			reforms.prototype.fillTable = function (status) {
				
				var $trs = [];

				for (var i = 0; i < _this.projectData.length / _this.projectColumns.length; i++) {

					var offset = i * _this.projectColumns.length;

					//only for reforms
					if (_this.projectData[offset + _this.objectTypeIndex] != 'R')
						continue;

					if (status != 'total')
						continue;

					var code = _this.projectData[offset + _this.codeIndex];

					$trs.push($('<tr>', { 'data-code': code })
						.append($('<td>', { text: _this.projectData[offset + _this.nameIndex] }))
						.append($('<td>', { text: _this.projectData[offset + _this.deadlineIndex] }))
						.append($('<td>').append($('<img>', { src: './img/icon-arrow.png', 'class': 'arrow-icon' })))
						);
				}

				if (status == 'total')
					$('#count-total').text($trs.length);

				_this.clearReformData();

				$('.left-part').find('table tbody').empty().append($trs);

				$('.reforms-table .left-part table tbody tr').off('click');
				$('.reforms-table .left-part table tbody tr').on('click', function () {
					$('.reforms-table .left-part table tbody tr').removeClass('active');
					$('.reforms-table .left-part table tbody tr img.arrow-icon').hide();
					$(this).addClass('active');
					$(this).find('img.arrow-icon').show();

					_this.displayReformData($(this).data('code'));
				});
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
						_this.projectData[offset + _this.categoryIndex],
						_this.projectData[offset + _this.typeIndex],
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