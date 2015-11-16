#!/usr/bin/env node
var express = require('express')
var route = express()
var babelify = require('express-babelify-middleware')
var dao = require('./dao')
var _ = require('lodash')
var fs = require('fs')
var DateTime = require('dateutils').DateTime
var markupForDateRange = require('./markupForDateRange')
route.use('/front.min.js', babelify(__dirname + '/front.js'))
route.get('/courts', dao.sendFreeCourts)
route.use(express.static(__dirname + '/../public'))
var indexHtml = _.template(fs.readFileSync(__dirname + '/index.html', 'utf-8'))
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
