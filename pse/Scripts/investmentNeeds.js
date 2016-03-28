(function() {
	InvestmentNeedsPage = function() {
		this.currentYear = $('#main-timeline .item.active').html() * 1;
		this.flagshipProjectsData;
		this.planData;
	};
	
	InvestmentNeedsPage.prototype.init = function() {
		var self = this;
		this.getFlagshipProjects().done(function(data) {
			self.flagshipProjectsData = data;
			self.renderFlagshipProjects();
			console.log(data);
		});

		this.getPlanData().done(function(planData) {
			self.planData = planData;
			self.renderPlanTable();
			console.log(planData);
		});

		this.bindEvents();
	};

	InvestmentNeedsPage.prototype.bindEvents = function() {
		var self = this;

		$(document.body).on('click', '.passport__close', function(event) {
			$(event.target).closest('.passport-popup').hide();
		});

		$('#main-timeline').on('click', '.item', function(event) {
			self.currentYear = $(event.target).html() * 1;
			self.renderFlagshipProjects();
			self.renderPlanTable();
		});

		$('.timeline').on('click', '.item', function(event) {
			$(event.delegateTarget).find('.item.active').removeClass('active');
			$(event.target).toggleClass('active', true);
		});

		$('#pdf-frame-popup').on('shown.bs.tab', 'a[data-toggle="tab"]', function(event) {
			var $tab = $(event.target);
			var $iframe = $($tab.attr('href')).find('iframe');
			if ($iframe.attr('src') == null || $iframe.attr('src') == '') {
				var url = './pdf/' + $tab.data('page') + '.pdf';
				$iframe.attr('src', url);
			}
		});

		$('#flagship-projects').on('click', function(event) {
			var projectName = $(event.target).closest('.project-item').data('name');
			var pageNumbers = flagshipProjectsPages[projectName];

			if (pageNumbers == null || pageNumbers.length <= 0) return;

			var $popup = $('#pdf-frame-popup');

			if (pageNumbers.length > 1)
			{
				var tabs = pageNumbers.map(function(page, index) {
					return '<li' + (index == 0 ? ' class="active"' : '') + 
					'><a href="#projectPage' + index + '" role="tab" data-toggle="tab" data-page="' + page + 
					'">Page ' + (index + 1) + '</a></li>';
				});

				var tabsPanels = pageNumbers.map(function(pageNumber, index) {
					return '<div role="tabpanel" class="tab-pane' + (index == 0 ? ' active' : '') + '" id="projectPage' + index + '">' + 
					'<iframe src="" width="100%" height="100%"></iframe></div>';
				});

				$popup.find('.passport__content').html(
					'<ul class="nav nav-tabs" role="tablist">' + tabs.join('') + '</ul>' + 
					'<div class="tab-content" style="top:62px;bottom:20px;left:20px;right:20px;">' + tabsPanels.join('') + '</div>'
				);
			} else {
				$popup.find('.passport__content')
					.html('<iframe src="./pdf/' + pageNumbers[0] + '.pdf" width="100%" height="100%"></iframe>');
			}

			$popup.show();

			// invalidate active tab
			$('#pdf-frame-popup li.active > a[data-toggle="tab"]').trigger('shown.bs.tab');
		});
	};

	InvestmentNeedsPage.prototype.renderFlagshipProjects = function() {
		var self = this;
		var $container = $('#flagship-projects').html('');

		this.flagshipProjectsData.data.forEach(function(item) {
			if (item.Time.substr(0, 4) == self.currentYear) {
				$container.append('<div class="project-item" data-name="' + item.project + '">'
					+ '<span class="name">' + item.project + '</span>'
					+ '<span class="value">' + (item.Value != null ? item.Value : 0) + '</span><span class="unit">million CFA francs</span></div>');
			}
		});
	};

	InvestmentNeedsPage.prototype.renderPlanTable = function() {
		var self = this;
		var $container = $('#plan-table');
		var currentYearValues = {};

		this.planData.data.forEach(function(item) {
			if (item.Time.substr(0, 4) == self.currentYear) {
				var financement = item['mode-de-financement'];
				var domaine = item['sous-secteur-domaine'];

				currentYearValues[domaine + '|' + financement] = item.Value;

				$container
					.find('tr[data-domaine="' + domaine + '"] > td[data-financement="' + financement + '"]')
					.html('<div class="plan-item">'
						+ '<span class="value">' + numeral(item.Value).format('0,0') + '</span>'
						+ '<span class="unit">million CFA francs</span><span class="percent">0%</span></div>');
			}
		});

		if (self.currentYear > 2014) {
			this.planData.data.forEach(function(item) {
				if (item.Time.substr(0, 4) == self.currentYear - 1) {
					var financement = item['mode-de-financement'];
					var domaine = item['sous-secteur-domaine'];
					var percent = Math.round(currentYearValues[domaine + '|' + financement] / item.Value * 10) / 10;
					$container
						.find('tr[data-domaine="' + domaine + '"] > td[data-financement="' + financement + '"] > .plan-item > .percent')
						.html(percent + '%');
				}
			});
		}
	};

	InvestmentNeedsPage.prototype.getPlanData = function() {
		return $.post('http://knoema.com/api/1.0/data/pivot?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=btlqkub', {
			"Header":[{"DimensionId":"Time","Members":["2014-2018"],"DimensionName":"Time","DatasetId":"ebgyazf","Order":"0","UiMode":"range"}],"Stub":[{"DimensionId":"sous-secteur-domaine","Members":["1000340","1000300","1000260","1000240"],"DimensionName":"Sous-secteur/Domaine","DatasetId":"ebgyazf","Order":"0"},{"DimensionId":"mode-de-financement","Members":["1000000","1000010"],"DimensionName":"Mode de financement","DatasetId":"ebgyazf","Order":"1"}],"Filter":[{"DimensionId":"titre-du-projet-programme","Members":["1001630"],"DimensionName":"Titre du Projet / programme","DatasetId":"ebgyazf","Order":"0"}],"Frequencies":["A"],"Dataset":"ebgyazf","Segments":null,"MeasureAggregations":null
		});
	};

	InvestmentNeedsPage.prototype.getFlagshipProjects = function() {
		return $.post('http://knoema.com/api/1.0/data/pivot?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=SNEIOFP2016', {
			"Header":[{"DimensionId":"Time","Members":["2014-2016"],"DimensionName":"Time","DatasetId":"SNEIOFP2016","Order":"0","UiMode":"range"}],"Stub":[{"DimensionId":"project","Members":["1000000","1000010","1000020","1000030","1000040","1000050","1000060","1000070","1000080","1000090","1000100","1000110","1000120","1000130","1000140","1000150","1000160","1000170","1000180","1000190","1000200","1000210","1000220","1000230","1000240","1000250","1000260","1000270","1000280"],"DimensionName":"Project","DatasetId":"SNEIOFP2016","Order":"0"}],"Filter":[{"DimensionId":"indicator","Members":["1000050"],"DimensionName":"Indicator","DatasetId":"SNEIOFP2016","Order":"0"}],"Frequencies":["A"],"Dataset":"SNEIOFP2016","Segments":null,"MeasureAggregations":null
		});
		/*return $.post('http://knoema.com/api/1.0/data/pivot?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=snnmub', {
			"Header":[{
				"DimensionId":"Time",
				"Members":[{"Key":-4791,"Name":"2014-2023","Formula":["2014","2023","sum"]}],
				"DimensionName":"Time",
				"UiMode":"individualMembers"
			}],
			"Stub":[{
				"DimensionId":"project",
				"Members":["1000000","1000010","1000020","1000030","1000040","1000050","1000060","1000070","1000080","1000090","1000100","1000110","1000120","1000130","1000140","1000150","1000160","1000170","1000180","1000190","1000200","1000210","1000220","1000230","1000240","1000250","1000260","1000270"],
				"DimensionName":"Project"
			}],
			"Filter":[{
				"DimensionId":"indicator",
				"Members":[{
					"Key":-4316,
					"Name":"Total",
					"Formula":["1000060","0.00","ifNull","1000080","0.00","ifNull","+"]
				}],
				"DimensionName":"Indicator"
			}],
			"Frequencies":["A"],
			"FoldDimension":null,
			"Dataset":"SNEIOFP2016"
		});*/
	};

	var flagshipProjectsPages = {
		'HVA Aggregation & Breeding': [10],
		'Family Farming': [],
		'Fish Farming': [12],
		'Business Park': [17],
		'Grain Corridors': [11],
		'Phosphate Industry Development': [],
		'Gold Mining': [],
		'Zircon Operations': [],
		'Social Housing': [18],
		'Air Hub': [],
		'Integrated Logistics Hub': [1, 2],
		'Regional Mining Hub': [],
		'Regional Education Hub': [4, 5, 6, 7],
		'Regional Health Hub': [8, 9],
		'Hydrocarbons': [],
		'Commercial Infras': [],
		'Micro-Tourism': [],
		'Industrial Challenge': [],
		'Arts And Crafts Map': [],
		'Integrated Industrial Hubs': [16],
		'Revival Of The Groundnut Sector': [],
		'Iron Stimulus Falémé': [3],
		'Universal Energy Service': [],
		'Turnaround Electricity': [],
		'Zone "Offshoring"': [],
		'Craft Areas': [],
		'Tourist Areas': [13, 14, 15],
	};

	window.InvestmentNeedsPage = InvestmentNeedsPage;
})();