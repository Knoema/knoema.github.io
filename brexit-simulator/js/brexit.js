function App() {
    this.regions = null;
    var self = this;
    this.loadStuff($.proxy(this.run, this));
};

App.prototype.loadStuff = function (callback) {
    var self = this;
    function compileTemplate(templateSrc) {
        $.template(this.url.replace('tmpl/', ''), templateSrc);
    }
    var templates = [
        $.get('tmpl/brexit-table.html', compileTemplate),
        $.get('tmpl/simulation-inputs.html', compileTemplate),

        $.ajax({
            method: 'POST',
            url: '//knoema.com/api/1.0/data/details',
            data: dataDescriptor,
            success: function(response) {
                self.dataByRegion = _.groupBy(_.chunk(response.data, response.columns.length), 0);
            }
        }),
        $.ajax({
            method: 'GET',
            url: '//knoema.com/api/1.0/meta/dataset/fnvzpwg/dimension/region',
            success: function(response) {
                self.regions = response.items;
            }
        })
    ];
    $.when.apply(null, templates).done(function onTemplatesLoaded() {
        if ($.isFunction(callback)) {
            callback();
        }
    });
};

App.prototype.calculateValues = function () {
    var self = this;

    var voterTurnoutRegional = $('#voter-turnout-regional').val();

    var columns = [
        {
            columnTitle: '18-24',
            columnId: 'K',
            columnId2: 'E'
        },
        {
            columnTitle: '25-49',
            columnId: 'L',
            columnId2: 'F'
        },
        {
            columnTitle: '50-64',
            columnId: 'M',
            columnId2: 'G'
        },
        {
            columnTitle: '65+',
            columnId: 'N',
            columnId2: 'H'
        },
        {
            columnTitle: 'Regional',
            columnId: null,
            columnId2: null
        }
    ];

    var UK = _.find(this.dataByRegion['UK'], function(d) {return d[4] === 'J'});
    var J21 = UK[5];

    var regions = _.map(this.regions, function(region) {

        var data = this.dataByRegion[region.name];

        var indicator = _.find(data, function(data) {
            //O - "Historical Regional Voter Turnout (%)"
            return data[4] === 'O';
        });
        if (typeof indicator === 'undefined') {
            region.values = Array(columns.length);
            return region;
        }
        var W = indicator[5];

        var regionalValue = (W / J21) * Number(voterTurnoutRegional);

        region.values = _.map(columns, function(c) {
            if (_.isNull(c.columnId)) {
                return regionalValue;
            } else {
                var column = _.find(data, function(d) {
                    return d[4] === c.columnId;
                });
                return (column[5] / J21) * regionalValue;
            }
        });

        var calc = 0;
        _.each(columns, function(c, i) {
            if (c.columnTitle != 'Regional') {
                if (_.isNull(c.columnId2)) {
                    return 0;
                } else {
                    var column = _.find(data, function(d) {
                        return d[4] === c.columnId2;
                    });
                    calc += region.values[i] * column[5] / 100;
                }
            }
        });
        region.persons = calc;

        var brexit = 0;

        var P = _.find(data, function(data) {
            return data[4] === 'P';
        })[5];

        var I = _.find(data, function(data) {
            return data[4] === 'I';
        })[5];

        //This value should be taken from input fields
        //var X = _.find(data, function(data) {
        //     return data[4] === 'X';
        // });
        var X = $('#' + region.name).text();
        if (X) {
            region.brexit = region.persons * P / 100 + ( I * region.values[region.values.length - 1]/100 ) * (Number(X)/100);
            //region.defaultFormData = X;
            //console.log(region.name, region.defaultFormData);
        }

        region.bremain = region.persons - region.brexit;

        region.percentBrexit = 100 * region.brexit / region.persons;
        region.percentBremain = 100 * region.bremain / region.persons;

        return region;

    }.bind(this));

    self.regionsForMap = regions;

    var newValues = _.map(columns, function(column, i) {
        if (_.isNull(column.columnId2)) {
            return voterTurnoutRegional;
        } else {
            var sum = 0;
            var E21 = null;
            _.each(regions, function(region, j) {
                var ddd = _.find(self.dataByRegion[region.name], function(d) {return d[4] === column.columnId2});
                if (region.name === 'UK') {
                    E21 = ddd[5];
                } else {
                    if (region.name !== 'England') {
                        sum += (region.values[i]/100) * ddd[5];
                    }
                }
            });
            return (sum / E21) * 100;
        }
    });

    regions.push({
        name: 'National',
        level: 1,
        values: newValues
    });

    $('#estimated-voter-turnout').empty().append($.tmpl('brexit-table.html', {
        columns: columns,
        regions: regions
    }));

    var columns2 = [
        {
            columnTitle: 'Brexit',
            columnId: 'K'
        },
        {
            columnTitle: 'Bremain',
            columnId: 'M'
        },
    ];
    var regions2 = [].concat(regions);

    _.each(regions2, function(r) {
        r.values = [
            r.brexit,
            r.bremain
        ];
    });

    regions2 = regions2.slice(0, regions2.length - 1);

    $('#estimated-outcome').empty().append($.tmpl('brexit-table.html', {
        columns: columns2,
        regions: regions2
    }));

    this.loadMaps();

};

