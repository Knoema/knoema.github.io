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
        var X = _.find(data, function(data) {
            return data[4] === 'X';
        });

        if (X) {
            region.brexit = region.persons * P / 100 + ( I * region.values[region.values.length - 1]/100 ) * (X[5]/100);
        }

        region.bremain = region.persons - region.brexit;

        return region;

    }.bind(this));

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
        level: 0,
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

    regions2 = regions2.slice(0, regions2.length - 1)

    $('#estimated-outcome').empty().append($.tmpl('brexit-table.html', {
        columns: columns2,
        regions: regions2
    }));

};

App.prototype.run = function () {
    $('#voter-turnout-regional').on('change', $.proxy(this.calculateValues, this));
    this.calculateValues();
};