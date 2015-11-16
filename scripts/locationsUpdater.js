#!/usr/bin/env node
var request = require('request')
var Bacon = require('baconjs').Bacon
var _ = require('lodash')
var courts = require('../src/courts')
var util = require('util')

locations()

function locations() {
    Bacon.combineAsArray(_.map(courts, function (val, key) {
        return getLocation(val.address).map(function (location) {
            return _.extend({title: key}, location, val)
        })
    })).onValue(function (data) {
        console.log(util.inspect(data, {colors: true, depth: null}))
    })
}

function getLocation(address) {
    return Bacon.fromNodeCallback(request.get, {
        url: 'http://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&sensor=false'
    }).map('.body').map(JSON.parse).map('.results.0.geometry.location')
}
