#!/usr/bin/env node
const request = require('request')
//require('request-debug')(request)
const Bacon = require('baconjs')
const dateutils = require('dateutils')
const DateTime = dateutils.DateTime
const DateFormat = dateutils.DateFormat
const DateLocale = dateutils.DateLocale
const profiles = require('../../generated/profiles')
const date = require('../date')
const _ = require('lodash')

function table(html) {
    return (html.match(/create-booking([^<])+/g) || [])
        .map(decodeURIComponent)
        .map(x => x.match(/alkuaika=(.*)\+(.*):00&kesto=(.*)&resid=(.*)">(.*) (.*)/))
        .filter(x => x)
        .map(x => ({
            duration: x[3],
            time: x[2],
            date: x[1],
            res: Number(x[4])
        }))
}

const getFor = (isoDate, sportTypeId, expander) => {
    const url = `https://varaukset.talintenniskeskus.fi/booking/booking-calendar?BookingCalForm[p_laji]=${sportTypeId}&BookingCalForm[p_pvm]=${isoDate}`;
    const stream = Bacon.fromNodeCallback(request.get, {url})
    stream.onError(e => console.log(`error fetching for ${url}`, e))
    return stream.map(res => res.body).map(table).map(list => list.map(o => Object.assign(o, expander(o))));
}

const getTaliIndoor = isoDate => getFor(isoDate, 1, o => ({
    field: 'Sisä K' + o.res,
    location: 'tali',
    type: 'indoor'
}))
const getTaliOutdoor = isoDate => getFor(isoDate, 2, o => ({
    field: 'Ulko H' + o.res,
    location: 'tali',
    type: 'outdoor'
}))
const getTaivallahti = isoDate => getFor(isoDate, 5, o => ({
    field: 'Sisä T' + o.res,
    location: 'taivallahti',
    type: 'indoor'
}))

module.exports = {
    table,
    getTaliIndoor,
    getTaliOutdoor,
    getTaivallahti
}
