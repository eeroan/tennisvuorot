#!/usr/bin/env node
const Bacon = require('baconjs')
const request = require('request')
const util = require('util')
const fs = require('fs')
const _ = require('lodash')
const format = require('../src/format')

//Url for editing: https://docs.google.com/spreadsheets/d/1TwYmdHhGnB0RZh75bRdHaJy9erXTJpsVxCvCX0SX8f4/edit
const url = 'https://docs.google.com/spreadsheets/d/1TwYmdHhGnB0RZh75bRdHaJy9erXTJpsVxCvCX0SX8f4/pub?output=csv&gid='
const sheets = {
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
    }).map('.body').map(csv => {
        const list = csv.split('\r\n').splice(1)
        const obj = {}
        list.forEach(rowCsv => {
            const row = rowCsv.split(',').map(Number)
            obj[row[0]] = row.splice(1)
        })
        return obj
    })
}

const fetchForOrCombineTemplate = id =>
    typeof id === 'number' ? fetchFor(id) : Bacon.combineTemplate(_.mapValues(id, fetchFor))


function fetchAll() {
    const fileName = 'rates.js'
    Bacon.combineTemplate(_.mapValues(sheets, fetchForOrCombineTemplate))
        .onValue(data => {
            console.log('Writing rates to ' + fileName)
            fs.writeFileSync(__dirname + '/../generated/' + fileName, format.formatModule(data))
        })
}

fetchAll()
