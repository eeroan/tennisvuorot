#!/usr/bin/env node
var express = require('express')
var route = express()
var babelify = require('express-babelify-middleware')
var dao = require('./dao')
var DateTime = require('dateutils').DateTime
var markupForDateRange = require('./markupForDateRange')
var headHtml = require('./head.html')
var filtersHtml = require('./filters.html')
var modalsHtml = require('./modals.html')
var scriptsHtml = require('./scripts.html')
route.use('/front.min.js', babelify(__dirname + '/front.js'))
route.get('/courts', dao.sendFreeCourts)
route.use(express.static(__dirname + '/../public'))
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
    res.write(`<section class="" id="schedule">`)
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
