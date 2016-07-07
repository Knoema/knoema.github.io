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

    var voterTurnoutRegional = Number($('#voter-turnout-regional').text());

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

        region.columnData = _.map(columns, function(c) {
            if (_.isNull(c.columnId)) {
                return {
                    displayText: Number(regionalValue).toFixed(1)
                };
            } else {
                var column = _.find(data, function(d) {
                    return d[4] === c.columnId;
                });
                return {
                    displayText: Number((column[5] / J21) * regionalValue).toFixed(1)
                };
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

        var X = $('#simulation-inputs').find('#' + region.fields.regionid).text();

        if (X) {
            region.brexit = Math.floor(region.persons * P / 100 + ( I * region.values[region.values.length - 1]/100 ) * (Number(X)/100));
            //region.defaultFormData = X;
            //console.log(region.name, region.defaultFormData);
        }

        region.bremain = Math.floor(region.persons - region.brexit);

        if (isNaN(region.bremain)) {
            region.bremain = 0;
        }

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

    var columnData = _.map(columns, function(column, i) {
        if (_.isNull(column.columnId2)) {
            return {
                displayText: voterTurnoutRegional
            };
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
            return {
                displayText: Number((sum / E21) * 100).toFixed(1)
            };
        }
    });

    regions.push({
        name: 'National',
        level: 1,
        values: newValues,
        columnData: columnData
    });

    $('#estimated-voter-turnout').empty().append($.tmpl('brexit-table.html', {
        className: 'brexit-table2',
        columns: columns,
        regions: regions
    }));


    var regions2 = [].concat(regions);

    _.each(regions2, function(r) {
        var emptyString = r.name === 'UK' || r.name === 'England';

        r.values = [
            r.brexit,
            r.bremain
        ];
        r.columnData = [
            {
                displayText: emptyString ? '' : Globalize.format(r.brexit) + ' (' + Number(r.percentBrexit).toFixed(1) + '%)',
            },
            {
                displayText: emptyString ? '' : Globalize.format(r.bremain) + ' (' + Number(r.percentBremain).toFixed(1) + '%)'
            }
        ]
    });

    regions2 = regions2.slice(0, regions2.length - 1);

    var brexitSum = _.sumBy(regions2, function(region) {
        if (_.isUndefined(region.brexit)) {
            return 0;
        }
        return Number(region.brexit);
    });

    var bremainSum = _.sumBy(regions2, function(region) {
        if (_.isUndefined(region.bremain)) {
            return 0;
        }
        return Number(region.bremain);
    });

    var total = brexitSum + bremainSum;

    var brexitTotalPersent = Number(brexitSum * 100 / total).toFixed(1);
    var bremainTotalPersent = 100 - brexitTotalPersent;//bremainSum * 100 / total;

    $('#estimated-outcome').empty().append($.tmpl('brexit-table.html', {
        regions: regions2,
        columns: [
            {
                columnTitle: 'Brexit',
                columnSubTitle: Globalize.format(brexitSum) + ' (' + brexitTotalPersent + '%)',
                columnId: 'K'
            },
            {
                columnTitle: 'Bremain',
                columnSubTitle: Globalize.format(bremainSum) + ' (' + bremainTotalPersent + '%)',
                columnId: 'M'
            }
        ]
    }));

    this.loadMaps();

    if (!this.loaded) {
        this.loaded = true;
    } else {
        $('html, body').animate({ scrollTop: $('#estimated-outcome-header').offset().top }, 500);
    }
};

App.prototype.loadMaps = function () {
    var self = this;
    var mapOptions = {
        url: 'https://knoema.com/page/map/ukRegions-2013-04-18',
        simpleColorScale: true,
        legendIntervals: [null, "93d04f", null, "ffc001", null, "fe0000", null],
        legendScale: "equalRegion",
        transform: {
            "map": "ukRegions",
            "name": "United Kingdom Regions",
            "file": "ukRegions-2013-04-18",
            "scale": "1.2",
            "x": "-50",
            "y": "-50"
        },
        timeSeries: [
            {
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
                "id": "Value",
                "unit": "",
                "scale": 1,
                "time": "2016"
            }
        ],
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

    for (var key in mapOptions.timeSeries[0].data) {
        var entry = _.find(self.regionsForMap, function(d) {return d.fields.regionid === key});
        mapOptions.timeSeries[0].data[key] = String(entry.percentBrexit);
    }

    var mapOptions2 = _.clone(mapOptions);

    mapOptions2.timeSeries = [{
        "data": {},
        "id": "Value",
        "unit": "",
        "scale": 1,
        "time": "2016"
    }];

    for (var key in mapOptions.timeSeries[0].data) {
        var entry = _.find(self.regionsForMap, function(d) {return d.fields.regionid === key});
        mapOptions2.timeSeries[0].data[key] = String(entry.percentBremain);
    }
    new jQuery.Mapp($('#brexit-percent-map'), mapOptions);
    new jQuery.Mapp($('#bremain-percent-map'), mapOptions2);
};

App.prototype.run = function () {
    var self = this;
    $('#simulation-inputs').append($.tmpl('simulation-inputs.html', {
        formSections: [
            [
                {
                    id: "UKC",
                    name: "North-East",
                    data: 8
                },
                {
                    id: "UKD",
                    name: "North-West",
                    data: 7
                },
                {
                    id: "UKE",
                    name: "Yorkshire and the Humber",
                    data: 8
                }
            ],
            [
                {
                    id: "UKF",
                    name: "East Midlands",
                    data: 7
                },
                {
                    id: "UKG",
                    name: "West Midlands",
                    data: 8
                },
                {
                    id: "UKH",
                    name: "East",
                    data: 7
                }
            ],
            [
                {
                    id: "UKI",
                    name: "London",
                    data: 3
                },
                {
                    id: "UKJ",
                    name: "South East",
                    data: 4
                },
                {
                    id: "UKK",
                    name: "South West",
                    data: 4
                }
            ],
            [
                {
                    id: "UKL",
                    name: "Wales",
                    data: 7
                },
                {
                    id: "UKM",
                    name: "Northern Ireland",
                    data: 5
                },
                {
                    id: "UKN",
                    name: "Scotland",
                    data: 4
                }
            ]
        ]
    }));

    $('.control').on('click', function() {
        var $control = $(this);
        var $input = $(this).parent().parent().find('.field');
        var newValue = null;
        var oldValue = $input.text();

        var supplement = $control.hasClass('up') ? 0.1 : -0.1;

        if (oldValue == 0 && $control.hasClass('down')) {
            return;
        }

        newValue = (new Decimal(Number(oldValue))).plus(new Decimal(supplement)).toString();

        $input.text(newValue);
    });

    $('#js-re-estimate').on('click', $.proxy(this.calculateValues, this));

    $('#scroll-to-inputs').on('click', function() {
        $('html, body').animate({ scrollTop: $('#simulation-inputs-header').offset().top }, 500);
    });

    $('#voter-turnout-regional').on('change', $.proxy(this.calculateValues, this));

    this.calculateValues();
};