#!/usr/bin/env node
var express = require('express')
var route = express()
var babelify = require('express-babelify-middleware')
var dao = require('./dao')
var DateTime = require('dateutils').DateTime
var markupForDateRange = require('./markupForDateRange')
var indexHtml = require('./index.html')
route.use('/front.min.js', babelify(__dirname + '/front.js'))
route.get('/courts', dao.sendFreeCourts)
route.use(express.static(__dirname + '/../public'))
route.get('/', (req, res) => {
    dao.freeCourts(new DateTime().toISODateString(), 3, false, (data) => {
        res.send(indexHtml({
            markup: markupForDateRange(data, new DateTime()),
            refresh: req.query.refresh==='true',
            serverDate: new DateTime().toISODateString()
        }))
    })
})

module.exports = route
