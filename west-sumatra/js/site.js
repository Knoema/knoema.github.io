
$(function () {

	$('#title').on('click', function () {
		$('#container').hide();
		$('#landing').show();
		return false;

	});

	$('#landing .buttons').on('click', '.button', function () {
		var $target = $(this);

		if ($target.hasClass('overview'))
			showContent('overview');
		else if ($target.hasClass('dashboards'))
			showContent('dashboards');
		else if ($target.hasClass('statistics'))
			showContent('statistics');

		return false;
	});

	function showContent(className) {
		$('#landing').hide();
		$('#container').show();

		$('#tabs').find('.tab.' + className).click();
	}

	$('#tabs').on('click', '.tab', function () {
		var $target = $(this);

		if ($target.hasClass('overview'))
			toggleSelected('overview');
		else if ($target.hasClass('dashboards'))
			toggleSelected('dashboards');
		else if ($target.hasClass('statistics'))
			toggleSelected('statistics');

		return false;

	});

	function toggleSelected(className) {

		var $tab = $('#tabs').find('.tab.' + className);
		var $content = $('#content').find('.' + className);
		if($tab.length == 0
			|| $content.length == 0)
			return;

		$('#tabs').find('.tab.selected').removeClass('selected');
		$('#content').find('.selected').removeClass('selected');

		$tab.addClass('selected');
		$content.addClass('selected');

	}


});