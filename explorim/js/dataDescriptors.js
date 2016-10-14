var dataDescriptors = {
    old: {
        "Header": [{
            "DimensionId": "Time",
            "Members": ["2006", "2013"],
            "DimensionName": "Time",
            "DatasetId": "MRSCD2015",
            "Order": "0",
            "UiMode": "individualMembers"
        }],
        "Stub": [{
            "DimensionId": "indicator",
            "Members": ["1000070", "1001250", "1001290", "1012420", "1013390", "1033600", "1033780", "1033790", "1032530", "1014680", "1000100"],
            "DimensionName": "Indicator",
            "DatasetId": "MRSCD2015",
            "Order": "0"
        }],
        "Filter": [{
            "DimensionId": "region",
            "Members": ["1000010"],
            "DimensionName": "Region",
            "DatasetId": "MRSCD2015",
            "Order": "0",
            "isGeo": true
        }],
        "Frequencies": ["A"],
        "Dataset": "MRSCD2015",
        "Segments": null,
        "MeasureAggregations": null,
        "Calendar": 0,
        "RegionIdsRequired": true,
        "RegionDimensionId": "region"
    },

    economics0: {
        "Header": [
            {
                "DimensionId": "Time",
                "Members": [
                    "2013-2015"
                ],
                "DimensionName": "Time",
                "DatasetId": "ftqbdwb",
                "Order": "0",
                "UiMode": "range"
            }
        ],
        "Stub": [
            {
                "DimensionId": "indicator",
                "Members": [
                    "1000010",
                    "1002570",
                    "1000140",
                    "1001860",
                    "1001850",
                    "1001840",
                    "1001830"
                ],
                "DimensionName": "Indicator",
                "DatasetId": "ftqbdwb",
                "Order": "0"
            }
        ],
        "Filter": [
            {
                "DimensionId": "region",
                "Members": [
                    "1000030"
                ],
                "DimensionName": "Region",
                "DatasetId": "ftqbdwb",
                "Order": "0",
                "isGeo": true
            }
        ],
        "Frequencies": [
            "A"
        ],
        "Dataset": "ftqbdwb",
        "Segments": null,
        "MeasureAggregations": null,
        "Calendar": 0,
        "RegionIdsRequired": true,
        "RegionDimensionId": "region"
    },

    economics1: {
        "Header": [
            {
                "DimensionId": "Time",
                "Members": [
                    "2013-2015"
                ],
                "DimensionName": "Time",
                "UiMode": "range"
            }
        ],
        "Stub": [
            {
                "DimensionId": "indicator",
                "Members": [
                    "1003100",
                    "1003140",
                    "1003150",
                    "1003160",
                    "1003170",
                    "1003180",
                    "1003110",
                    "1003210",
                    "1003120",
                    "1003130",
                    "1003190",
                    "1003200"
                ],
                "DimensionName": "Indicator"
            }
        ],
        "Filter": [
            {
                "DimensionId": "region",
                "Members": [
                    "1000010"
                ],
                "DimensionName": "Region"
            }
        ],
        "Frequencies": [
            "A"
        ],
        "Calendar": 0,
        "Dataset": "ftqbdwb"
    },

    zoneDeVille0: {
        "Header": [
            {
                "DimensionId": "Time",
                "Members": [],
                "DimensionName": "Time",
                "UiMode": "range",
                "DateFields": [
                    {
                        "DateColumn": "0",
                        "DatasetId": "pjsnuj"
                    }
                ]
            }
        ],
        "Stub": [
            {
                "DimensionId": "event-type",
                "Members": [
                    "1000170",
                    {
                        "Key": -3696,
                        "Name": "Incidents de terrorisme",
                        "Formula": [
                            "1000090",
                            "1000100",
                            "+",
                            "1000110",
                            "+",
                            "1000130",
                            "+",
                            "1000150",
                            "+"
                        ]
                    }
                ],
                "DimensionName": "EVENT_TYPE"
            }
        ],
        "Filter": [
            {
                "DimensionId": "country",
                "Members": [
                    "1000790"
                ],
                "DimensionName": "COUNTRY"
            },
            {
                "DimensionId": "measure",
                "Members": [
                    {
                        "Key": -2037,
                        "Name": "Sum(FATALITIES)",
                        "Formula": [
                            "4373380",
                            "sum"
                        ],
                        "Transform": null
                    }
                ],
                "DimensionName": "Measure"
            }
        ],
        "Frequencies": [
            "D"
        ],
        "Calendar": 0,
        "Dataset": "pjsnuj"
    },

    zoneDeVille1: {
        "Header": [
            {
                "DimensionId": "Time",
                "Members": [
                    "2007-2014"
                ],
                "DimensionName": "Time",
                "UiMode": "range"
            }
        ],
        "Stub": [
            {
                "DimensionId": "indicator",
                "Members": [
                    "1000040",
                    "1000150",
                    "1000110",
                    "1000120"
                ],
                "DimensionName": "Indicator"
            }
        ],
        "Filter": [
            {
                "DimensionId": "country",
                "Members": [
                    "1001220"
                ],
                "DimensionName": "Country"
            }
        ],
        "Frequencies": [
            "A"
        ],
        "Calendar": 0,
        "Dataset": "gffcoef"
    },

    //This is fake data descriptor
    pluies: {
        "Header": [
            {
                "DimensionId": "Time",
                "Members": [],
                "DimensionName": "Time",
                "UiMode": "range",
                "DateFields": [
                    {
                        "DateColumn": "0",
                        "DatasetId": "pjsnuj"
                    }
                ]
            }
        ],
        "Stub": [
            {
                "DimensionId": "event-type",
                "Members": [
                    "1000170",
                    {
                        "Key": -3696,
                        "Name": "Incidents de terrorisme",
                        "Formula": [
                            "1000090",
                            "1000100",
                            "+",
                            "1000110",
                            "+",
                            "1000130",
                            "+",
                            "1000150",
                            "+"
                        ]
                    }
                ],
                "DimensionName": "EVENT_TYPE"
            }
        ],
        "Filter": [
            {
                "DimensionId": "country",
                "Members": [
                    "1000790"
                ],
                "DimensionName": "COUNTRY"
            },
            {
                "DimensionId": "measure",
                "Members": [
                    {
                        "Key": -2037,
                        "Name": "Sum(FATALITIES)",
                        "Formula": [
                            "4373380",
                            "sum"
                        ],
                        "Transform": null
                    }
                ],
                "DimensionName": "Measure"
            }
        ],
        "Frequencies": [
            "D"
        ],
        "Calendar": 0,
        "Dataset": "pjsnuj"
    },

    politics0: {
        "Header": [],
        "Stub": [],
        "Filter": [
            {
                "DimensionId": "données-démographiques",
                "Members": [
                    "1000000",
                    "1000010",
                    "1000020",
                    "1000030",
                    "1000040",
                    "1000050",
                    "1000060",
                    "1000070",
                    "1000080",
                    "1000090",
                    "1000100",
                    "1000110",
                    "1000120",
                    "1000130",
                    "1000140",
                    "1000150",
                    "1000160",
                    "1000170",
                    "1000180",
                    "1000190",
                    "1000200",
                    "1000210",
                    "1000220",
                    "1000230",
                    "1000240",
                    "1000250",
                    "1000260",
                    "1000270",
                    "1000280",
                    "1000290",
                    "1000300",
                    "1000310",
                    "1000320",
                    "1000330",
                    "1000340",
                    "1000350",
                    "1000360",
                    "1000370",
                    "1000380",
                    "1000390",
                    "1000400",
                    "1000410",
                    "1000420",
                    "1000430",
                    "1000440",
                    "1000450",
                    "1000460",
                    "1000470",
                    "1000480",
                    "1000490",
                    "1000500",
                    "1000510",
                    "1000520",
                    "1000530",
                    "1000540",
                    "1000550",
                    "1000560",
                    "1000570",
                    "1000580",
                    "1000590",
                    "1000600",
                    "1000610",
                    "1000620",
                    "1000630",
                    "1000640",
                    "1000650",
                    "1000660",
                    "1000670",
                    "1000680",
                    "1000690",
                    "1000700",
                    "1000710",
                    "1000720",
                    "1000730",
                    "1000740",
                    "1000750",
                    "1000760",
                    "1000770",
                    "1000780",
                    "1000790",
                    "1000800",
                    "1000810",
                    "1000820",
                    "1000830",
                    "1000840",
                    "1000850",
                    "1000860",
                    "1000870",
                    "1000880",
                    "1000890",
                    "1000900",
                    "1000910",
                    "1000920",
                    "1000930",
                    "1000940",
                    "1000950",
                    "1000960",
                    "1000970",
                    "1000980",
                    "1000990",
                    "1001000",
                    "1001010",
                    "1001020",
                    "1001030",
                    "1001040",
                    "1001050",
                    "1001060",
                    "1001070",
                    "1001080"
                ],
                "DimensionName": "Données démographiques",
                "DatasetId": "yqjhdag",
                "Order": "0"
            },
            {
                "DimensionId": "subregion",
                "Members": [
                    "1000000"
                ],
                "DimensionName": "SubRegion",
                "DatasetId": "yqjhdag",
                "Order": "1"
            },
            {
                "DimensionId": "region",
                "Members": [
                    "1000000",
                    "1000010",
                    "1000020",
                    "1000030",
                    "1000040",
                    "1000050",
                    "1000060",
                    "1000070",
                    "1000080",
                    "1000090",
                    "1000100",
                    "1000110"
                ],
                "DimensionName": "Region",
                "DatasetId": "yqjhdag",
                "Order": "2",
                "isGeo": true
            }
        ],
        "Frequencies": [
            "A"
        ],
        "Dataset": "yqjhdag",
        "Segments": null,
        "MeasureAggregations": null,
        "Calendar": 0,
        "RegionIdsRequired": true,
        "RegionDimensionId": "region"
    },
    politics1: {
        "Header": [
            {
                "DimensionId": "Time",
                "Members": [
                    "2013-2015"
                ],
                "DimensionName": "Time",
                "DatasetId": "ftqbdwb",
                "Order": "0",
                "UiMode": "range"
            }
        ],
        "Stub": [
            {
                "DimensionId": "indicator",
                "Members": [
                    "1002780",
                    "1002790",
                    "1002800",
                    "1002810",
                    "1002820",
                    "1002830"
                ],
                "DimensionName": "Indicator",
                "DatasetId": "ftqbdwb",
                "Order": "0"
            }
        ],
        "Filter": [
            {
                "DimensionId": "region",
                "Members": [
                    "1000010"
                ],
                "DimensionName": "Region",
                "DatasetId": "ftqbdwb",
                "Order": "0",
                "isGeo": true
            }
        ],
        "Frequencies": [
            "A"
        ],
        "Dataset": "ftqbdwb",
        "Segments": null,
        "MeasureAggregations": null,
        "Calendar": 0,
        "RegionIdsRequired": true,
        "RegionDimensionId": "region"
    }
};
