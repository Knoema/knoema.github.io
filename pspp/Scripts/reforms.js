/// <reference path="typings/jquery.d.ts"/>

(function () {
	//var host = 'http://pspp.knoema.com';
	var host = 'https://beta.knoema.org';

	var projectsDataset = 'hoxuwvc';

	var projectData = [];
	var projectColumns = [];

	var objectTypeIndex = -1;
	var nameIndex = -1;
	var deadlineIndex = -1;

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
				}

				_this.fillTable('full');
			});

			$('.reforms-container ul li').on('click', function () {
				$('.reforms-container ul li').removeClass('active');
				$(this).addClass('active');
			});

			reforms.prototype.fillTable = function (status) {
				
				var $trs = [];

				for (var i = 0; i < _this.projectData.length / _this.projectColumns.length; i++) {

					var offset = i * _this.projectColumns.length;

					//only for projects
					if (_this.projectData[offset + _this.objectTypeIndex] != 'R')
						continue;

					$trs.push($('<tr>')
						.append($('<td>', { text: _this.projectData[offset + _this.nameIndex] }))
						.append($('<td>', { text: _this.projectData[offset + _this.deadlineIndex] }))
						);
				}

				$('.left-part').find('table tbody').append($trs);
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