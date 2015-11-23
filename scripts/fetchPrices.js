#!/usr/bin/env node
var Bacon = require('baconjs').Bacon
var request = require('request')
var util = require('util')
var fs = require('fs')
var _ = require('lodash')
//Url for editing: https://docs.google.com/spreadsheets/d/1TwYmdHhGnB0RZh75bRdHaJy9erXTJpsVxCvCX0SX8f4/edit
var url = 'https://docs.google.com/spreadsheets/d/1TwYmdHhGnB0RZh75bRdHaJy9erXTJpsVxCvCX0SX8f4/pub?output=csv&gid='
var sheets = {
    taivallahti: 1343553212,
    tali:        1463418362,
    kulosaari:   1730330027,
    meilahti:    {indoor: 466490005, bubble: 844564121},
    herttoniemi: {indoor: 1178514552, bubble: 198222769},
    merihaka:    1502483638,
    tapiola:     145296495,
    laajasalo:   1910750595
}

function fetchFor(id) {
    return Bacon.fromNodeCallback(request.get, {
        url: url + id
    }).map('.body').map(function (csv) {
        var list = csv.split('\r\n').splice(1)
        var obj = {}
        list.forEach(function (rowCsv) {
            var row = rowCsv.split(',').map(Number)
            obj[row[0]] = row.splice(1)
        })
        return obj
    })
}

function fetchForOrCombineTemplate(id) {
    if (typeof id === 'number') {
        return fetchFor(id)
    } else return Bacon.combineTemplate(_.mapValues(id, fetchFor))
}

function fetchAll() {
    var fileName = 'rates.js'
    Bacon.combineTemplate(_.mapValues(sheets, fetchForOrCombineTemplate))
        .onValue(function (data) {
            console.log('Writing rates to ' + fileName)
            fs.writeFileSync(__dirname + '/../src/' + fileName, 'module.exports = ' + util.inspect(data, {
                    colors: false,
                    depth:  null
                }))
        })
}

fetchAll()
