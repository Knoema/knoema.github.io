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
		var dashId = $(this).data('link');
		$('.i-frame-content iframe').attr('src', 'http://knoema.com/resource/embed/' + dashId);

		return false;
	});
});