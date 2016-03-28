$(function() {
	function scrollToAnchor(anchor) {
		$('.modal-menu .active').removeClass('active');
		$('.modal-menu a[href="' + anchor + '"]').toggleClass('active', true);
		
		var $anchor = $('.modal-body a[name="' + anchor.substr(1) + '"]');
		if ($anchor.length > 0) 
		{
			var $parent = $anchor.closest('.modal-body');
			$parent.animate({
				scrollTop: $anchor.offset().top + $parent.scrollTop() - $parent.offset().top
			}, 500);
		}
	}

	var scrollTimeout;
	$('.modal-body').on('scroll', function(ev) {
		clearTimeout(scrollTimeout);
		scrollTimeout = setTimeout(function() {
			var $modalBody = $(ev.delegateTarget),
				bodyTop = $modalBody.offset().top, 
				bodyHalfHeight = $modalBody.height() / 2,
				$anchors = $modalBody.find('a[name]'),
				$activeAnchor;

			for (var i = 0; i < $anchors.length; i++) {
				var $anchor = $($anchors[i]);
				if ($anchor.offset().top - bodyTop < bodyHalfHeight) {
					$activeAnchor = $anchor;
				} else {
					break;
				}
			}

			if ($activeAnchor) {
				var $menuLink = $('.modal-menu a[href="#' + $activeAnchor.attr('name') + '"]');
				if ($menuLink.length > 0 && !$menuLink.hasClass('active')) {
					$('.modal-menu .active').removeClass('active');
					$menuLink.toggleClass('active', true);
				}
			}
		}, 200);
	});

	$('.modal-close').on('click', function(ev) {
		$('.modal-bg').removeClass('open');
		$(ev.target).closest('.modal').removeClass('open');
	});

	$('.modal-menu').on('click', 'a', function(ev) {
		ev.preventDefault();
		scrollToAnchor($(ev.target).attr('href'))
	})

	$('a[data-toggle="modal"]').on('click', function(ev) {
		ev.preventDefault();

		$('.modal-bg').toggleClass('open', true);

		var $link = $(ev.target);
		$($link.attr('href')).toggleClass('open', true);

		window.setTimeout(function() {
			scrollToAnchor($link.data('href'));
		}, 0);
	});

	var $languageMenu = $('.header .language').on('click', 'a', function(ev) {
		$languageMenu.find('.active').removeClass('active');
		$(ev.target).toggleClass('active', true);
	});
});