$(function () {
	$('.recent-projects #next').click(function () {

		var left = parseInt($('.slider').css('left')) || 0;

		if (left > -660)
			$('.slider').animate({ left: left - 330 });

		return false;
	});

	$('.recent-projects #prev').click(function () {

		var left = parseInt($('.slider').css('left')) || 0;

		if (left < 0)
			$('.slider').animate({ left: left + 330 });

		return false;
	});
});