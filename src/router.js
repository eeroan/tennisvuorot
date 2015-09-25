#!/usr/bin/env node
var express = require('express')
var request = require('request')
var route = express()
var slSystems = require('./slSystemsCrawler')
var Bacon = require('baconjs').Bacon
var _ = require('lodash')
var courts = require('../public/courts')
var webTimmi = require('./webTimmiCrawler')
var browserify = require('browserify-middleware')
route.use('/front.min.js', browserify(__dirname + '/../public/front.js'))
route.use(express.static(__dirname + '/../public'))
var cache = {}
route.get('/courts', freeCourts)
route.get('/locations', locations)

module.exports = route

function freeCourts(req, res) {
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
}

function fetch(isoDate) {
    return Bacon.combineTemplate({
        meilahti:    slSystems.getMeilahti(isoDate),
        herttoniemi: slSystems.getHerttoniemi(isoDate),
        kulosaari:   slSystems.getKulosaari(isoDate),
        merihaka:    slSystems.getMerihaka(isoDate),
        webTimmi:    webTimmi.getAll(isoDate)
    }).map(function (allData) {
        return {
            freeCourts: _.flatten((_.map(allData, _.identity))),
            timestamp:  new Date().getTime()
        }
    })
}

function todayIsoDate() {
    var now = new Date()
    var isoDateTime = now.toISOString()
    return isoDateTime.split('T')[0]
}

function locations(req, res) {
    Bacon.combineAsArray(_.map(courts, function (val, key) {
        return getLocation(val.address).map(function (location) {
            return _.extend({title: key}, location, val)
        })
    })).onValue(function (val) { res.send(val) })
}

function getLocation(address) {
    return Bacon.fromNodeCallback(request.get, {
        url: 'http://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&sensor=false'
    }).map('.body').map(JSON.parse).map('.results.0.geometry.location')
}
