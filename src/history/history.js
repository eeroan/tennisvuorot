#!/usr/bin/env node
const _ = require('lodash')
const historyData = require('../../generated/historyData')
const DateTime = require('dateutils').DateTime
const DateFormat = require('dateutils').DateFormat
const DateLocale = require('dateutils').DateLocale
const format = require('../format')
const rates = require('../../generated/rates')
const historyHtml = require('./history.html')
const headHtml = require('../head.html')
const dao = require('../dao/dao')
const locationsObj = require('../../generated/locations')
const times = _.range(60, 230, 5).map(format.formatIsoTime)

module.exports = {
    historyResponse
}

async function historyResponse(req, res) {
    const location = req.params.location
    if (req.query.refresh) {
        const data = await dao.getHistoryData()
        res.send(historyMarkup(location, data))
    } else {
        res.send(historyMarkup(location, historyData))
    }
}

function historyMarkup(location, historyData) {
    const historyDataGrouped = groupByDate(historyData)
    const sortedDates = historyDataGrouped.map(x => x.dateTime)
    const firstDate = DateTime.fromIsoDateTime(_.first(sortedDates))
    const lastDate = DateTime.fromIsoDateTime(_.last(sortedDates))
    const days = firstDate.distanceInDays(lastDate)
    const dates = _.range(0, days + 1).map(num => firstDate.plusDays(num)).map(date => ({
        dateTime: date,
        formattedDate: DateFormat.format(date, 'D j.n', DateLocale.FI)
    }))
    const weeklyAvailability = getWeeklyAvailability(historyData, location)
    const locations = _.map(rates, (ratesPerTime, location) => location)
    const prices = _.map(location ? _.pick(rates, location) : rates, ratesPerTime => _.flatten(_.zip.apply(_, _.map(_.get(ratesPerTime, 'indoor', ratesPerTime)))))
    const availabilities = historyDataGrouped.map(h => h.available)
    const maxAvailability = _.max(location ?
        availabilities.map(l => _.get(l.find(x => x.location === location), 'available', 0)) :
        availabilities.map(locs => _.sum(locs.map(loc => loc.available))))
    return headHtml({
        locations: locationsObj,
        _
    }) + historyHtml({
        times,
        dates,
        weeklyAvailability,
        maxAvailability,
        allLocations: locations,
        rates: {
            locations: location ? [location] : locations,
            prices
        },
        location,
        _,
        findAvailabilityForDate
    })

    function findAvailabilityForDate(date, time) {
        return _.get(_.find(historyDataGrouped, row => row.dateTime === date.toISODateString() + 'T' + time), 'available', [])
    }
}

function groupByDate(data) {
    return _.map(_.groupBy(data.map(mapData), 'dateTime'), (v, k) => ({
        dateTime: k,
        available: _.map(_.groupBy(v, 'location'), (v, k) => ({location: k, available: v.length}))
    })).sort((a, b) => a.dateTime > b.dateTime ? 1 : -1)
}

const timesObj = {}
times.forEach(time => timesObj[time] = 0)

function getWeeklyAvailability(historyData, location) {
    return _.map(_.groupBy(historyData.map(mapData).filter(res => location ? res.location === location : true), 'weekDay'), availableForWeekday => {
        const dates = Object.keys(_.groupBy(availableForWeekday, 'date'))
        const availablePerTime = _.groupBy(availableForWeekday, 'time')
        return times.map(time => time in availablePerTime ? availablePerTime[time].length / dates.length : 0)
    })
}

function mapData({date, time, location, type, price}) {
    const dateTimeStr = date + 'T' + time
    const dateTime = DateTime.fromIsoDateTime(dateTimeStr)
    return {
        dateTime: dateTimeStr,
        time,
        date,
        location,
        type,
        price,
        dateTimeObj: dateTime,
        weekDay: dateTime.getDay()
    }
}
