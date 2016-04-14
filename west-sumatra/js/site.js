
$(function () {

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

		//if (className == 'dashboards')
		//	$content.find('iframe').height($content.height());

		if(className == 'statistics')
			$content.find('iframe').height($content.height() + 66);

	}

	$('#content').find('iframe').height($('#content').height());


});