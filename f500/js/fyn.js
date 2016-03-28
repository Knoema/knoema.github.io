'use strict'
Knoema.Helpers.ready(function () {
	var app = new apps.findYourNumber();
});

var apps = apps || {};
apps.findYourNumber = function () {

	Knoema.Helpers.clientId = 'fsSa7bQ=';
	
 	this.start = 2001;
 	this.end = 2013;
 	this.company = null;
 	this.indicator = null;
 	this.frequency = "A";
 	this.time = null;
 	this.unit = null;
 	this.dataset = 'gtquryc';
 	this.dimension = 'indicator'; 	
 	this.meta = null;
	this.indicators = null;
	this.visualization = 'chart';
	this.dataDescriptor = null;
	this.companiesLength = null;
	this.indicatorsLength = null;
	this.load();
 };


apps.findYourNumber.prototype.load = function(){
	
	this.getIndicators();
	this.getCompanies();
	this.bindEvents();
};

apps.findYourNumber.prototype.getCompanies = function () {

	var container = $('div#list-company');	
	var dimFilter = { 'DimensionRequest': [{ 'DimensionId': 'indicator', 'Members': [this.indicator == null ? "1000200" : this.indicator] }] };

	Knoema.Helpers.post('/api/1.0/meta/dataset/gtquryc/dimension/company', dimFilter, $.proxy(function (result) {

		var items = this._setAncestors(result.items);
		var companies = this.filterList(items);
	
		if (companies.length == this.companiesLength)
			return;

		if (companies.length > 0) {
			$('div#list-company').empty();
			this.companiesLength = companies.length;

			var ul = $(Knoema.Helpers.buildHTML('ul', { 'id': 'companies' })).appendTo(container);

			$.each(companies, $.proxy(function (index, item) {
				
				if (item.name == 'DaVita') { }

				else if (item.level == 0)
				{
					$(Knoema.Helpers.buildHTML('li', { 'class': 'capital' }))
						.appendTo(ul)
							.append(item.name);
				}
				else
				{
					$(Knoema.Helpers.buildHTML('li', { 'id': item.key }))
						.appendTo(ul)
							.append(item.name).click($.proxy(function (item) {
								this.selectionChanged(item.target);
								this.visualize(this.visualization);
							}, this));
						
				}
			}, this));
		};

		$('div#list-company [id=' + this.company + ']').addClass('selected');
	}, this));
};

apps.findYourNumber.prototype.getIndicators = function () {

	var container = $('div#list-indicator');
	var dimFilter = { 'DimensionRequest': [{ 'DimensionId': 'company', 'Members': [this.company == null ? 1000010 : this.company] }] };

	Knoema.Helpers.post('/api/1.0/meta/dataset/gtquryc/dimension/indicator', dimFilter, $.proxy(function (result) {

		var items = this._setAncestors(result.items);
		this.indicators = this.filterList(items);
		
		if (this.indicators.length == this.indicatorsLength)
			return;

		$('div#list-indicator').empty();
		var ul = $(Knoema.Helpers.buildHTML('ul', { 'id': 'indicators' })).appendTo(container);

		for (var i = 1; i < this.indicators.length; i++)
		{
			this.indicatorsLength = this.indicators.length;

			if(this.indicators[i].hasData == false)
				$(Knoema.Helpers.buildHTML('li', { 'class': this.indicators[i].level == 0 ? 'capital' : 'capital1' }))
						.appendTo(ul)
							.append(this.indicators[i].name);
			else 
				$(Knoema.Helpers.buildHTML('li',
						   {
						   	'id': this.indicators[i].key,
						   	'unit': this.indicators[i].fields.unit,
						   	'class': this.indicators[i].level == 1 ? 'field1' : 'field2'
						   })).appendTo(ul)
								   .append(this.indicators[i].name).click($.proxy(function (item) {
								   	this.selectionChanged(item.target);
								   	this.visualize(this.visualization);
								   }, this));
		}

		$('div#list-indicator [id=' + this.indicator + ']').addClass('selected');
	}, this));
};


apps.findYourNumber.prototype.filterList = function(items)
{
	var filteredList = items;
	
	filteredList = [];
	var selection = [];
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var isSelected = $.inArray(item.key + '', selection) > -1;
		if (isSelected) 
			item.hasData = true; //so it can deselected

		if (item.hasData || item.hasChildrenWithData) 
			filteredList.push(item);
	}
	
	return filteredList;
}

