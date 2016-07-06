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

    var columns = [{
        columnTitle: 'Regional',
        formula: ''
    }];

    var UK = _.find(this.dataByRegion['UK'], function(d) {return d[4] === 'J'});

    var TOTAL = UK[5];

    var regions = _.map(this.regions, function(region) {
        //TODO Calculate new value for each column
        var indicator = _.find(this.dataByRegion[region.name], function(data) {
            return data[4] === 'O';//O - "Historical Regional Voter Turnout (%)"
        });
        if (typeof indicator === 'undefined') {
            region.values = [null];
            return region;
        }
        region.values = [indicator[5] / voterTurnoutRegional * TOTAL];
        return region;
    }.bind(this));

    $('#estimated-voter-turnout').empty().append($.tmpl('brexit-table.html', {
        columns: [
            {
                columnTitle: 'Regional'
            }
        ],
        regions: regions
    }))
};

App.prototype.run = function () {
    $('#voter-turnout-regional').on('change', $.proxy(this.calculateValues, this));
    this.calculateValues();
};