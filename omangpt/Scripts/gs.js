$(function () {

	var hoverDetails = {
		"doing-bus": "Economies are ranked on their ease of doing business, from 1-189. A high ease of doing business ranking means the regulatory environment is more conducive to the starting and operation of a local firm. The rankings are determined by sorting the aggregate distance to frontier scores on 10 topics, each consisting of several indicators, giving equal weight to each topic.",
		"global-happy": "The World Happiness Report is a landmark survey of the state of global happiness. The first report was published in 2012, the second in 2013, and the third on April 23, 2015. Leading experts across fields - economics, psychology, survey analysis, national statistics, health, public policy and more - describe how measurements of well-being can be used effectively to assess the progress of nations.",
		"human-dev": "HUMAN DEVELOPEMENT INDEX (HDI) - is a composite index which includes health, education, income, livelihood security and other indicators. In other words, HDI is an indicator showig how successfull are achievenemts in three main fields of human development: healthy life, knowledge and decent standard of living.",
		"e-gov": "The EGDI is based on a comprehensive Survey of the online presence of all 193 United Nations Member States, which assesses national websites and how e-government policies and strategies are applied in general and in specific sectors for delivery of essential services. The assessment rates the e-government performance of countries relative to one another as opposed to being an absolute measurement.",
		"empty": "",
		"kno-eco": "The World Bank's Knowledge Assessment Methodology (KAM: www.worldbank.org/kam) is an online interactive tool that produces the Knowledge Economy Index (KEI)-an aggregate index representing a country's or region's overall preparedness to compete in the Knowledge Economy (KE). The KEI is based on a simple average of four subindexes, which represent the four pillars of the knowledge economy."
	};

	var $bubbleContainer = $('<div>', { style: "display:none;", id: "bubble-container" });
	$bubbleContainer.appendTo($('body'));
	$('span.hover-icon').on('mouseover', function (e) {

		var id = $(this).parent().parent().attr("id");
		$bubbleContainer
			.empty()
			.attr('class', '')
			.addClass(id)
			.append(hoverDetails[id])
			.css({ left: e.pageX + 10, top: e.pageY + 10, bottom: 'auto', right: 'auto' })
			.show();
	});

	$('span.hover-icon').on('mouseleave', function () {
		$bubbleContainer.hide();
	});
});