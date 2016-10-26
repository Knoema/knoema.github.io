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
        "Header": [],
        "Stub": [],
        "Filter": [
            {
                "DimensionId": "measure",
                "Members": [
                    {
                        "Key": -945,
                        "Name": "Sum(Count)",
                        "Formula": [
                            "5900530",
                            "sum"
                        ]
                    }
                ],
                "DimensionName": "Measure",
                "DatasetId": "hfydzlc",
                "Order": "0"
            },
            {
                "DimensionId": "commune",
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
                    "1001080",
                    "1001090",
                    "1001100",
                    "1001110",
                    "1001120",
                    "1001130",
                    "1001140",
                    "1001150",
                    "1001160",
                    "1001170",
                    "1001180",
                    "1001190",
                    "1001200",
                    "1001210",
                    "1001220",
                    "1001230",
                    "1001240",
                    "1001250",
                    "1001260",
                    "1001270",
                    "1001280",
                    "1001290",
                    "1001300",
                    "1001310",
                    "1001320",
                    "1001330",
                    "1001340",
                    "1001350",
                    "1001360",
                    "1001370",
                    "1001380",
                    "1001390",
                    "1001400",
                    "1001410",
                    "1001420",
                    "1001430",
                    "1001440",
                    "1001450",
                    "1001460",
                    "1001470",
                    "1001480",
                    "1001490",
                    "1001500",
                    "1001510",
                    "1001520",
                    "1001530",
                    "1001540",
                    "1001550",
                    "1001560",
                    "1001570",
                    "1001580",
                    "1001590",
                    "1001600",
                    "1001610",
                    "1001620",
                    "1001630",
                    "1001640",
                    "1001650",
                    "1001660",
                    "1001670",
                    "1001680",
                    "1001690",
                    "1001700",
                    "1001710",
                    "1001720",
                    "1001730",
                    "1001740",
                    "1001750",
                    "1001760",
                    "1001770",
                    "1001780",
                    "1001790",
                    "1001800",
                    "1001810",
                    "1001820",
                    "1001830",
                    "1001840",
                    "1001850",
                    "1001860",
                    "1001870",
                    "1001880",
                    "1001890",
                    "1001900",
                    "1001910"
                ],
                "DimensionName": "Commune",
                "DatasetId": "hfydzlc",
                "Order": "1",
                "isGeo": true
            },
            {
                "DimensionId": "region",
                "Members": [
                    "1000000"
                ],
                "DimensionName": "Region",
                "DatasetId": "hfydzlc",
                "Order": "2"
            },
            {
                "DimensionId": "mougataa",
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
                    "1000510"
                ],
                "DimensionName": "Mougataa",
                "DatasetId": "hfydzlc",
                "Order": "3"
            }
        ],
        "Frequencies": [],
        "Dataset": "hfydzlc",
        "Segments": null,
        "MeasureAggregations": null,
        "Calendar": 0,
        "RegionIdsRequired": true,
        "RegionDimensionId": "commune"
    }
};
