$(function () {
	var runningSearch;

	window.onpopstate = function (event) {
		$("#search-query").val(event.state).change();
		runSearch(skipHistory = true);
	};

	$.get("tmpl/search-elastic-results.htm", function (markup) {
		$.template("Tmpl-search-elastic-results", markup);
	});

	$.get("tmpl/search-elastic-results-ds.htm", function (markup) {
		$.template("Tmpl-search-elastic-results-ds", markup);
	});

	function runSearch(skipHistory) {
		if (runningSearch) {
			runningSearch.abort();
			runningSearch = null;
		}

		var url = $("#search-server").val() + "/_search";

		if (!skipHistory) {
			var query = $("input#search-query").val();
			var href = window.location.origin + window.location.pathname + "?query=" + query;
			if (Modernizr.history) {
				history.pushState(query, document.title, href);
			}
			else {
				location.href = href;
			}
		}

		var rawQuery = $("#search-query-raw").val();

		$("#search-progress").show();
		runningSearch = $.post(url, rawQuery, function (result) {
			if (result.hits.hits) {
				for (var i = 0; i < result.hits.hits.length; i++) {
					var item = result.hits.hits[i];

					if (item._source.datasetDesc) {
						var html = item._source.datasetDesc;
						var div = document.createElement("div");
						div.innerHTML = html;
						var text = div.textContent || div.innerText || "";

						if (text.length > 520) {
							text = text.substring(0, 520) + "&#8230;";
						}

						item._source.datasetDesc = text;
					}
				}
			}

			if ($("#ds_mode").is(":checked")) {
				var model = { "hits": {} };
				if (result.hits.hits) {
					var datasets = {};
					for (var i = 0; i < result.hits.hits.length; i++) {
						var item = result.hits.hits[i];

						var ds = datasets[item._source.datasetId];
						if (!ds) {
							ds = {
								"position": i,
								"datasetId": item._source.datasetId,
								"datasetName": item._source.datasetName,
								"datasetDesc": item._source.datasetDesc,
								"sourceName": item._source.sourceName,
								"timeseries": []
							};
							datasets[item._source.datasetId] = ds;
						}

						ds.timeseries.push({
							"id": item._id,
							"key": item._source.key,
							"dimensions": item._source.dimensions,
							"unit": item._source.unit,
							"frequency": item._source.frequency,
							"position": i
						});
					}

					for(var dsId in datasets) {
						var ds = datasets[dsId];
						model.hits[ds.position] = ds;
					}
				}
				$("#search-results").empty().append($.tmpl("Tmpl-search-elastic-results-ds", model));
			}
			else {
				$("#search-results").empty().append($.tmpl("Tmpl-search-elastic-results", result.hits));
			}
			$("#search-progress").hide();
		});
	}

	var pars = $.deparam.querystring();

	$("#search-query").val(pars.query);
	$("#search-query").focus();

	$("#search-query-raw").val(JSON.stringify({
		"query": {
			"multi_match": {
				"query": $("#search-query").val(),
				"fields": ["dimensions.name^2"],
				"type": "most_fields"
			}
		},
		"size": 100
	}));

	if ($("#search-query").val()) {
		runSearch();
	}

	$("#site-search-button").on("click", runSearch);

	$("input#search-query").keypress(function (e) {
		if (e.keyCode != 13)
			return;

		$("input#search-query").change();
		runSearch();
		return false;
	});

	$("#search-query").on("change", function () {
		var query = JSON.parse($("#search-query-raw").val());
		if (query && query.query && query.query.multi_match) {
			query.query.multi_match.query = $("#search-query").val();
			$("#search-query-raw").val(JSON.stringify(query));
		}
	});

	$("#search_name").on("change", function () {
		var query = JSON.parse($("#search-query-raw").val());
		if (query && query.query && query.query.multi_match && query.query.multi_match.fields) {
			var fields = query.query.multi_match.fields;

			if ($("#search_name").is(":checked") && fields.indexOf("datasetName") < 0) {
				fields.push("datasetName");
			}
			else if (!$("#search_name").is(":checked") && fields.indexOf("datasetName") >= 0) {
				fields.splice(fields.indexOf("datasetName"), 1);
			}

			$("#search-query-raw").val(JSON.stringify(query));
			runSearch(skipHistory = true);
		}
	});

	$("#search_desc").on("change", function () {
		var query = JSON.parse($("#search-query-raw").val());
		if (query && query.query && query.query.multi_match && query.query.multi_match.fields) {
			var fields = query.query.multi_match.fields;

			if ($("#search_desc").is(":checked") && fields.indexOf("datasetDesc") < 0) {
				fields.push("datasetDesc");
			}
			else if (!$("#search_desc").is(":checked") && fields.indexOf("datasetDesc") >= 0) {
				fields.splice(fields.indexOf("datasetDesc"), 1);
			}

			$("#search-query-raw").val(JSON.stringify(query));
			runSearch(skipHistory = true);
		}
	});

	$("#ds_mode").on("change", function () {
		runSearch(skipHistory = true);
	});
});