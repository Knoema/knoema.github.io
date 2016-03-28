(function() {
	Application = function() {

	};

	Application.prototype.init = function() {
		var incidentsMap = new google.maps.Map(document.getElementById('incidents-map'), {
			zoom: 4,
			center: { lat: 10, lng: 10 },
			mapTypeId: google.maps.MapTypeId.HYBRID
		});

		$('.my-list').on('click', '.item', function(event) {
			$(event.delegateTarget).find('.item.active').removeClass('active');
			$(event.target).toggleClass('active');
		});
	};

	Application.prototype.getConflicts = function(year, country, location) {
		$.post('http://knoema.com/api/1.0/data/details?client_id=EZj54KGFo3rzIvnLczrElvAitEyU28DGw9R73tif&page_id=odlfbqc', {
			"Header":[],"Stub":[],"Filter":[{
				"DimensionId":"country",
				"Members":["1000500"],
				"DimensionName":"COUNTRY",
				"DatasetId":"odlfbqc",
				"Order":"0",
				"isGeo":true
			}],"Frequencies":[],"Dataset":"odlfbqc","Segments":null,"MeasureAggregations":null
		})
		.done(function(conflicts) {
		})
	};

	window.App = Application;
})();