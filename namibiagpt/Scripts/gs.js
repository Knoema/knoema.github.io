$(function () {

	var hoverDetails = {
		"doing-bus": "Economies are ranked on their ease of doing business, from 1-189. A high ease of doing business ranking means the regulatory environment is more conducive to the starting and operation of a local firm. The rankings are determined by sorting the aggregate distance to frontier scores on 10 topics, each consisting of several indicators, giving equal weight to each topic.",
		"global-happy": "The World Happiness Report is a landmark survey of the state of global happiness. The first report was published in 2012, the second in 2013, and the third on April 23, 2015. Leading experts across fields - economics, psychology, survey analysis, national statistics, health, public policy and more - describe how measurements of well-being can be used effectively to assess the progress of nations. The reports review the state of happiness in the world today and show how the new science of happiness explains personal and national variations in happiness. They reflect a new worldwide demand for more attention to happiness as a criteria for government policy. The report is published by the Sustainable Development Solutions Network (SDSN).  It is edited by Professor John F. Helliwell, of the University of British Columbia and the Canadian Institute for Advanced Research; Lord Richard Layard, Director of the Well-Being Programme at LSE's Centre for Economic Performance; and Professor Jeffrey D. Sachs, Director of the Earth Institute at Columbia University, Director of the SDSN, and Special Advisor to UN Secretary General Ban ki-Moon.",
		"human-dev": "HUMAN DEVELOPEMENT INDEX (HDI) - is a composite index which includes health, education, income, livelihood security and other indicators. In other words, HDI is an indicator showig how successfull are achievenemts in three main fields of human development: healthy life, knowledge and decent standard of living. The chief aim of HDI is to provide nations with comprehensive measure of environment they provide for their people in terms of opportunites for personal fulfilment. The higher the HDI the better the conditions the country created for its citizens to live and work. The main idea of Human Development Index is as follows: people are the real value of any nation, and the richeness of human lifes is what every nation's government should worry about.",
		"e-gov": "The EGDI is based on a comprehensive Survey of the online presence of all 193 United Nations Member States, which assesses national websites and how e-government policies and strategies are applied in general and in specific sectors for delivery of essential services. The assessment rates the e-government performance of countries relative to one another as opposed to being an absolute measurement. The results are tabulated and combined with a set of indicators embodying a country's capacity to participate in the information society, without which e-government development efforts are of limited immediate use. Although the basic model has remained consistent, the precise meaning of these values varies from one edition of the Survey to the next as understanding of the potential of e-government changes and the underlying technology evolves. This is an important distinction because it also implies that it is a comparative framework that seeks to encompass various approaches that may evolve over time instead of advocating a linear path with an absolute goal.",
		"log-per": "LPI 2014 ranks 160 countries on six dimensions of trade - including customs performance, infrastructure quality, and timeliness of shipments - that have increasingly been recognized as important to development. The data used in the ranking comes from a survey of logistics professionals who are asked questions about the foreign countries in which they operate.",
		"eco-ind": "The World Happiness Report is a landmark survey of the state of global happiness. The first report was published in 2012, the second in 2013, and the third on April 23, 2015. Leading experts across fields - economics, psychology, survey analysis, national statistics, health, public policy and more - describe how measurements of well-being can be used effectively to assess the progress of nations. The reports review the state of happiness in the world today and show how the new science of happiness explains personal and national variations in happiness. They reflect a new worldwide demand for more attention to happiness as a criteria for government policy.",
		"africa-index": "Ibrahim Index of African Governance (IIAG) - is comprehensive statistical tool assessing African countries' performance in provision of public goods and services. Consisting of 133 variables derived from 32 independent sources IIAG measures governance performance across 4 pillars: Safety and Rule of Law, Participation and Human Rights, Sustainable Economic Opportunity and Human Development. All-embracing nature of the index makes it fairly the best instrument for setting long-term political, social and economical goals concerning the African region"
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