(function($) {
    $(function() {
        var $jcarousel = $('.jcarousel');
        
        $(window)
            .on('resize', function() {
                $jcarousel.find('li').each(function() {
                    $(this).width($jcarousel.width());
                });
            })
            .trigger('resize');

        $jcarousel.jcarousel({ wrap: 'circular' });

        $('.jcarousel-control-prev')
            /*.on('jcarouselcontrol:active', function() {
                $(this).removeClass('inactive');
            })
            .on('jcarouselcontrol:inactive', function() {
                $(this).addClass('inactive');
            })*/
            .jcarouselControl({
                target: '-=1'
            });

        $('.jcarousel-control-next')
            /*.on('jcarouselcontrol:active', function() {
                $(this).removeClass('inactive');
            })
            .on('jcarouselcontrol:inactive', function() {
                $(this).addClass('inactive');
            })*/
            .jcarouselControl({
                target: '+=1'
            });

        $('.jcarousel-pagination')
            .on('jcarouselpagination:active', 'a', function() {
                $(this).addClass('active');
            })
            .on('jcarouselpagination:inactive', 'a', function() {
                $(this).removeClass('active');
            })
            .jcarouselPagination();
    });
})(jQuery);
