#!/usr/bin/env node
const url = require('url')
const request = require('request')
const Bacon = require('baconjs')
const Duration = require('dateutils').Duration

module.exports = {
    getMeilahti,
    getHerttoniemi,
    getKulosaari,
    getMerihaka,
    table,
    getTapiola,
    getLaajasalo,
    getHiekkaharju
}

function getMeilahti(isoDate) {
    return getTableWithMapper(isoDate, 'meilahti', 1, obj => Object.assign(obj, {
        field:    `${obj.res > 5 ? 'Sisä' : 'Kupla'} K${obj.res}`,
        location: 'meilahti'
    }))
}

function getHerttoniemi(isoDate) {
    return getTableWithMapper(isoDate, 'fite', 1, obj => Object.assign(obj, {
        field:    `${obj.res > 9 ? 'Massakupla' : (obj.res > 6 ? 'Janus' : 'Sisä')} K${obj.res}`,
        location: 'herttoniemi'
    }))
}

function getKulosaari(isoDate) {
    return getTableWithMapper(isoDate, 'puhoscenter', 1, obj => Object.assign(obj, {
        field:    `${obj.res > 2 ? 'Green set' : 'Bolltex'} Te${obj.res}`,
        location: 'kulosaari'
    }))
}

function getMerihaka(isoDate) {
    return getTableWithMapper(isoDate, 'meripeli', 3, obj => Object.assign(obj, {
        field:    'K1',
        location: 'merihaka'
    }))
}

function getTapiola(isoDate) {
    return getTableWithMapper(isoDate, 'tennispuisto', 1, obj => Object.assign(obj, {
        field:    `K${obj.res}`,
        location: 'tapiola'
    }))
}

const laajasaloCodes = {
    '1': 'A',
    '2': 'B',
    '3': 'C',
    '4': 'D'
}

function getLaajasalo(isoDate) {
    return getTableWithMapper(isoDate, 'laajasalonpalloiluhallit', 1, obj => Object.assign(obj, {
        field:    laajasaloCodes[obj.res],
        location: 'laajasalo'
    }))
}
//sisä 7-9, kupla 5-6
const hiekkaHarjuCodes = {
    '1': 'K7',
    '2': 'K8',
    '3': 'K9',
    '4': 'Kaarihalli K5',
    '5': 'Kaarihalli K6'
}
function getHiekkaharju(isoDate) {
    return getTableWithMapper(isoDate, 'hiekkaharjuntenniskeskus', 1, obj => Object.assign(obj, {
        field:    hiekkaHarjuCodes[obj.res],
        location: 'hiekkaharju'
    }))
}

function getTableWithMapper(isoDate, client, sportTypeId, fn) {
    return getSlSystemsTable(isoDate, client, sportTypeId).map(res => res.map(fn))
}

function getSlSystemsTable(isoDate, client, sportTypeId) {
    return Bacon.fromNodeCallback(request.get, {
        url: `https://www.slsystems.fi/${client}/ftpages/ft-varaus-table-01.php?laji=${sportTypeId}&pvm=${isoDate}&goto=0`
    }).map(res => res.body).map(table)
}

function table(html) {
    return (html.match(/res=[^"]+/g) || []).map((el) => url.parse(`?${el}`, true).query).map(fromSlSystemsResult)
}

function fromSlSystemsResult({kesto, klo, pvm, res}) {
    return {
        duration: Duration.fromIsoTime(kesto).asUnit(Duration.MIN),
        time:     (klo || '').substring(0, 5),
        date:     pvm,
        res:      Number(res)
    }
}
