const Chartist = require('chartist')
const _ = require('lodash')
const format = require('./format')

new Chartist.Line('.chartData', {
    labels: _.range(60, 230, 5).map(format.formatIsoTime),
    series: window.chartData
})
new Chartist.Line('.rates', {
    labels: _.flatten(_.range(1, 7).map(() =>_.range(60, 230, 5).map(format.formatIsoTime))),
    series: window.rates.prices.map(s=>s.map(v=>v == 0 ? null : v))
}, {
    showPoint:  false,
    lineSmooth: false
})
