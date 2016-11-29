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
                "UiMode": "range"
            }
        ],
        "Stub": [
            {
                "DimensionId": "indicator",
                "Members": [
                    {
                        "Name": "Population totale (nombre)",
                        "Key": "-1000120",
                        "Formula": [
                            "1000120"
                        ]
                    },
                    {
                        "Name": "Ménages avec Internet (nombre)",
                        "Key": "-1002570",
                        "Formula": [
                            "1002570"
                        ]
                    }
                ],
                "DimensionName": "Indicator"
            }
        ],
        "Filter": [
            {
                "DimensionId": "region",
                "Members": [
                    "1000020"
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

    zone0: {
        "Header": [
            {
                "DimensionId": "Time",
                "Members": [],
                "DimensionName": "Time",
                "UiMode": "allData"
            }
        ],
        "Stub": [
            {
                "DimensionId": "indicator",
                "Members": [
                    {
                        "Name": "Zone écologique: pluviale",
                        "Key": "-1000100",
                        "Formula": [
                            "1000100"
                        ]
                    },
                    {
                        "Name": "Zone écologique: recessional",
                        "Key": "-1000110",
                        "Formula": [
                            "1000110"
                        ]
                    },
                    {
                        "Name": "Zone écologique: oasis",
                        "Key": "-1000120",
                        "Formula": [
                            "1000120"
                        ]
                    },
                    {
                        "Name": "Zone écologique: irrigué",
                        "Key": "-1000130",
                        "Formula": [
                            "1000130"
                        ]
                    },
                    {
                        "Name": "Potentiel agricole total (1.000 hectares)",
                        "Key": "-1000140",
                        "Formula": [
                            "1000140"
                        ]
                    }
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
            "A",
            "D"
        ],
        "Calendar": 0,
        "Dataset": "kymrtcc"
    },

    politics0: {
        "Header": [],
        "Stub": [],
        "Filter": [
            {
                "DimensionId": "region",
                "Members": [
                    "1000000"
                ],
                "DimensionName": "Region",
                "DatasetId": "jflytqc",
                "Order": "0",
                "isGeo": true
            }
        ],
        "Frequencies": [],
        "Dataset": "jflytqc",
        "Segments": null,
        "MeasureAggregations": null,
        "Calendar": 0,
        "RegionIdsRequired": true,
        "RegionDimensionId": "region"
    },

    politics1:   {
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
    },

    fonctionnaires: {
        hyaavp: {
            "Header": [],
            "Stub": [],
            "Filter": [
                {
                    "DimensionId": "mougataa",
                    "Members": [
                        "1000490"
                    ],
                    "DimensionName": "Mougataa",
                    "DatasetId": "hyaavp",
                    "Order": "0"
                }
            ],
            "Frequencies": [],
            "Dataset": "hyaavp",
            "Segments": null,
            "MeasureAggregations": null,
            "Calendar": 0,
            "RegionIdsRequired": true,
            "RegionDimensionId": "region"
        },
        uvvmucg: {
            "Header": [],
            "Stub": [],
            "Filter": [
                {
                    "DimensionId": "region",
                    "Members": [
                        "1000000"
                    ],
                    "DatasetId": "uvvmucg",
                    "Order": "0"
                }
            ],
            "Frequencies": [],
            "Dataset": "uvvmucg",
            "Segments": null,
            "MeasureAggregations": null,
            "Calendar": 0,
            "RegionIdsRequired": true,
            "RegionDimensionId": "mougataa"
        }
    }
};
