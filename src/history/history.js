#!/usr/bin/env node
const _ = require('lodash')
const historyData = require('./historyData')
const DateTime = require('dateutils').DateTime
var DateFormat = require('dateutils').DateFormat
var DateLocale = require('dateutils').DateLocale
const format = require('../format')
const rates = require('../rates')
var historyHtml = require('./history.html')
const times = _.range(60, 230, 5).map(format.formatIsoTime)

module.exports = {
    historyResponse:    historyResponse,
    availabilityByDate: availabilityByDate,
    weeklyAvailability: getWeeklyAvailability,
    getRates:           getRates
}

function historyResponse(req, res) {
    const location = req.query.location
    var historyData = availabilityByDate()
    var today = new DateTime()
    const days = 70
    var firstDate = today.minusDays(days)
    var dates = _.range(1, days).map(num=>firstDate.plusDays(num)).map(date=>({
        dateTime:      date,
        formattedDate: DateFormat.format(date, 'D j.n', DateLocale.FI)
    }))
    const weeklyAvailability = getWeeklyAvailability()
    const rates = getRates()
    res.send(historyHtml({
        times:                   times,
        dates:                   dates,
        weeklyAvailability:      weeklyAvailability,
        rates:                   rates,
        location:                location,
        _:                       _,
        findAvailabilityForDate: findAvailabilityForDate
    }))

    function findAvailabilityForDate(date, time) {
        return _.get(_.find(historyData, row=> row.dateTime === date.toISODateString() + 'T' + time), 'available', [])
    }
}

function availabilityByDate() {
    return groupByDate(historyData)
}

function groupByDate(data) {
    return _.map(_.groupBy(data.map(mapData), 'dateTime'), (v, k) => ({
        dateTime:  k,
        available: _.map(_.groupBy(v, 'location'), (v, k)=>({location: k, available: v.length}))
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

var timesObj = {}
times.forEach(time=>timesObj[time] = 0)

function getWeeklyAvailability() {
    return _.map(_.groupBy(historyData.map(mapData), 'weekDay'), (availableForWeekday) => {
        const dates = Object.keys(_.groupBy(availableForWeekday, 'date'))
        const availablePerTime = _.groupBy(availableForWeekday, 'time')
        return times.map(time=> time in availablePerTime ? availablePerTime[time].length / dates.length : 0)
    })
}

function getRates() {
    return {
        locations: _.map(rates, (ratesPerTime, location) => location),
        prices:    _.map(rates, ratesPerTime => _.flatten(_.zip.apply(_, _.map(_.get(ratesPerTime, 'indoor', ratesPerTime)))))
    }
}
