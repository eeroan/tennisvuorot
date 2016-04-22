const dao = require('../dao/dao')
const DateTime = require('dateutils').DateTime
const DateLocale = require('dateutils').DateLocale
const DateFormat = require('dateutils').DateFormat
const markupForDateRange = require('../markupForDateRange')
const headHtml = require('../head.html')
const filtersHtml = require('./filters.html')
const modalsHtml = require('./modals.html')
const scriptsHtml = require('./scripts.html')
const _ = require('lodash')
const locations = require('../../generated/locations')

module.exports = {
    show: show
}

function show(req, res) {
    var refresh = req.query.refresh === 'true'
    res.write(`<!DOCTYPE html>
<html>`)
    res.write(headHtml({locations: locations, _:_}))
    res.write(`<body>`)
    res.write(`<div class="reservationModal modal"></div>`)
    res.write(modalsHtml())
    res.write(`<div class="container detail">`)
    res.write('<div class="mainHeader"><img src="/tennisvuorot.png"/>Tennisvuorot.fi</div>')
    res.write(filters())
    res.write(quickLinks())
    res.write(`<section class="" id="schedule">`)
    res.write(filters())
    dao.freeCourts(new DateTime().toISODateString(), 3, refresh, (data) => {
        res.write(markupForDateRange(data, new DateTime()))
        res.write('</section></div>')
        res.write('<a href="javascript:void(0)" class="toggle toggleInformation">Tietoja</a>')
        res.write(scriptsHtml({
            isTest: global.isTest,
            refresh: refresh,
            serverDate: new DateTime().toISODateString()
        }))
        res.write('</body></html>')
        res.end()
    })
}

function filters() {
    return filtersHtml({
        places: [
            {id: 'meilahti', name: 'Meilahti'},
            {id: 'herttoniemi', name: 'Herttoniemi'},
            {id: 'kulosaari', name: 'Kulosaari'},
            {id: 'merihaka', name: 'Merihaka'},
            {id: 'taivallahti', name: 'Taivallahti', disabled:true},
            {id: 'tapiola', name: 'Tapiola'},
            {id: 'tali', name: 'Tali', disabled:true},
            {id: 'laajasalo', name: 'Laajasalo'},
            {id: 'hiekkaharju', name: 'Hiekkaharju'}
        ],
        types: [
            {id: 'bubble', name: 'Kupla'},
            {id: 'outdoor', name: 'Ulko'},
            {id: 'indoor', name: 'Sisä'}
        ]
    })
}

function quickLinks() {
    return `<div class="quickLinks">${_.range(0, 30)
        .map(delta => DateTime.today().plusDays(delta))
        .map(dateTime => `<a href="#date-${dateTime.toISODateString()}" class="day${dateTime.getDay()}">${DateFormat.format(dateTime, 'D j.n', DateLocale.FI)}</a>`)
        .join('')}</div>`
}
