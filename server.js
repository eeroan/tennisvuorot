#!/usr/bin/env node
var express = require('express')
var request = require('request')
var app = express()
var slSystems = require('./src/slSystemsCrawler')
var Bacon = require('baconjs').Bacon
var _ = require('lodash')
var courts = require('./public/courts')
var webTimmi = require('./src/webTimmiCrawler')
var browserify = require('browserify-middleware')
app.use('/front.min.js', browserify(__dirname + '/public/front.js'))
app.use(express.static(__dirname + '/public'))
var lastTime = new Date(2000, 1, 1)
var cache = {}
app.get('/courts', function (req, res) {
    var isoDate = req.query.date || todayIsoDate()
    var expirationInMin = 120
    var currentTimeMinusDelta = new Date().getTime() - 1000 * 60 * expirationInMin
    var cachedValue = cache[isoDate]
    if (cachedValue && cachedValue.date > currentTimeMinusDelta) {
        res.send(cachedValue)
    } else {
        fetch(isoDate).onValue(function (obj) {
            cache[isoDate] = obj
            res.send(obj)
        })
    }
})

function fetch(isoDate) {
    return Bacon.combineTemplate({
        meilahti:     slSystems.getMeilahti(isoDate),
        herttoniemi:  slSystems.getHerttoniemi(isoDate),
        kulosaari:    slSystems.getKulosaari(isoDate),
        merihaka:     slSystems.getMerihaka(isoDate),
        tali1:        webTimmi.getTali1(isoDate),
        tali2:        webTimmi.getTali2(isoDate),
        taivallahti1: webTimmi.getTaivallahti1(isoDate),
        taivallahti2: webTimmi.getTaivallahti2(isoDate),
        date:         new Date().getTime()
    }).map(function (allDataWithDate) {
        var allData = _.omit(allDataWithDate, 'date')
        return {
            freeCourts:      _.flatten((_.map(allData, _.identity))),
            timestamp: allDataWithDate.date
        }
    })
}

function todayIsoDate() {
    var now = new Date()
    var isoDateTime = now.toISOString()
    return isoDateTime.split('T')[0]
}

app.get('/locations', function (req, res) {
    Bacon.combineAsArray(_.map(courts, function (val, key) {
        return getLocation(val.address).map(function (location) {
            return _.extend({title: key}, location, val)
        })
    })).onValue(function (val) { res.send(val) })
})

function getLocation(address) {
    return Bacon.fromNodeCallback(request.get, {
        url: 'http://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&sensor=false'
    }).map('.body').map(JSON.parse).map('.results.0.geometry.location')
}
var port = process.env.PORT || 5000
var server = app.listen(port, function () {
    console.log('Server started at localhost:' + port)
})