apps.findYourNumber.prototype._setAncestors = function (items) {

	$.each(items, function () {
		delete this.hasChildrenWithData;
	});

	var ancestorsWithData = [];
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if (item.hasData) {
			for (var j = 0; j < ancestorsWithData.length; j++) {
				var ancestor = ancestorsWithData[j];
				ancestor.hasChildrenWithData = true;
			}
		}
		if (i < items.length - 1) {
			var nextItem = items[i + 1];
			if (nextItem.level > item.level)
				ancestorsWithData.push(item);
			else if (nextItem.level < item.level) {
				do {
					var ancestor = ancestorsWithData.pop();
				} while (ancestor && ancestor.level >= nextItem.level);
				if (ancestor)
					ancestorsWithData.push(ancestor);
			}
			else if (nextItem.name == "Income Statement" || nextItem.name == "Energy")
				ancestorsWithData.push(item);
		}
	}
	return items;
};

apps.findYourNumber.prototype.visualize = function (type) {
	
	if(this.isValidParameters())
	{
		var container = $('div#visualization');	
		$(container).html('');
		this.chart(container);
		$('.explore-button').addClass('inline');
	}
};

apps.findYourNumber.prototype.chart = function (container) {
	
	this.getDataDescriptor([this.company], [this.indicator], [this.frequency]);

	var data =
	{
		gadget: {
			dataDescriptor: this.dataDescriptor,
			gadgetClass: "Knoema.Chart",
			viewState: { theme: 'juicy', horizontalGridLines: true, seriesLevelOptions: [{ seriesOptions: { marker: 'circle' } }] },
			naked: true
		},
		size: {
			width: 466,
			height: 300
		}
	};
	$(container).gadget(data);
};

apps.findYourNumber.prototype.getDataDescriptor = function (companies, indicators, frequency) {
	
	var time = [];
	if (frequency == "A")
		for (var i = this.start; i < this.end; i++)
			time.push(i.toString());
	else
		for (var i = this.start; i < this.end; i++)
			for (var j = 1; j < 4; j++)
				time.push((i + " Q" + j).toString());

	this.dataDescriptor =
	{
		"Header": [
			{
				"DimensionId": "Time",
				"Members": time,
				"UiMode": "range"
			}],
		"Stub": [
			{
				"DimensionId": "Company",
				"Members": companies
			},
			{
				"DimensionId": this.dimension,
				"Members": indicators
			}],
		"Filter": [],
		"Frequencies": frequency,
		"Dataset": this.dataset
	};

	$("input#pivot-descriptor").val(JSON.stringify(this.dataDescriptor));
};

apps.findYourNumber.prototype.selectionChanged = function (item) {
	
	$(item).parent().find('li').each(function (index, item) {
		$(item).removeClass('selected');
	});
	$(item).addClass('selected');

	var id = $(item).parent().attr('id')
	var value = $(item).attr('id');
	
	switch (id) {
		case 'companies':
			this.company = value;
			this.getIndicators();

			this.company = value;
			break;

		case 'indicators':
			this.indicator = value;
			this.getCompanies();

			this.indicator = value;
			this.unit = $(item).attr('unit');	
			break;
		default:
			break;
	};
};

apps.findYourNumber.prototype.frequencySelectionChanged = function(item){

	if ($(item).attr('class') == 'active')
		return;
	$('div#options span').removeClass();

	$(item).addClass('active');
		
	this.frequency = $(item).attr('id');
	this.visualize(this.visualization);
}

var filter = '';	
apps.findYourNumber.prototype.isValidParameters = function () {

	if (this.company != null && this.indicator != null)
		return true;
	else return false;
};

apps.findYourNumber.prototype.bindEvents = function(){

	$('#explore-button').click($.proxy(function () {
		document.forms["explore-data"].submit();
	}));

	$('div.step-container ul li').click($.proxy(function (item) {
		this.selectionChanged(item.target);
	}, this));

	$('div#options span').click($.proxy(function (item) {
		this.frequencySelectionChanged(item.target);
	}, this));

	$('input#filter-company, input#filter-indicator, input#filter-time').mousedown(function () {
		$(this).css('color', '#222');
		if ($(this).val() == 'Just type...')
			$(this).val('');
	});

	$('input#filter-company, input#filter-indicator, input#filter-time').on('keyup', function () {
		var val = $(this).val().toLowerCase();
		if (filter != val) {
			filter = val;
			$(this).parent().find('ul li').each(function () {
				if ((filter == '') || $(this).text().toLowerCase().indexOf(filter) != -1)
					$(this).show();
				else
					$(this).hide();
			});
		};
	});
};