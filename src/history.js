#!/usr/bin/env node
const _ = require('lodash')
const historyData = require('../historyData')
const DateTime = require('dateutils').DateTime
const format = require('./format')
const rates = require('./rates')

module.exports = {
    availabilityByDate: availabilityByDate,
    weeklyAvailability: weeklyAvailability,
    getRates:           getRates
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
    const dateTimeStr = res.date + 'T' + res.time
    const dateTime = DateTime.fromIsoDateTime(dateTimeStr)
    return {
        dateTime:    dateTimeStr,
        time:        res.time, //'22:00',
        date:        res.date,// '2015-12-08',
        location:    res.location,//'taivallahti',
        type:        res.type,//'indoor',
        price:       res.price,//24,
        dateTimeObj: dateTime,
        weekDay:     dateTime.getDay()
    }
}

const times = _.range(60, 230, 5).map(format.formatIsoTime)
var timesObj = {}
times.forEach(time=>timesObj[time] = 0)

function weeklyAvailability() {
    return _.map(_.groupBy(historyData.map(mapData), 'weekDay'), (availableForWeekday) => {
        const availablePerTime = _.groupBy(availableForWeekday, 'time')
        return times.map(time=> time in availablePerTime ? availablePerTime[time].length : 0)
    })
}

function getRates() {
    return {
        locations: _.map(rates, (ratesPerTime, location) => location),
        prices:    _.map(rates, ratesPerTime => _.flatten(_.zip.apply(_, _.map(_.get(ratesPerTime, 'indoor', ratesPerTime)))))
    }
}
