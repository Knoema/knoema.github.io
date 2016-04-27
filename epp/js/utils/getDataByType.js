//for dataset http://electricitypowerplants.knoema.com/lpxhpcb

getDataByType = function(type) {
    var url;
    var name;
    var className;

    switch(type) {

        case "Coal":
            name = "Coal";
            className = "coal";
            url="marker_coal.png";
            break;

        case "Fuel Oil":
            name = "Fuel Oil";
            className = "fueloil";
            url="marker_fueloil.png";
            break;

        case "Gas":
            name = "Gas";
            className = "gas";
            url = "marker_gas.png";
            break;

        case "Hydro":
            name = "Hydro";
            className = "hydro";
            url="marker_hydro.png";
            break;

        case "Nuclear":
            name = "Nuclear";
            className = "nuclear";
            url="marker_nuclear.png";
            break;

        case "Solar":
            name = "Solar";
            className = "solar";
            url="marker_solar.png";
            break;

        case "Wind":
            name = "Wind";
            className = "wind";
            url="marker_wind.png";
            break;

        case "Geothermal":
            name = "Geothermal";
            className = "geothermal";
            url = "marker_geothermal.png";
            break;

        default:
        case "Not Defined":
        case "Under Construction":
            name = "Other";
            className = "other";
            url = "marker_other.png";
            break;
    }

    return {
        name: name,
        className: className,
        iconUrl: 'img/markers/' + url
    }

};