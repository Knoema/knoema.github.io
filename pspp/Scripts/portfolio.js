/// <reference path="typings/jquery.d.ts"/>

(function () {
	var host = 'http://pspp.knoema.com';

	var projectsDataset = 'hmunucb';
	var dashboardUrl = 'http://pspp.knoema.com/resource/embed/cwxobyf?projects=';

	var projectData = [];
	var projectColumns = [];

	var objectTypeIndex = -1;
	var nameIndex = -1;
	var ppIndex = -1;
	var codeIndex = -1;

	var portfolio = (function () {
		function portfolio() {
		};

		portfolio.prototype.run = function () {

			var _this = this;

			this.getProjects().done(function (projectData) {

				_this.projectData = projectData.data;
				_this.projectColumns = projectData.columns;

				for (var i = 0; i < _this.projectColumns.length; i++) {

					var name = _this.projectColumns[i].name;

					if (name == 'Projet/Reforme') _this.objectTypeIndex = i;
					if (name == 'Nom Projet') _this.nameIndex = i;
					if (name == 'Numéro du projet phare / numéro de la réforme phare. (PP# / RP#)') _this.ppIndex = i;
					if (name == 'Database Code') _this.codeIndex = i;
				}

				_this.hideNonPresentedProjectsButtons(_this.projectData);

				$($('.icon-item').get(0)).trigger('click');
			});

			$('.icon-item').on('click', function () {

				if ($(this).find('.cap').length > 0)
					return false;

				$('.icon-item').removeClass('active');
				$(this).addClass('active');
				var name = $(this).data('p-name');
				$('.p-name').text(name);

				var project = _this.getProgectsByPP($(this).data('p'));

				var $ils = [];
				for (var i = 0; i < project.length; i++) {
					$ils.push($('<li>', {
						text: project[i].name,
						'data-code': project[i].code
					}).prepend($('<a>', { href: 'overview.html?code=' + project[i].code, target: '_blank' }).append($('<img>', { 'class': 'map', src: './img/ico-map.png' }))));
				}

				$('.left-part ul').empty().append($ils);
				$('.left-part ul li').on('click', function () {

					_this.loadDashboard($(this).text());

					$('.left-part ul li').removeClass('active');
					$('.left-part ul li').find('img.map').attr('src', './img/ico-map.png');
					$(this).addClass('active');
					$(this).find('img.map').attr('src', './img/ico-map-white.png');
				});
				$($('.left-part ul li').get(0)).trigger('click');
			})
		};

		portfolio.prototype.hideNonPresentedProjectsButtons = function () {

			var presented = [];
			for (var i = 0; i < this.projectData.length / this.projectColumns.length; i++) {

				var offset = i * this.projectColumns.length;

				var pp = this.projectData[offset + this.ppIndex];

				if ($.inArray(pp, presented) == -1)
					presented.push(pp);
			}

			$('.icon-contianer .icon-item').each(function (index, item) {
				var pp = $(this).data('p');

				if ($.inArray(pp, presented) == -1)
					$(this).prepend($('<div>', { 'class': 'cap' }));
			});
		};

		portfolio.prototype.loadDashboard = function (projectName) {

			$('.right-part iframe').attr('src', dashboardUrl + projectName);
		};

		portfolio.prototype.getProgectsByPP = function (pp) {

			var res = [];

			for (var i = 0; i < this.projectData.length / this.projectColumns.length; i++) {

				var offset = i * this.projectColumns.length;

				//only for reforms
				if (this.projectData[offset + this.objectTypeIndex] != 'P')
					continue;

				if (this.projectData[offset + this.ppIndex] != pp)
					continue;

				res.push({
					code: this.projectData[offset + this.codeIndex],
					name: this.projectData[offset + this.nameIndex]
				});
			}

			return res;
		};

		portfolio.prototype.getProjects = function () {

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

		return portfolio;
	})();

	var r = new portfolio();
	r.run();
})();