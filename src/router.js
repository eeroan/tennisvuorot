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
var expirationInMin = 120
route.get('/courts', freeCourts)
route.get('/locations', locations)

module.exports = route

function freeCourts(req, res) {
    var isoDate = req.query.date
    var currentTimeMinusDelta = new Date().getTime() - 1000 * 60 * expirationInMin
    var cachedValue = cache[isoDate]
    if (cachedValue && cachedValue.timestamp > currentTimeMinusDelta) {
        console.log('fetching from cache for date', isoDate)
        res.send(cachedValue)
    } else {
        console.log('fetching from servers for date', isoDate)

        fetch(isoDate).onValue(function (obj) {
            cache[isoDate] = obj
            res.send(obj)
        })
    }
}

function fetch(isoDate) {
    return Bacon.combineAsArray([
        slSystems.getMeilahti,
        slSystems.getHerttoniemi,
        slSystems.getKulosaari,
        slSystems.getMerihaka,
        webTimmi.getAll].map(function (fn) { return fn(isoDate) }))
        .map(function (allData) {
            return {
                freeCourts: _.flatten(allData),
                timestamp:  new Date().getTime()
            }
        })
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
