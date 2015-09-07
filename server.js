#!/usr/bin/env node
var express = require('express')
var request = require('request')
var app = express()
var slSystems = require('./src/slSystemsCrawler')
var Bacon = require('baconjs').Bacon
var _ = require('lodash')
var courts = require('./public/courts')
app.use(express.static(__dirname + '/public'))
app.get('/courts', function (req, res) {
    var now = new Date()
    var isoDateTime = now.toISOString();
    var isoDate = isoDateTime.split('T')[0]
    Bacon.combineTemplate({
        meilahti:    slSystems.getMeilahti(isoDate),
        herttoniemi: slSystems.getHerttoniemi(isoDate),
        kulosaari:   slSystems.getKulosaari(isoDate),
        merihaka:    slSystems.getMerihaka(isoDate)
    }).onValue(function (obj) { res.send(obj) })
});
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
