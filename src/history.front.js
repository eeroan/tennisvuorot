const Chartist = require('chartist')
const _ = require('lodash')
const format = require('./format')

var data = {
    // A labels array that can contain any sort of values
    labels: _.range(60, 230, 5).map(format.formatIsoTime),
    // Our series array that contains series objects or in this case series data arrays
    series: window.chartData
};

// Create a new line chart object where as first parameter we pass in a selector
// that is resolving to our chart container element. The Second parameter
// is the actual data object.
new Chartist.Line('.ct-chart', data);
