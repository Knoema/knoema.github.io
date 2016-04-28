timeSeriesDataDescriptor =
{
    "Header": [
        {
            "DimensionId": "Time",
            "Members": [
                //"2006-2016"
                //data exist for "Pneumonia": 2012-2013
                "2012-2014"
            ],
            "DimensionName": "Time",
            "DatasetId": "TANSAT2016",
            "Order": "0",
            "UiMode": "range"
        }
    ],
    "Stub": [
        {
            "DimensionId": "region",
            "Members": [],
            "DimensionName": "Region",
            "DatasetId": "TANSAT2016",
            "Order": "0",
            "isGeo": true
        }
    ],
    "Filter": [
        {
            "DimensionId": "indicator",
            "Members": [
                "1011440"
            ],
            "DimensionName": "Indicator",
            "DatasetId": "TANSAT2016",
            "Order": "0"
        }
    ],
    "Frequencies": [
        "A"
    ],
    "Dataset": "TANSAT2016",
    "Segments": null,
    "MeasureAggregations": null,
    "RegionIdsRequired": true,
    "RegionDimensionId": "region"
};