#!/usr/bin/env node
const _ = require('lodash')
const historyData = require('../historyData')

module.exports = {
    availabilityByDate: availabilityByDate
}

function availabilityByDate() {
    return groupByDate(historyData)
}

function groupByDate(data) {
    return _.map(_.groupBy(data.map(mapData), 'dateTime'), (v, k) => ({
        dateTime:  k,
        avaliable: v.length
    })).sort((a, b) => a.dateTime > b.dateTime ? 1 : -1)
}

function mapData(res) {
    return {
        dateTime: res.date + 'T' + res.time,
        time:     res.time, //'22:00',
        date:     res.date,// '2015-12-08',
        location: res.location,//'taivallahti',
        type:     res.type,//'indoor',
        price:    res.price//24,
    }
}
