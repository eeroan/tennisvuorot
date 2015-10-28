#!/usr/bin/env node
var Bacon = require('baconjs').Bacon
var request = require('request')
var util = require('util')
var url = 'https://docs.google.com/spreadsheets/d/1TwYmdHhGnB0RZh75bRdHaJy9erXTJpsVxCvCX0SX8f4/pub?output=csv&gid='
var sheets = {
    taivallahti: 1343553212,
    tali:        1463418362,
    kulosaari:   1730330027,
    meilahti:    466490005
}

function fetchFor(name) {
    return Bacon.fromNodeCallback(request.get, {
        url: url + sheets[name]
    }).map('.body').map(function (csv) {
        var list = csv.split('\r\n').splice(1)
        var obj = {}
        list.forEach(function (rowCsv) {
            var row = rowCsv.split(',').map(Number)
            obj[row[0]] = row.splice(1)
        })
        return obj
    }).onValue(function (data) {
        console.log(util.inspect(data, {colors: true, depth: null}))
    })
}

var args = process.argv.splice(2)

fetchFor(args[0])
