#!/usr/bin/env node
const request = require('request')
//require('request-debug')(request)
const util = require('util')

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

const getFor = async (isoDate, sportTypeId, expander) => {
    const url = `https://varaukset.talintenniskeskus.fi/booking/booking-calendar?BookingCalForm[p_laji]=${sportTypeId}&BookingCalForm[p_pvm]=${isoDate}`;
    const res = await util.promisify(request.get)(url)
    return table(res.body).map(o => Object.assign(o, expander(o)))
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
