//for dataset http://electricitypowerplants.knoema.com/wxafqvc

getDataByType = function(type) {
    var url;
    var name;
    var className;

    switch(type) {

        case "Gas":
        case "Gas turbines":
        case "Gas-fired steam turbine":
        case "Gas-fired steam turbine and Simple cycle gas turbine":
        case "Natural gas":
        case "Methane  (Thermal)":
        case "Natural gas (Thermal)":
        case "Landfill Gas Power":
        case "Liquefied natural gas (Thermal)":
        case "Simple cycle gas turbine":
        case "Oil and gas fired thermal":
        case "Light crude oil/gas":
        case "Natural gas,Heavy fuel oil":
            name = "Gas";
            className = "gas";
            url = "marker_gas.png";
            break;

        case "Geothermal":
        case "Biomass":
        case "Bagasse (Thermal)":
        case "Geothermal power":
        case "Steam (Thermal)":
        case "Biomass(Thermal)":
        case "Biogas  (Thermal)":
        case "Thermal":
            name = "Geothermal";
            className = "geothermal";
            url = "marker_geothermal.png";
            break;

        case "Biodiesel":
        case "Biodiesel (Thermal)":
        case "Biodiesel, Fuel oil, Crude oil (Thermal)":
            name = "Biodiesel";
            className = "biodiesel";
            url="marker_biodiesel.png";
            break;

        case "Diesel":
        case "Diesel (Thermal)":
        case "Diesel fuel":
        case "Diesel fuel (Thermal)":
            name = "Diesel";
            className = "diesel";
            url="marker_diesel.png";
            break;

        case "Solar":
        case "Solar Radiation":
        case "Solar Radiation (Thermal)":
        case "Solar (photovoltaic)":
        case "Concentrated Solar Power":
        case "Solar & Natural gas":
        case "Solar power & Diesel fuel":
            name = "Solar";
            className = "solar";
            url="marker_solar.png";
            break;

        case "Wind":
        case "Wind Power":
            name = "Wind";
            className = "wind";
            url="marker_wind.png";
            break;

        case "Nuclear":
            name = "Nuclear";
            className = "nuclear";
            url="marker_nuclear.png";
            break;

        case "Hydro":
        case "Hydroelectric":
        case "Hydroelectric (Dam)":
        case "Hydroelectric (Reservoir)":
        case "Hydroelectric (Pumped storage)":
        case "Hydroelectric (Run-of-the-river)":
            name = "Hydro";
            className = "hydro";
            url="marker_hydro.png";
            break;

        /*
        case "Peat":
        case "Peat (Thermal)":
        case "Peat  (Thermal)":
            name = "Peat";
            className = "peat";
            url="marker_peat.png";
            break;
*/

        case "Coal":
        case "Coal fired":
        case "Coal (Thermal)":
        case "Coal (Circulating Fluidized Bed technology)":
            name = "Coal";
            className = "coal";
            url="marker_coal.png";
            break;

        case "Fuel Oil":
        case "Heavy fuel oil  (Thermal)":
        case "Heavy fuel oil (Thermal)":
        case "Fuel oil & Coal (Thermal)":
        case "Fuel oil & Coal (Thermal)":
        case "Fuel Oil (Thermal)":
        case "Fuel Oil, Diesel Oil":
        case "Heavy fuel oil or Light fuel oil or or Natural gas (Thermal)":
            name = "Fuel Oil";
            className = "fueloil";
            url="marker_fueloil.png";
            break;

        case "Combined":
        case "Combined Cycle Gas Turbines":
        case "Combined cycle gas turbine":
            name = "Combined";
            className = "combined";
            url="marker_combined.png";
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