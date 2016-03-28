/// <reference path="../App.js" />
/// <reference path="jquery.dyve.autocomplete.js" />
/*global app*/

var Knoema = Knoema || {};

(function () {
	'use strict';

	// The initialize function must be run each time a new page is loaded
	Office.initialize = function (reason) {
		$(document).ready(function () {
			app.initialize();
			var _clientId = "client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif";
			
			$('#search-button').click(search);
			$('#wrapper').on('click', '.search-result', addSearchResults);
			$("body").bind("ResultHeaderAdded", addDataToSheet);
			$('#search-box').on('keydown', searchKeyDown);
			$('#wrapper').on('mouseenter', '.search-result.timeseries', searchResultMouseEnter);
			$('#wrapper').on('mouseleave', '.search-result.timeseries', searchResultMouseLeave);
			$('#wrapper').on('change', '#search-filter select.source-filter', sourceFilterChange);
			$('body').on('start-search', startSearch);
			//autocomplete setup
			
			$('#search-box').dyveautocomplete({
				url: _baseUrl + "/api/1.0/search/autocomplete?" + _clientId,
				crossDomain: true,
				queryParamName: "query",
				limitParamName: "limit",
				remoteDataType: "json",
				minChars: 1,
				maxItemsToShow: 5,
				useCache: false,
				preventDefaultTab: true,
				autoFillOnFocusing: true,
				filterResults: false,
				sortResults: false,
				deactivateOnEnter: true,
				resultsClass: "search-autocomplete-results",
				selectClass: "search-autocomplete-select",
				beforeUseConverter: function (query) {
					if (query)
						return query.replace(/[<>]/g, "");

					return query;
				},
				onItemSelect: function (s) {
					$("#search-box").val(s.value).trigger('start-search');
				}
			})

		});
	}

	var BaseDomain = "https://prm.knoema.org";
	var _baseUrl = "https://prm.knoema.org";
	var SearchResultCount = 100; //max limit is 300
	var ClientId = "client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif";
	var NumberFormat = "#,##0.00";
	var DateFormatMap = {
		"A": "yyyy",
		"M": "yyyy MMM",
		"D": "yyyy MMM d",
		"Q": "yyyy MMM",
		"H": "yyyy MMM"
	};
	var SearchScope = "atlas,timeseries";

	var _searchResults = [];
	var _sources = [];
	var _loadedCounter = 0;
	var _resultsToLoad = 20; //at one time

	function search() {
		$(this).trigger('start-search');
	}
	

	function startSearch(e) {
		var searchText = $('#search-box').val().trim();

		if (!searchText)
			return false;

		runSearch(searchText);

		return false;
	}

	function searchKeyDown(e) {
		if (e.which == 13) {

			var searchText = $(this).val().trim();

			if (!searchText)
				return false;

			runSearch(searchText);

			return false;
		}
	}

	function searchResultMouseEnter(e) {
		$(this).prev().find('.divider').css('visibility', 'hidden');
		$(this).find('.divider').css('visibility', 'hidden');
		return false;
	}

	function searchResultMouseLeave(e) {
		$(this).prev().find('.divider').css('visibility', 'visible');
		$(this).find('.divider').css('visibility', 'visible');
		return false;
	}

	function sourceFilterChange(e) {
		var id = $(this).val();

		var fitems = getfilteredSearchResults(id);

		$('div#search-results').empty();
		populateResults(fitems);
		return false;
	}  

	function addSearchResults() {
		var $result = $(this);
		var result = {};
		result.title = $result.find('.title').text();
		result.source = $result.find('.source a').text();
		result.sourceLink = $result.find('.source a').attr("href");

		//pass request object to server method which will get pivot data and populate sheet
		var dataRequest = $result.find('.request-obj').val();

		result.request = JSON.parse(dataRequest);
		hideError();
		showLoading();
		addResultToSheet(result);

		return false;
	}


	function runSearch(searchText) {

		if (!searchText) return;

		clearSearchResults();
		showLoading();
		getSearchResults(searchText, $.proxy(function (results) {
			loadSearchResults(results);
		}, this));
	}

	function showLoading() {
		$('#loading').show();
	}

	function showErrorMessage() {
		$('#error').show();
	}

	function clearSearchResults() {
		$('div#search-results').empty();
		$('#search-filter').hide();
		$('#message').hide();
		hideError();
	}


	/*
	atlas result html
	*/
	function atlasResultHtml(result) {
		if (!result || !isAtlasResult(result))
			return "";

		var atlasDetail = result.topResultDetails;
		var descObj = transformRequest(atlasDetail.descriptor);
		var resultTitle = result.title;
		var sourceLink = _baseUrl + "/" + descObj.Dataset;
		var sourceTitle = atlasDetail.datasetName;


		var request = JSON.stringify(descObj);
		var value = atlasDetail.value;
		var unit = atlasDetail.unit;
		var year = atlasDetail.year;

		//atlas result formatting
		var $ele = $('<div class="search-result atlas">'

						+ '<div class="atlas result-title">'
						  + '<div class="title">'
						   + resultTitle
						  + '</div>'
						  + '<div class="value">'
						   + value
						  + '</div>'
						  + '<div class="unit-year">'
						   + '(' + unit + ')'
						  + '<br>'
						   + 'in ' + year
						  + '</div>'
						  + '<div class="source small-text">'
							+ '<label>Source: </label>'
							+ '<a href="' + sourceLink + '" target="_blank">' + sourceTitle + '</a>'
						  + '</div>'
						  + '<input type="hidden" class="request-obj"></input>'
   //                       + '<span class="divider"></span>'
						+ '</div>'

					+ '</div>');

		$ele.find('.request-obj').val(request);
		return $ele;
	}

	/*
	timeseries content html
	*/
	function timeseriesResultHtml(result) {
		if (!result || isAtlasResult(result))
			return "";

		var resultTitle = result.title;
		var sourceLink = result.dataset.resourceUrl;
		var sourceTitle = result.dataset.title;

		var descObj = transformRequest(result.dataDescriptor);
		var request = JSON.stringify(descObj);



		var timeRange = getTimeRange(descObj);
		var frequency = getFrequencyText(descObj);
		var nTimeSeries = getNumberOfTimeSeries(descObj);
		var memDetails = getMembersPerDimDetails(descObj);


		var $ele = $('<div class="search-result timeseries">'               
                     
                     + '<div class="result-title">'
                       + '<span class="title">' 
                        + resultTitle 
                        + (memDetails ? '<span class="small-text"> (' + memDetails + ')</span>' : '')
                       + '</span>'
                       
                       + '<div class="source small-text">' 
                       + '<label>Source: </label>'
                       + '<a href="' + sourceLink + '" target="_blank">' + sourceTitle + '</a>'
                       + '</div>'
                       
                       + '<div class="time small-text">' 
                       + '<label>Time: </label>'
                       + '<span>' + timeRange + ' (' + frequency +')</span>'
                       + '</div>'
                       
                       + '<input type="hidden" class="request-obj"></input>'
                       
                     + '</div>'
                     
                     + '<span class="divider"></span>'
                     
                 + '</div>');


		$ele.find('.request-obj').val(request);
		return $ele;

	}


	/*
  return html markup corresponding to every timeseries result
  */
	function searchResultHtml(result) {
		if (isAtlasResult(result))
			return atlasResultHtml(result);
		else
			return timeseriesResultHtml(result);

	}

	function apiGet(action, callback) {
		var url = BaseDomain + action + '&' + ClientId;
		$.ajax({
			url: url,
			type: "GET",
			crossDomain: true,
			success: $.proxy(function (response) {

				if (callback) callback(response);
			}, this),
			error: function (jqXHR, textStatus, errorThrown) {

			},
			complete: $.proxy(function () {

			}, this)
		});
	}

	function getSearchResults(searchText, callback) {
		var url = '/api/1.0/search?scope=' + SearchScope + '&count=' + SearchResultCount + '&query=' + searchText;
		apiGet(url, callback);
	}


	function loadSearchResults(results) {

		if (!results) {
			hideLoading();
			return;
		}

		resetLoadedCounter();
		_searchResults = results;

		removeIncompatibleResults();

		var items = _searchResults ? _searchResults.items : null;
		if (items && items.length > 0 && isAtlasResult(items[0])) {
			loadAtlasResultDetails(items[0], function () {
				populateSources();
				populateResults();
			});
		} else {
			populateSources();
			populateResults();
		}
	}

	function loadAtlasResultDetails(atlasResult, callback) {
		var url = atlasResult.embedUrl;

		if (url.indexOf('http://') === 0)
			url = url.replace('http://', 'https://');


		$.getJSON(url, function (detail) {
			atlasResult.topResultDetails = detail;

			if ($.isFunction(callback))
				callback();

		});
	}

	function removeIncompatibleResults() {

		if (!_searchResults || !_searchResults.items || _searchResults.items.length === 0)
			return;

		var topAtlasResultFound = false;
		var items = _searchResults.items;
		var newItems = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];

			if (isAtlasResult(item)) {
				if (!item.indicator)  //country page
					continue;

				if (!item.region)   //ranking page
					continue;

				if (topAtlasResultFound)
					continue;

				topAtlasResultFound = true;
			}
			else if (item.dataset && item.dataset.datasetType.toLowerCase() === "flat") //flat dataset
				continue;

			newItems.push(item);
		}

		_searchResults.items = newItems;
	}

	function isAtlasResult(item) {
		return item && item.type && item.type.toLowerCase() === "atlas";
	}


	function hideLoading() {
		$('#loading').hide();
	}

	function hideError() {
		$('#error').hide();
	}

	/*
  reset load counter to 0
  */
	function resetLoadedCounter() {
		_loadedCounter = 0;
	}

	/*
  function to remove results from flat datasets
  */
	function removeFlatDatasetResults() {

		if (!_searchResults || !_searchResults.items || _searchResults.items.length == 0) return;

		var items = _searchResults.items;
		var newItems = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item.dataset.datasetType.toLowerCase() === "flat") continue;

			newItems.push(item);
		}

		_searchResults.items = newItems;
	}

	/*
  function to populate all sources for filter by source
  */
	function populateSources() {

		$('#search-filter').hide();

		if (!_searchResults || !_searchResults.items || _searchResults.items.length == 0)
			return;

		var items = _searchResults.items;
		var sources = [];
		var sourceIds = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];

			if (isAtlasResult(item))
				continue;

			var sourceId = item.dataset.sourceId;
			var source = item.dataset.source;
			if (sourceId && $.inArray(sourceId, sourceIds) === -1) {
				sourceIds.push(sourceId);
				sources.push({ id: sourceId, name: sourceId == source ? source : sourceId + " - " + source });
			}
		}

		sources.sort(
		  function (a, b) {
		  	return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
		  }
		);

		_sources = sources;

		/*var markup = '<li class="source-item" data-value="">All sources</li>';
		for (var j = 0; j < sources.length; j++) {
			var s = sources[j];
			markup += '<li class="source-item" data-value="' + s.id + '">' + s.name + '</li>';
		}

		$('#all-sources ul').html(markup);
		setSource("", "All sources");
		$('#search-filter').show();*/
		
	  var markup = '<option value="">All sources</option>';
     for(var j=0; j<sources.length; j++) {
       var s = sources[j];
       markup += '<option value="' + s.id + '">' + s.name + '</option>';
     }
     
     $('#search-filter').show().find('select.source-filter').html(markup);

	}

	function setSource(sid, sname) {
		if (!sname)
			return;

		$('#active-source').data('value', sid).text(sname);
	}

	/*
  function to show 10 results at a time with More button at the end
  */
	function populateResults(filteredItems) {
		var items = filteredItems || (_searchResults ? _searchResults.items : null);
		if (!items || items.length == 0) {
			hideLoading();
			return;
		}

		showLoading();

		var $resultContainer = $('div#search-results').show();
		for (var i = 0; i < items.length; i++) {
			var result = items[i];
			$resultContainer.append(searchResultHtml(result));
		}

		hideLoading();
	}

	/*
  return filtered search results by source
  */
	function getfilteredSearchResults(source) {
		var oldItems = _searchResults.items;
		var newItems = [];

		var filterSource = source;

		if (!filterSource)
			return oldItems;

		for (var i = 0; i < oldItems.length; i++) {
			var oldItem = oldItems[i];

			if (!isAtlasResult(oldItem)
				&& filterSource != oldItem.dataset.sourceId)
				continue;

			newItems.push(oldItem);
		}

		return newItems;
	}

	/*
  returns only 1 frequency in descriptor to avoid multi-frequency scenario
  prefer annual if its present
  */
	function toSingleFrequency(frequencies) {
		//empty frequency array when 'All Time' selected
		return frequencies && frequencies.length ? [frequencies[0]] : [];
	}

	/*
  get frequency used for result in english
  */
	function getFrequencyText(request) {
		if (isAllTime(request)) return "NA";

		var freq = toSingleFrequency(request.Frequencies)[0];
		var map = {
			'A': 'Annual',
			'S': 'Semiannual',
			'Q': 'Quarterly',
			'M': 'Monthly',
			'W': 'Weekly',
			'D': 'Daily'
		};
		return map[freq] || "";
	}

	/*
  returns number of timeseries in request
  */
	function getNumberOfTimeSeries(desc) {
		if (!desc || $.isEmptyObject(desc)) return 0;

		var nTimeSeries = 1;
		for (var i = 0; i < desc.Stub.length; i++) {
			var dim = desc.Stub[i];
			nTimeSeries = nTimeSeries * dim.Members.length;
		}

		return nTimeSeries;

	}

	/*
  returns number of timeseries in request
  */
	function getMembersPerDimDetails(desc) {
		if (!desc || $.isEmptyObject(desc)) return "";

		var detail = "";
		for (var i = 0; i < desc.Stub.length; i++) {
			var dim = desc.Stub[i];

			//don't show dimensions with one member
			if (dim.Members.length == 1) continue;

			if (detail != "") {
				if (i == desc.Stub.length - 1) detail += " and ";
				else detail += ", ";
			}


			detail += dim.Members.length + " " + pluralize(dim.DimensionId); // + "(s)"; //option 6
			//option 8
			//       detail += dim.DimensionId + " - " + dim.Members.length;
		}

		return detail;

	}

	/*
  get time range to show in search preview
  */
	function getTimeRange(desc) {
		if (!desc || $.isEmptyObject(desc)) return "";

		if (isAllTime(desc)) return "All Time";

		var range = desc.Header[0].Members[0];
		if (!range) return "";

		//detect same date at start & end
		var temp = range.split('-');
		temp = toUIFormatDate_(temp);
		if (temp[0] == temp[1]) range = temp[0];

		range = temp.join('-');

		return range;
	}

	/*
  returns pluralized string
  */
	function pluralize(str) {

		//words with same singular & plural form
		var ignoredWords = ['equipment', 'information', 'rice', 'money', 'species', 'series', 'fish', 'sheep', 'moose', 'deer', 'news'];

		/*
      These rules translate from the singular form of a noun to its plural form.
    */
		var rules = [
			[new RegExp('(m)an$', 'gi'), '$1en'],
			[new RegExp('(pe)rson$', 'gi'), '$1ople'],
			[new RegExp('(child)$', 'gi'), '$1ren'],
			[new RegExp('^(ox)$', 'gi'), '$1en'],
			[new RegExp('(ax|test)is$', 'gi'), '$1es'],
			[new RegExp('(octop|vir)us$', 'gi'), '$1i'],
			[new RegExp('(alias|status)$', 'gi'), '$1es'],
			[new RegExp('(bu)s$', 'gi'), '$1ses'],
			[new RegExp('(buffal|tomat|potat)o$', 'gi'), '$1oes'],
			[new RegExp('([ti])um$', 'gi'), '$1a'],
			[new RegExp('sis$', 'gi'), 'ses'],
			[new RegExp('(?:([^f])fe|([lr])f)$', 'gi'), '$1$2ves'],
			[new RegExp('(hive)$', 'gi'), '$1s'],
			[new RegExp('([^aeiouy]|qu)y$', 'gi'), '$1ies'],
			[new RegExp('(x|ch|ss|sh)$', 'gi'), '$1es'],
			[new RegExp('(matr|vert|ind)ix|ex$', 'gi'), '$1ices'],
			[new RegExp('([m|l])ouse$', 'gi'), '$1ice'],
			[new RegExp('(quiz)$', 'gi'), '$1zes'],
			[new RegExp('s$', 'gi'), 's'],
			[new RegExp('$', 'gi'), 's']
		];

		var ignore = (ignoredWords.indexOf(str.toLowerCase()) > -1);
		if (!ignore) for (var x = 0; x < rules.length; x++)
			if (str.match(rules[x][0])) {
				str = str.replace(rules[x][0], rules[x][1]);
				break;
			}

		return '' + str;

	}

	/*
  Is flat dataset All Time scenario
  */
	function isAllTime(desc) {
		var timeDim = desc.Header[0];

		return timeDim.DimensionId == "Time" && timeDim.DateFields && timeDim.DateFields[0].DateColumn == 0 && timeDim.Members.length == 0;
	}

	/*
  transform request 
  */
	function transformRequest(dataRequest) {
		if (!dataRequest || $.isEmptyObject(dataRequest)) return dataRequest;

		dataRequest = JSON.parse(dataRequest);
		dataRequest = toTimeSeriesRequest(dataRequest);
		dataRequest.Frequencies = toSingleFrequency(dataRequest.Frequencies);
		return dataRequest;
	}

	/*
  converts request to timeseries by keeping only time in header
  */
	function toTimeSeriesRequest(desc) {
		if (!desc || $.isEmptyObject(desc)) return desc;

		var tsDesc = $.extend(true, {}, desc);
		tsDesc.Header = [];
		tsDesc.Stub = [];
		tsDesc.Filter = [];
		var allDims = desc.Header.concat(desc.Stub, desc.Filter);
		$.each(allDims, function (i, dim) {
			dim.DatasetId = tsDesc.Dataset;
			if (dim.DimensionId == "Time") {
				//make it range time selection - fixes atlas descriptors
				if (dim.Members.length > 1) {
					dim.Members = [dim.Members[0] + "-" + dim.Members[dim.Members.length - 1]];
					dim.UiMode = "range";
				}

				tsDesc.Header.push(dim);
			} else tsDesc.Stub.push(dim);
		});

		return tsDesc;
	}

	//date formatting methods
	function toUIFormatDate_(statDates) {
		if (!statDates || statDates.length == 0) return statDates;

		var uiDates = [];

		for (var i = 0; i < statDates.length; i++) {
			var sd = statDates[i];
			var dt = dateFromStatisticalFormattedDate_(sd);
			var freq = freqFromStatisticalFormattedDate_(sd);
			var ud = uiFormattedDate_(dt, freq);
			uiDates.push(ud);
		}

		return uiDates;
	}

	function freqFromStatisticalFormattedDate_(statisticalFormattedDate) {
		var halfYears = ["H1", "H2"];
		var quarters = ["Q1", "Q2", "Q3", "Q4"];
		var monthsEncoded = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11", "M12"];

		var date = toUTCDate_(statisticalFormattedDate);
		var yearString = yearStringFromStatisticalFormattedDate_(statisticalFormattedDate);
		var year = parseInt(yearString);
		if (!isNaN(year) && statisticalFormattedDate.length - yearString.length == 0) return "A";
		else if (!isNaN(date)) return "D";
		else {
			if (!isNaN(year) && statisticalFormattedDate.length - yearString.length > 0) {
				var periodSubString = statisticalFormattedDate.substr(yearString.length, statisticalFormattedDate.length - yearString.length).toUpperCase();
				if (halfYears.indexOf(periodSubString) > -1) {
					return "H";
				} else if (quarters.indexOf(periodSubString) > -1) {
					return "Q";
				} else if (monthsEncoded.indexOf(periodSubString) > -1) {
					return "M";
				}
			}
		}
		return null;
	}

	function dateFromStatisticalFormattedDate_(statisticalFormattedDate) {
		var result;
		var halfYears = ["H1", "H2"];
		var quarters = ["Q1", "Q2", "Q3", "Q4"];
		var monthsEncoded = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11", "M12"];

		var date = toUTCDate_(statisticalFormattedDate);
		var yearString = yearStringFromStatisticalFormattedDate_(statisticalFormattedDate);
		var year = parseInt(yearString);
		if (!isNaN(year) && statisticalFormattedDate.length - yearString.length == 0) {
			result = toUTCDate_(year, 0, 1);
			if (year < 100) result.setFullYear(year); // workaround for y2k bug in date constructor
		} else if (!isNaN(date)) result = date;
		else {
			var month = 0;
			var day = 1;
			if (!isNaN(year) && statisticalFormattedDate.length - yearString.length > 0) {
				var periodSubString = statisticalFormattedDate.substr(yearString.length, statisticalFormattedDate.length - yearString.length).toUpperCase();
				if (halfYears.indexOf(periodSubString) > -1) {
					var halfYear = halfYears.indexOf(periodSubString);
					month = (halfYear * 6);
					result = toUTCDate_(year, month, day);
				} else if (quarters.indexOf(periodSubString) > -1) {
					var quarter = quarters.indexOf(periodSubString);
					month = (quarter * 3);
					result = toUTCDate_(year, month, day);
				} else if (monthsEncoded.indexOf(periodSubString) > -1) {
					month = monthsEncoded.indexOf(periodSubString);
					result = toUTCDate_(year, month, day);
				}
				if (year < 100) result.setFullYear(year); // workaround for y2k bug in date constructor
			}
		}
		return result;
	}

	function yearStringFromStatisticalFormattedDate_(statisticalFormattedDate) {
		if (typeof statisticalFormattedDate != 'string') throw ('input is not a string');
		var result = '';
		for (var i = 0; i < statisticalFormattedDate.length; i++) {
			var c = statisticalFormattedDate[i];
			if (!isNaN(parseInt(c))) result = result + c;
			else break;
		}
		if (result.length > 0) return result;
		else return null;
	}

	function toUTCDate_() {
		var utcDt = null;
		if (arguments.length == 0) {
			var date = new Date();
			utcDt = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
		} else if (arguments.length == 1) {
			if (typeof arguments[0] === "string") {
				var m1 = arguments[0].match(/^(\d{1,2})\/(\d{1,2})\/((?:19|20)\d{2})$/);
				if (m1) {
					var month = m1[1];
					var date = m1[2];
					var year = m1[3];
					utcDt = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(date, 10)));
				} else {
					var m2 = arguments[0].match(/^((?:19|20)\d{2})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/);
					if (m2) {
						var year = m2[1];
						var month = m2[2];
						var date = m2[3];

						if (date) {
							utcDt = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(date, 10)));
						} else if (month) {
							utcDt = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, 1));
						} else {
							utcDt = new Date(Date.UTC(parseInt(year, 10), 0, 1));
						}
					} else {
						if (isIsoDateFormat_(arguments[0])) utcDt = dateFromISOString_(arguments[0], true);
						else utcDt = new Date(arguments[0]);
					}
				}
			} else if (isDate_(arguments[0])) {
				var date = arguments[0];
				utcDt = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
			} else {
				if (isIsoDateFormat_(arguments[0])) utcDt = dateFromISOString_(arguments[0], true);
				else utcDt = new Date(arguments[0]);
			}
		} else if (arguments.length == 2) {
			var year = parseInt(arguments[0], 10);
			var month = parseInt(arguments[1], 10);

			if (!isNaN(year) && !isNaN(month)) {
				utcDt = new Date(Date.UTC(year, month, 1));
			} else {
				utcDt = new Date(arguments[0], arguments[1]);
			}
		} else if (arguments.length == 3) {
			var year = parseInt(arguments[0], 10);
			var month = parseInt(arguments[1], 10);
			var date = parseInt(arguments[2], 10);

			if (!isNaN(year) && !isNaN(month) && !isNaN(date)) {
				utcDt = new Date(Date.UTC(year, month, date));
			} else {
				utcDt = new Date(arguments[0], arguments[1], arguments[2]);
			}
		} else {
			utcDt = new Date(Date.UTC.apply(utcDt, arguments));
		}
		return utcDt;
	}

	function isDate_(object) {
		if (isNaN && isNaN(object)) return false;
		return !!(object && object.setUTCMilliseconds && object.setUTCFullYear);
	}

	function isIsoDateFormat_(dateString) {
		if (typeof dateString != "string") throw new ReferenceError('Invalid input: date as string is needed');
		//expected MVC4 date iso format:  1990-01-01T00:00:00 (ending Z is optional, date assumed to be UTC with or without it.)
		if (dateString.match(new RegExp('^(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2}):\\d{2}', 'g'))) return true;
		else return false;
	}

	// this method is needed as new Date(isoDateString) returns NaN in IE8/9 (KN-3813)
	function dateFromISOString_(isoDateString) {
		if (!isIsoDateFormat_(isoDateString)) throw new Error("Invalid input: string is not an iso date string");

		function fastDateParse(y, m, d, h, M, S) {
			var result = toUTCDate_(y, m - 1, d);
			if (y < 100) {
				// workaround for ugly Y2K bug in Date constructor
				result.setFullYear(y);
			}
			return result;
		}
		var retDate = fastDateParse.apply(this, isoDateString.split(/\D/));
		return retDate;
	}


	function uiFormattedDate_(date, frequency) {
		var year = date.getFullYear();
		var month = date.getMonth();
		var allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var result = "";
		switch (frequency) {
			case 'Q':
			case 'quarterly':
				result = year;
				if (month <= 2) result += ' Q1';
				else if (month <= 5) result += ' Q2';
				else if (month <= 8) result += ' Q3';
				else result += ' Q4';
				break;
			case 'M':
			case 'monthly':
				result = year + ' ' + allMonths[month];
				break;
			case 'H':
			case 'semiAnnual':
				result = year;
				if (month <= 5) result += ' H1';
				else result += ' H2';
				break;
			case 'D':
			case 'daily':
				result = year + " " + allMonths[month] + " " + date.getDate();
				break;
			default:
				// yearly
				result += year;
		}
		return result;
	}

	function apiPost(url, postData, callback) {
		$.ajax({
			url: url,
			type: 'POST',
			data: JSON.stringify(postData),
			processData: true,
			contentType: 'application/json',
			success: function (result) {
				callback(result);
			}
		});

	}

	function requestResults(data, callback) {
		var url = BaseDomain + '/api/1.0/data/pivot' + '?' + ClientId;
		apiPost(url, data, callback);

	}


	function populateSheetRange(tableRows, frequency) {
		if (!tableRows || tableRows.length === 0 || !frequency)
			 console.log("Error");
		
		var timeHeader = tableRows[0];

		//insert date header with format
		//sheet.getRange(lastRow + 1, 1, 1, timeHeader.length).setNumberFormat(dateFormat).setValues([timeHeader]);
		//remove time header row
		//tableRows.splice(0, 1);
		//insert values with format
		//sheet.getRange(lastRow + 2, 1, tableRows.length, timeHeader.length).setNumberFormat(numFormat).setValues(tableRows);

		var tableData = new Office.TableData();
		/*if(timeHeader.length > 0)
			tableData.headers = [timeHeader[0]];
		if(timeHeader.length > 1)	
			for (var i = 1; i < timeHeader.length ; i++)
				tableData.headers.push([timeHeader[i]]);*/
		tableData.headers = timeHeader;

		tableRows.splice(0, 1);

		for (var j = 0; j < tableRows.length; j++)
			tableData.rows.push(tableRows[j])
		//tableData.rows.push(["Source", result.source, result.sourceLink])
		var tableOptions = { bandedRows: true, filterButton: false, style: "none" };
		Office.context.document.setSelectedDataAsync(tableData, {
			tableOptions: { filterButton: false, bandedRows: false, bandedColumns: false, headerRow: false },
			cellFormat: [{ cells: Office.Table.Headers, format: { backgroundColor: "none" } }],
			coercionType: "table"
		}, function (result) {
			if (result.status === Office.AsyncResultStatus.Succeeded) {

				hideError();
				hideLoading();
			} else {
				hideLoading();
				showErrorMessage();
				//alert("Insertion of data failed.Please select an empty cell and try inserting data again. ");

			}
		});
	}

	/*
	retuns all stub dimension ids from response
	*/
	function getAllDimensionIdsInStub(respObj) {
		var dimIds = [];
		for (var i = 0; i < respObj.stub.length; i++) {
			var dim = respObj.stub[i];
			dimIds.push(dim.dimensionId);
		}
		return dimIds;
	}

	/* 
 parse pivot response into array of table rows
*/
	function responseIntoRows(respObj, result) {
		var rowsData = [];

		var headerLength = respObj.header[0].members.length;
		var ndataPoints = respObj.data.length;
		//add time header
		var timeHeader = ["", "Unit"]; //first header empty then Unit
		//  var timeInUIFormat = respObj.header[0].members;
		var timeInUIFormat = toUIFormatDate_(respObj.header[0].members);

		//time always in header
		timeHeader = timeHeader.concat(timeInUIFormat);

		var headDetails = [];
		for (var i = 0; i < timeInUIFormat.length + 2; i++)
			headDetails.push(" ");
		rowsData.push(headDetails);

		var nameDetails = ["Name", result.title];
		for (var i = 0; i < timeInUIFormat.length; i++)
			nameDetails.push(" ");
		rowsData.push(nameDetails);

		var sourceDetails = ["Source", result.source, result.sourceLink]
		for (var i = 0; i < timeInUIFormat.length - 1; i++)
			sourceDetails.push(" ");

		rowsData.push(sourceDetails);
		rowsData.push(timeHeader);

		//add rows
		var stubIds = getAllDimensionIdsInStub(respObj);
		var row = [];
		for (var i = 0; i < ndataPoints; i++) {
			var tuple = respObj.data[i];

			//start of new row 
			if (i % headerLength === 0) {
				if (row.length > 0) {
					rowsData.push(row);
					row = [];
				}

				//make stub & put at start of row
				var stubName = "";
				for (var j = 0; j < stubIds.length; j++) {
					var key = stubIds[j];
					stubName = stubName !== "" ? stubName + " - " + tuple[key] : tuple[key];
				}

				row.push(stubName);
				row.push(tuple.Unit);
			}

			row.push(tuple.Value);

		}

		//final row
		rowsData.push(row);

		//rowsData.push(data.dimensions)
		return rowsData;
	}

	function addResultToSheet(result) {
		var matrx = [
			["Name", result.title, ""],
			["Source", result.source, result.sourceLink]
		];


		$('body').trigger({
			type: "ResultHeaderAdded",
			message: result
		});
	}

	function addDataToSheet(result) {
		requestResults(result.message.request, $.proxy(function (response) {
			var respObj = response;
			var tableRows = responseIntoRows(respObj, result.message);
			populateSheetRange(tableRows, result.message.request.Frequencies[0]);

		}, this));
	}


})();