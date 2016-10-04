$(function () {
	$('.sidebar-topic').on('click', function () {

		var topicId = $(this).data('topic-id');

		$('.topic-content, .sidebar-topic').removeClass('active');
		$('.sidebar-topic[data-topic-id="' + topicId + '"]').addClass('active');
		$('.topic-content[data-topic-id="' + topicId + '"]').addClass('active');

		return false;
	});

	$('.subtopic-content a').on('click', function () {

		$('.subtopic-content li').removeClass('active');
		$(this).parent().parent().addClass('active');
		var param = $(this).html();
		$('.i-frame-content iframe').attr('src', 'http://knoema.com/resource/embed/qlzwmqc?indicateur=' + param);

		var objectsCode = $(this).parents('.root-objects').data('objects');
		var a = $('.botton-wrapper a');
		if (objectsCode) {
			a.attr('href', 'overview.html?objects=' + objectsCode);
		} else {
			a.attr('href', '#');
		}

		return false;
	});
});