#!/usr/bin/env node
const request = require('request')
const Bacon = require('baconjs').Bacon
const fs = require('fs')
const _ = require('lodash')
const courts = require('../src/courts')
const util = require('util')
const format = require('../src/format')

locations()

function locations() {
    const fileName = 'locations.js'
    Bacon.combineAsArray(_.map(courts, (val, key) =>
        getLocation(val.address).map(location =>
            _.extend({title: key}, location, val)
        )
    )).onValue(data => {
        console.log('Writing locations to ' + fileName)
        fs.writeFileSync(__dirname + '/../generated/' + fileName, format.formatModule(data))
    })
}

function getLocation(address) {
    return Bacon.fromNodeCallback(request.get, {
        url: 'http://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&sensor=false'
    }).map('.body').map(JSON.parse).map('.results.0.geometry.location')
}
