#!/usr/bin/env node
var request = require('request')
var Bacon = require('baconjs').Bacon
var fs = require('fs')
var _ = require('lodash')
var courts = require('../src/courts')
var util = require('util')
const format = require('../src/format')

locations()

function locations() {
    var fileName = 'locations.js'
    Bacon.combineAsArray(_.map(courts, function (val, key) {
        return getLocation(val.address).map(function (location) {
            return _.extend({title: key}, location, val)
        })
    })).onValue(function (data) {
        console.log('Writing locations to ' + fileName)
        fs.writeFileSync(__dirname + '/../generated/' + fileName, format.formatModule(data))
    })
}

function getLocation(address) {
    return Bacon.fromNodeCallback(request.get, {
        url: 'http://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&sensor=false'
    }).map('.body').map(JSON.parse).map('.results.0.geometry.location')
}
