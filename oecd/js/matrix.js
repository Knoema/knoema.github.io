/// <reference path="../jQuery/jquery-1.8.1.js" />
/// <reference path="../jQuery/extensions/jquery.stickyHeader.js" />
/// <reference path="../jQuery/extensions/jquery.tablesorter.js" />
/// <reference path="../jQuery/extensions/jquery.defaultText.js" />

$(function () {
	var headersCount = $("thead th", "table.stickyHeader").length;
	var headersOpts = {};
	for (var i = 1; i < headersCount; i++)
		headersOpts[i] = { lockedOrder: 1 };
	
	$('.countries-filter-field').width($('th.countries').width() - 40);

	var sortClass = ["headerSortDown", "headerSortUp"];
	$("table.stickyHeader").tablesorter({ headers: headersOpts, cssAsc: sortClass[1], cssDesc: sortClass[2], sortInitialOrder: "desc", widgets: ['zebra'], cancelSelection: false });

	$("div#atlas").on("click", "div.stickyHeader th.sortable", function () {
		var id = $(this).data("id");
		$("th[data-id=" + id + "].sortable", "table.stickyHeader").click();
	});

	$("table.stickyHeader").on("sortEnd", function (e, sortList) {
		if (typeof sortList == "undefined")
			return;

		var columnIdx = sortList[0] + 1;
		var order = sortList[1];

		$("th.active", "div.stickyHeader").removeClass("active");
		$("th:nth-child(" + columnIdx + ")", "div.stickyHeader").addClass("active");
	});

	$('.countries-filter-field').on('click', function (e) {

		$(this).focus();
		e.stopPropagation();
	});

	$('.countries-filter-field').on('keyup mouseup', function (e) {

		var $this = $(this);

		//fix for ie clear icon
		if (e.type == 'mouseup' && $this.val() == "")
			return;

		setTimeout(function () {
			var search = $this.val();
			var searchUpper = search.toUpperCase();
			if ($this.parents('table.stickyHeader').length > 0)
				$('div.stickyHeader .countries-filter-field').val(search);
			else
				$('table.stickyHeader .countries-filter-field').val(search);

			var $rows = $('.row');

			var matchedRows = 0;
			$rows.each(function (index, item) {
				var $item = $(item);
				var name = $item.data('country-name');

				$item.removeClass('odd').removeClass('even');

				if (name && name.search(searchUpper) != -1) {
					if (matchedRows % 2 == 0)
						$item.addClass('odd');

					$item.removeClass('hidden');
					matchedRows++;
				}
				else if (!$item.hasClass('hidden')) {
					$item.addClass('hidden');
				}
			});

			$('.countries-filter-field').width($('th.countries').width() - 40);

			$('#not-found-container').remove();
			if (matchedRows == 0) {
				$('#atlas').append($('<div>', {
					id: 'not-found-container',
					text: __R('There are no matching countries found. Please change your request.')
				}));
			}
		}, 200);

		e.stopPropagation();
	});

	$('.countries-filter-field').trigger('mouseup');
	$.defaultText();
});