#!/usr/bin/env node
var express = require('express')
var route = express()
var babelify = require('express-babelify-middleware')
var dao = require('./dao')
var DateTime = require('dateutils').DateTime
var DateFormat = require('dateutils').DateFormat
var DateLocale = require('dateutils').DateLocale
var markupForDateRange = require('./markupForDateRange')
var headHtml = require('./head.html')
var filtersHtml = require('./filters.html')
var modalsHtml = require('./modals.html')
var scriptsHtml = require('./scripts.html')
var history = require('./history')
var format = require('./format')
var _ = require('lodash')
var historyHtml = require('./history.html')

route.use('/front.min.js', babelify(__dirname + '/front.js'))
route.use('/history.min.js', babelify(__dirname + '/history.front.js'))
route.get('/courts', dao.sendFreeCourts)
route.use(express.static(__dirname + '/../public'))
route.get('/weeklyAvailability', (req, res) => res.send(history.weeklyAvailability()))
route.get('/historia', (req, res) => {
    var historyData = history.availabilityByDate()
    var today = new DateTime()
    const days = 70
    var firstDate = today.minusDays(days)
    var dates = _.range(1, days).map(num=>firstDate.plusDays(num)).map(date=>({
        dateTime:      date,
        formattedDate: DateFormat.format(date, 'D j.n', DateLocale.FI)
    }))
    var times = _.range(60, 230, 5).map(format.formatIsoTime)
    const weeklyAvailability = history.weeklyAvailability()
    const rates = history.getRates()
    res.send(historyHtml({
        times:                   times,
        dates:                   dates,
        weeklyAvailability:      weeklyAvailability,
        rates:                   rates,
        findAvailabilityForDate: findAvailabilityForDate
    }))

    function findAvailabilityForDate(date, time) {
        return _.get(_.find(historyData, row=> row.dateTime === date.toISODateString() + 'T' + time), 'avaliable', 0)
    }
})

route.get('/', (req, res) => {
    var refresh = req.query.refresh === 'true'
    res.write(`<!DOCTYPE html>
        <html>`)
    res.write(headHtml())
    res.write(`<body><div class="container reservations detail">`)
    res.write(filtersHtml({
        places: [
            {id: 'meilahti', name: 'Meilahti'},
            {id: 'herttoniemi', name: 'Herttoniemi'},
            {id: 'kulosaari', name: 'Kulosaari'},
            {id: 'merihaka', name: 'Merihaka'},
            {id: 'taivallahti', name: 'Taivallahti'},
            {id: 'tapiola', name: 'Tapiola'},
            {id: 'tali', name: 'Tali'},
            {id: 'laajasalo', name: 'Laajasalo'},
            {id: 'hiekkaharju', name: 'Hiekkaharju'}
        ],
        types:  [
            {id: 'bubble', name: 'Kupla'},
            {id: 'outdoor', name: 'Ulko'},
            {id: 'indoor', name: 'Sisä'}
        ]
    }))
    res.write(`<section class="" id="schedule"><div class="reservationModal modal"></div>`)
    dao.freeCourts(new DateTime().toISODateString(), 3, refresh, (data) => {
        res.write(markupForDateRange(data, new DateTime()))
        res.write('</section></div>')
        res.write(modalsHtml())
        res.write(scriptsHtml({
            refresh:    refresh,
            serverDate: new DateTime().toISODateString()
        }))
        res.write('</body></html>')
        res.end()
    })
})

module.exports = route
