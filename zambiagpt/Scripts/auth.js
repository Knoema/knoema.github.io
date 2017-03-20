
var access_token = "";

$(function () {
	/* Authentication via access token  */
	var params = Knoema.Helpers.parseHashParams();
	if (params == null)
		Knoema.Helpers.getAccessToken('VKl1/FXXfkLEwQ', window.location, false, 'publish');
	else {
		if (params["access_token"] != undefined)
			access_token = params["access_token"];
	}
});