App.prototype.loadMaps = function () {
    var self = this;
    var timeSeries = [
        {
            "id": "Value",
            "data": {
                "UKC": "2624621.00",
                "UKD": "7173835.00",
                "UKE": "5390576.00",
                "UKF": "4677038.00",
                "UKG": "5751000.00",
                "UKH": "6076451.00",
                "UKI": "8673713.00",
                "UKJ": "8947913.00",
                "UKK": "5471180.00",
                "UKL": "3099086.00",
                "UKM": "5373000.00",
                "UKN": "1851621.00"
            },
            "unit": "",
            "scale": 1,
            "time": "2016"
        }
    ];
    var mapOptions = {
        url: 'https://knoema.com/page/map/ukRegions-2013-04-18',
        simpleColorScale: true,
        legendIntervals: [null, "93d04f", null, "ffc001", null, "fe0000", null],
        legendScale: "equalRegion",
        transform: {
            "map": "ukRegions",
            "name": "United Kingdom Regions",
            "file": "ukRegions-2013-04-18",
            "scale": "1.5",
            "x": "-50",
            "y": "-120"
        },
        timeSeries: timeSeries,
        regionCodeToName: {
            "UK": "UK",
            "UKC": "North-East",
            "UKD": "North-West",
            "UKE": "Yorkshire and the Humber",
            "UKF": "East Midlands",
            "UKG": "West Midlands",
            "UKH": "East",
            "UKI": "London",
            "UKJ": "South East",
            "UKK": "South West",
            "UKL": "Wales",
            "UKM": "Northern Ireland",
            "UKN": "Scotland"
        }
    };

    var mapOptions2 = _.clone(mapOptions);

    for (var key in mapOptions.timeSeries[0].data) {
        var entry = _.find(self.regionsForMap, function(d) {return d.fields.regionid === key});
        mapOptions.timeSeries[0].data[key] = String(entry.percentBrexit);
    }
    $('#brexit-percent-map').mapp(mapOptions);

    for (var key in mapOptions.timeSeries[0].data) {
        var entry = _.find(self.regionsForMap, function(d) {return d.fields.regionid === key});
        mapOptions2.timeSeries[0].data[key] = String(entry.percentBremain);
    }
    $('#bremain-percent-map').mapp(mapOptions2);
};

App.prototype.run = function () {
    $('#simulation-inputs').append($.tmpl('simulation-inputs.html', {
        formSections: [
            [
                {
                    name: "North-East",
                    data: 8
                },
                {
                    name: "North-West",
                    data: 7
                },
                {
                    name: "Yorkshire and the Humber",
                    data: 8
                }
            ],
            [
                {
                    name: "East Midlands",
                    data: 7
                },
                {
                    name: "West Midlands",
                    data: 8
                },
                {
                    name: "East",
                    data: 7
                }
            ],
            [
                {
                    name: "London",
                    data: 3
                },
                {
                    name: "South East",
                    data: 4
                },
                {
                    name: "South West",
                    data: 4
                }
            ],
            [
                {
                    name: "Wales",
                    data: 7
                },
                {
                    name: "Northern Ireland",
                    data: 5
                },
                {
                    name: "Scotland",
                    data: 4
                }
            ]
        ]
    }));

    $('#voter-turnout-regional').on('change', $.proxy(this.calculateValues, this));
    this.calculateValues();
};