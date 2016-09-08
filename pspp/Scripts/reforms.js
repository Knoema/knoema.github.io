/// <reference path="typings/jquery.d.ts"/>

$(function () {
	$('.reforms-container ul li').on('click', function () {
		$('.reforms-container ul li').removeClass('active');
		$(this).addClass('active');
	});
});