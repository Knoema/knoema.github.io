function App() {
    this.regions = null;
    var self = this;
    // $.ajax({
    //     method: 'POST',
    //     url: '//knoema.com/api/1.0/data/details',
    //     data: dataDescriptor,
    //     success: function(response) {
    //         self.dataByRegion = _.groupBy(_.chunk(response.data, response.columns.length), 0);
    //     }
    // });
    // $.ajax({
    //     method: 'GET',
    //     url: '//knoema.com/api/1.0/meta/dataset/fnvzpwg/dimension/region',
    //     success: function(response) {
    //         self.regions = response.items;
    //     }
    // });
    this.loadTemplates($.proxy(this.run, this));
};

App.prototype.loadTemplates = function (callback) {
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
            columnId: 'K'
        },
        {
            columnTitle: '25-49',
            columnId: 'L'
        },
        {
            columnTitle: '50-64',
            columnId: 'M'
        },
        {
            columnTitle: '65+',
            columnId: 'N'
        },
        {
            columnTitle: 'Regional',
            columnId: null
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

        var ddd = _.map(columns, function(c) {
            if (_.isNull(c.columnId)) {
                return regionalValue;
            } else {
                var column = _.find(data, function(d) {
                    return d[4] === c.columnId;
                });
                return (column[5] / J21) * regionalValue;
            }
        });

        //TODO _.map columns
        region.values = ddd;

        return region;

    }.bind(this));

    $('#estimated-voter-turnout').empty().append($.tmpl('brexit-table.html', {
        columns: columns,
        regions: regions
    }))
};

App.prototype.run = function () {
    $('#voter-turnout-regional').on('change', $.proxy(this.calculateValues, this));
    this.calculateValues();
};