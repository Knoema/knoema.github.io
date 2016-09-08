/// <reference path="typings/jquery.d.ts"/>

$(function () {
	var host = 'http://senegal.opendataforafrica.org';

	function populateTarget(items, goal, isEditor) {
		items = items.sort(function (a, b) {
			return a[4] - b[4];
		});
		goalItemsToEdit = items;
		for (var i in items) {
			var item = items[i];
			addTarget(item, goal, i, isEditor);
		}
	};

	function addTarget(item, goal, rowNumber, isEditor) {
		var $target = $('#detail-page .target-content');
		var level = item[5];
		var name = item[3];
		if (level == 1) {
			$target.append('<div class="header"><a class="expand" href="#"></a><div class="title">' + name + '</div></div>');
			$target.append('<div class="items"></div>');
		}
		else {
			var $item = $('<div class="item"><div class="table-column desc"><span class="name">' + name + '</span></div></div>');
			var source = item[9];
			if (isEditor)
				$item.append('<div class="table-column edit"><a href="#" class="edit-data">Edit</a></div>');
			$item.append('<div class="table-column"><a class="country-data">' + source + '</a></div>');
			if (item[10] == "1")
				$item.append('<div class="table-column"><a class="browse-data" target="_blank" href="' + item[13] + '">Browse Data</a></div>');
			else
				$item.append('<div class="table-column"><a class="browse-data" style="visibility: hidden;" target="_blank" href="' + item[13] + '">Browse Data</a></div>');

			if (item[11] == "1")
				$item.append('<div class="table-column"><a target="blank" class="meta-data" href="' + item[14] + '">Metadata</a></div>');
			else
				$item.append('<div class="table-column"><a class="meta-data" style="visibility: hidden;" target="_blank" href="' + item[14] + '">Metadata</a></div>');

			if (item[12] == "1")
				$item.append('<div class="table-column"><a class="sdmx" href="' + item[15] + '">SDMXURL</a></div>');
			else
				$item.append('<div class="table-column"><a class="sdmx" style="visibility: hidden;" target="_blank" href="' + item[15] + '">SDMXURL</a></div>');

			$item.addClass('level-' + level);
			$item.data('item', item);
			$item.data('rowNumber', rowNumber);
			$target.find('.items:last-child').append($item);
		}
	};

	if ($('#sdg').length) {
		$('#edit-wiki-button').hide();

		$.get(host + '/api/1.0/meta/dataset/ofgwvlf/dimension/goal-name').then(function (response) {
			if (response) {
				$('#sdg .tile').each(function (idx, ele) {
					var $ele = $(ele);
					var goalNo = idx + 1;
					var goal;
					for (var i in response.items) {
						goal = response.items[i];
						if (goal.fields && goal.fields['goal-order'] == goalNo)
							break;
					}

					$ele.data('goal-key', goal.key);
					$ele.data('goal-name', goal.name);
					$ele.data('goal-no', goalNo);
					$ele.find('.hover-text').text(goal.name);
				});

				$('#sdg .tile .image').empty();
			}
		});

		$('#sdg .back').on('click', function () {
			$('#tile-page').show('slow');
			$('#detail-page').hide('slow').attr('class', "")
			$(this).hide();
		});
		var goal;
		$('#sdg .tile').on('click', function () {
			if ($('#edit-wiki-button').length) {
				$('#edit-wiki-button').show();
				$('#edit-wiki-button').attr('href', '/sdgeditor');
			}
			var $this = $(this);
			goal = {
				key: $this.data('goal-key'),
				name: $this.data('goal-name'),
				no: $this.data('goal-no')
			};

			$('#tile-page').hide('slow');
			$('#detail-page').show('slow').addClass('goal-' + goal.no);
			$('.back').show();

			$('#detail-page .target-content').empty();

			$('#detail-page .goal-header .text').text(goal.name);
			$('#detail-page .goal-header a').removeClass('collapse').addClass('expand').find('span.img-txt').text("Expand All");

			var dimRequest = [{ DimensionId: "goal-name", DimensionName: "Goal - Name", Position: "Filter", Members: [goal.key], IsGeo: false },
				{ DimensionId: "browsedataurl-enabled", DimensionName: "BrowseDataURL_Enabled", Position: "Filter", Members: [], IsGeo: false },
				{ DimensionId: "metadataurl-enabled", DimensionName: "MetadataURL_Enabled", Position: "Filter", Members: [], IsGeo: false },
				{ DimensionId: "sdmxurl-enabled", DimensionName: "SDMXURL_Enabled", Position: "Filter", Members: [], IsGeo: false }
			];

			populateData($('#sdg'));
		});

		$('#sdg .tile').hover(
		function () {
			setTimeout($.proxy(function () {
				$(this).find('div:first').animate({ 'top': '-149px' }, 'fast');
				$(this).find('div.hover-text').show();
			}, this), 200);
		},

		function () {
			setTimeout($.proxy(function () {
				$(this).find('div:first').animate({ 'top': '0px' }, 'fast');
				$(this).find('div.hover-text').hide();
			}, this), 200);
		});
	}

	$('#detail-page .goal-header a').on('click', function () {
		var $this = $(this);
		if ($this.hasClass('expand')) {
			$('#detail-page .items').show();
			$this.removeClass('expand').addClass('collapse').find('span.img-txt').text("Collapse All");
			$('#detail-page .target-content .header a').removeClass('expand').addClass('collapse');
		}
		else {
			$('#detail-page .items').hide();
			$this.removeClass('collapse').addClass('expand').find('span.img-txt').text("Expand All");
			$('#detail-page .target-content .header a').removeClass('collapse').addClass('expand');
		}
		return false;
	});

	$('#detail-page .target-content').on('click', '.header a', function () {
		var $this = $(this);
		if ($this.hasClass('expand')) {
			$this.removeClass('expand').addClass('collapse');
			$this.parent().next('.items').show();
			if ($('#detail-page .goal-header a').hasClass('expand'))
				$('#detail-page .goal-header a').removeClass('expand').addClass('collapse').find('span.img-txt').text("Collapse All");
		}
		else {
			$this.removeClass('collapse').addClass('expand');
			$this.parent().next('.items').hide();

			if ($('#detail-page .target-content .header a').length == $('#detail-page .target-content .header a.expand').length)
				if ($('#detail-page .goal-header a').hasClass('collapse'))
					$('#detail-page .goal-header a').removeClass('collapse').addClass('expand').find('span.img-txt').text("Expand All");
		}
		return false;
	});

	$('#edit-wiki-button').on('click', function () {
		if (Modernizr.localstorage) {
			localStorage.setItem("GoalDetails", JSON.stringify(goal));
		}
	});
	var detailsData;
	var groupByGoal;
	function populateData($div, isEditor) {
		var detailDesc = {
			Dataset: 'ofgwvlf',
			Frequencies: [],
			Header: [],
			MeasureAggregations: null,
			Segments: null,
			Stub: [],
			Filter: [
			{
				DatasetId: 'ofgwvlf',
				DimensionId: "goal-name",
				DimensionName: "Goal - Name",
				Members: []
			}]
		};

		$.post(host + '/api/1.0/data/details', detailDesc, function (data) {
			if (data) {
				detailsData = data;
				var lists = _.groupBy(data.data, function (element, index) {
					return Math.floor(index / data.columns.length);
				});

				groupByGoal = _.groupBy(lists, function (element, index) {
					return element[1];
				});
				populateTarget(groupByGoal[goal.no], goal, isEditor);
			}

		});
	};

	var goalToEdit;
	var goalItemsToEdit;
	if ($('#sdg-editor').length) {
		if ($('#edit-wiki-button').length)
			$('#edit-wiki-button').hide();

		var goal;
		if (Modernizr.localstorage && localStorage.getItem("GoalDetails")) {
			goal = $.parseJSON(localStorage.getItem("GoalDetails"));
			localStorage.removeItem("GoalDetails");
			goalToEdit = goal;
		}
		$('#detail-page').show();
		$('#detail-page .goal-header .text').text(goal.name);
		$('#detail-page').addClass('goal-' + goal.no);
		populateData($('#sdg-editor'), true);


		$('body').on('click', '.edit-data', function () {

			var $tr = $(this).parents('.item');
			var rowNumber = $tr.data('rowNumber');
			var item = goalItemsToEdit[rowNumber];

			var $editor = $('<div style="height: 400px; width: 680px;" title="Edit Details" class="row-editor"></div>');
			$editor.attr('title', 'Edit Details: ' + item[3]);
			$editor.appendTo('body');
			$editor.append('<br/>');
			$editor.append('<label>Data Browse Link:</label>');
			$editor.append('<textarea class="dsbrowser-link" style="margin-left: 30px; width: 440px; height: 80px;" ></textarea>');
			$editor.find('.dsbrowser-link').val(item[13]);
			$editor.append('<a target="_blank" style="margin-left: 20px;" href="#" class="check-link">Check Link</a>');
			$editor.append('<br/>');
			$editor.append('<br/>');
			$editor.append('<label>Metadata Link:</label>');
			$editor.append('<textarea style="margin-left: 49px; width: 440px; height: 80px;" class="dsbb-link" ></textarea>')
			$editor.find('.dsbb-link').val(item[14]);
			$editor.append('<a style="margin-left: 20px;" target="_blank" href="#" class="check-link">Check Link</a>');
			$editor.append('<br/>');
			$editor.append('<br/>');
			$editor.append('<label>SDMX Link:</label>');
			$editor.append('<textarea style="margin-left: 65px; width: 440px; height: 80px;" class="sdmx-link" ></textarea>')
			$editor.find('.sdmx-link').val(item[15]);
			$editor.append('<a style="margin-left: 20px;" target="_blank" href="#" class="check-link">Check Link</a>');

			var $thisEdit = $(this);
			$editor.dialog({
				position: 'center',
				modal: true,
				draggable: false,
				autoOpen: true,
				resizable: false,
				height: 400,
				width: 680,
				create: function () {
					var $dialog = $('.ui-dialog.ui-widget');
					$dialog.css('top', $thisEdit.position().top - 200);
					$dialog.css('left', 50);
				},
				buttons: [
						{
							"text": "Ok",
							"click": function () {
								if (item[13] == $editor.find('.dsbrowser-link').val() && item[14] == $editor.find('.dsbb-link').val() && item[15] == $editor.find('.sdmx-link').val()) {//
									$(this).dialog("close");
									$editor.remove();
									return;
								}

								if ($editor.find('.dsbrowser-link').val().trim() == "") {
									item[10] = 0;
									item[13] = $editor.find('.dsbrowser-link').val().trim();
								}
								else {
									item[10] = 1;
									item[13] = checkLink($editor.find('.dsbrowser-link').val().trim());
								}


								if ($editor.find('.sdmx-link').val().trim() == "") {
									item[12] = 0;
									item[15] = $editor.find('.sdmx-link').val().trim();
								}
								else {
									item[12] = 1;
									item[15] = checkLink($editor.find('.sdmx-link').val().trim());
								}


								if ($editor.find('.dsbb-link').val().trim() == "") {
									item[11] = 0;
									item[14] = $editor.find('.dsbb-link').val().trim();
								}
								else {
									item[11] = 1;
									item[14] = checkLink($editor.find('.dsbb-link').val().trim());
								}

								$tr.empty();

								$('<div class="table-column desc"><span class="name">' + item[3] + '</span><span title="Pending changes" style="color: red; padding-left: 10px; font-size: 18px;" class="pending-submit">*</span></div>').appendTo($tr);
								$('<a href="#" class="edit-data">Edit</a>').appendTo($tr);
								$('<div class="table-column"><a class="country-data">' + item[9] + '</a></div>').appendTo($tr);
								if (item[10] == "1")
									$('<div class="table-column"><a class="browse-data" target="_blank" href="' + item[13] + '">Browse Data</a></div>').appendTo($tr);
								else
									$('<div class="table-column"><a class="browse-data" style="visibility: hidden;" target="_blank" href="' + item[13] + '">Browse Data</a></div>').appendTo($tr);

								if (item[11] == "1")
									$('<div class="table-column"><a target="blank" class="meta-data" href="' + item[14] + '">Metadata</a></div>').appendTo($tr);
								else
									$('<div class="table-column"><a class="meta-data" style="visibility: hidden;" target="_blank" href="' + item[14] + '">Metadata</a></div>').appendTo($tr);


								if (item[12] == "1")
									$('<div class="table-column"><a class="sdmx" href="' + item[15] + '">SDMXURL</a></div>').appendTo($tr);
								else
									$('<div class="table-column"><a class="sdmx" style="visibility: hidden;" target="_blank" href="' + item[15] + '">SDMXURL</a></div>').appendTo($tr);




								if (!$('#sdg-editor').find('.pending-submit').length)
									$('.nsdp-page-submit').css('cursor', 'default').addClass('disable');
								else
									$('.nsdp-page-submit').css('cursor', 'pointer').removeClass('disable');

								$(this).dialog("close");
								$editor.remove();
							}
						},
						{
							"text": "Cancel",
							"click": function () {
								$(this).dialog("close");
								$editor.remove();
							}
						}]
			});

			return false;
		});

		$('body').on('click', '.check-link', function () {
			var $this = $(this);
			var link = checkLink($this.prev('textarea').val());
			$this.attr('href', link);
		});

		function checkLink(link) {
			if (link.indexOf('http://') == -1)
				link = "http://" + link;

			return link;
		};

		var data = new FormData();

		$('body').on('click', '.nsdp-page-submit', function () {
			if ($(this).hasClass('disable'))
				return false;

			var $warningDlg = $('<div>', { 'class': 'warning-dlg', title: 'Confirm' });
			$warningDlg.css({ 'margin-top': '15px', 'font-size': '14px' });
			$warningDlg.text("All pending changes you have entered will be published on the live SDG page. Please confirm.");
			$warningDlg.knDialog({
				position: 'center',
				minWidth: 440,
				maxWidth: 300,
				maxHeight: 200,
				modal: true,
				closeOnEscape: true,
				draggable: false,
				autoOpen: true,
				resizable: false,
				buttons: {
					"Yes": function () {
						submitUpload();
						$(this).dialog("close");
					},
					"No": function () {
						$(this).dialog("close");
					}
				},
				close: function () {
					$(this).remove();
				},
				create: function () {
					$(this).closest(".ui-dialog")
						.find(".ui-button:first")
						.addClass("highlight");
				}
			});
		});

		var datasetId = 'ofgwvlf';
		var datasetName = 'SDG Structure';

		function createCSV() {
			var row = "";

			for (var i = 0; i < detailsData.columns.length; i++) {
				row = row + detailsData.columns[i].name + ",";
			}
			row = row + '\r\n';

			groupByGoal[goalToEdit.no] = goalItemsToEdit;

			for (var i in groupByGoal) {
				var group = groupByGoal[i];
				for (var k = 0; k < group.length; k++) {
					for (var j = 0; j < group[k].length; j++) {
						var val = group[k][j] && typeof group[k][j] == "string" ? group[k][j].replace(/,/g, " ") : group[k][j];
						row = row + val + ",";
					}
					row = row + '\r\n';
				}
			}

			return row;
		};

		function submitUpload() {
			if (!$('#sdg-editor').find('.loading').length)
				Knoema.Utils.addLoading($('#sdg-editor'), function () {
					$('#sdg-editor').css('margin-top', 0).find('.loading').prepend('<h2>We are making the changes to your SDG, which may take several minutes. Once the changes are published, this page will be redirected to the live SDG.</h2>')
					$('#sdg-editor').css('margin-top', 0).find('.loading img').css('top', '0');
				});
			var CSV = createCSV();
			var contentType = 'application/csv';
			var csvFile = new Blob([CSV], { type: contentType });
			csvFile.lastModifiedDate = new Date();
			data.append('file', csvFile, datasetName + ' Update.csv');
			jQuery.ajax({
				url: '/api/1.0/upload/post',
				data: data,
				cache: false,
				contentType: false,
				processData: false,
				type: 'POST',
				success: function (response1) {
					response1 = JSON.parse(response1);
					var url = '/api/1.0/upload/verify?filePath=' + response1.Properties.Location + '&datasetId=' + datasetId + '&startAtRow=1';

					jQuery.ajax({
						url: url,
						cache: false,
						contentType: 'application/json; charset=utf-8',
						processData: false,
						type: 'GET',
						success: function (response2) {
							var data = {
								upload: {
									DatasetId: datasetId,
									Name: datasetName,
									Url: datasetId + '/sdg-structure',
									Columns: response2.Columns,
									FileProperty: response1.Properties,
									FlatDatasetUpdateOptions: response2.FlatDSUpdateOptions,
									UploadFormatType: response2.UploadFormatType
								}
							};

							jQuery.ajax({
								url: '/api/1.0/upload/save',
								data: JSON.stringify(data),
								cache: false,
								contentType: 'application/json; charset=utf-8',
								processData: false,
								type: 'POST',
								success: function (response3) {
									if (response3)
										CheckUploadStatus(response3);
								}
							});
						}
					});
				}
			});
		};

		function CheckUploadStatus(result) {
			jQuery.get('/api/1.0/upload/status?id=' + result.Id, function (statusResult) {
				if (statusResult && statusResult.status == "successful") {
					$('#sdg-editor').find('.loading').find('h2').remove();
					$('#sdg-editor').find('.loading').prepend('<h2>All changes have been published to production site. You will be redirected to the production SDG page shortly.</h2>')

					var timeout = setTimeout(function () {
						var http = location.protocol;
						var slashes = http.concat("//");
						var host = slashes.concat(window.location.hostname);
						window.location.href = host.concat('/sdg');
					}, 3000);
				}
				else {

					var timeout = setTimeout(function () {
						CheckUploadStatus(result);
					}, 60000);
				}

			});
		};

		$('body').on('click', '.cancel-page', function () {
			if ($('.nsdp-page-submit').hasClass('disable'))
				return false;

			var $warningDlg = $('<div>', { 'class': 'warning-dlg', title: 'Confirm' });
			$warningDlg.css({ 'margin-top': '15px', 'font-size': '14px' });
			$warningDlg.text("All pending changes you have entered will be cancelled and the live SDG page will remain unchanged. Please confirm.");
			$warningDlg.knDialog({
				position: 'center',
				minWidth: 440,
				maxWidth: 300,
				maxHeight: 200,
				modal: true,
				closeOnEscape: true,
				draggable: false,
				autoOpen: true,
				resizable: false,
				buttons: {
					"Yes": function () {
						$(this).dialog("close");
						var http = location.protocol;
						var slashes = http.concat("//");
						var host = slashes.concat(window.location.hostname);
						window.location.href = host.concat('/sdg');

					},
					"No": function () {
						$(this).dialog("close");
					}
				},
				close: function () {
					$(this).remove();
				},
				create: function () {
					$(this).closest(".ui-dialog")
						.find(".ui-button:first")
						.addClass("highlight");
				}
			});

			return false;
		});
	};
});