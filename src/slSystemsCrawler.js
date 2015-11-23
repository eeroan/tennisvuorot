#!/usr/bin/env node
var url = require('url')
var request = require('request')
var Bacon = require('baconjs').Bacon
var _ = require('lodash')

module.exports = {
    getMeilahti:    getMeilahti,
    getHerttoniemi: getHerttoniemi,
    getKulosaari:   getKulosaari,
    getMerihaka:    getMerihaka,
    table:          fromSlSystemsTable,
    getTapiola:     getTapiola,
    getLaajasalo:   getLaajasalo
}

function getMeilahti(isoDate) {
    return getTableWithMapper(isoDate, 'meilahti', 1, obj => _.merge(obj, {
        field:    (obj.res > 5 ? 'Sisä' : 'Kupla') + ' K' + obj.res,
        location: 'meilahti'
    }))
}

function getHerttoniemi(isoDate) {
    return getTableWithMapper(isoDate, 'fite', 1, obj => _.merge(obj, {
        field:    (obj.res > 9 ? 'Massakupla' : (obj.res > 6 ? 'Janus' : 'Sisä')) + ' K' + obj.res,
        location: 'herttoniemi'
    }))
}

function getKulosaari(isoDate) {
    return getTableWithMapper(isoDate, 'puhoscenter', 1, obj => _.merge(obj, {
        field:    (obj.res > 2 ? 'Green set' : 'Bolltex' ) + ' Te' + obj.res,
        location: 'kulosaari'
    }))
}

function getMerihaka(isoDate) {
    return getTableWithMapper(isoDate, 'meripeli', 3, obj => _.merge(obj, {
        field:    'K1',
        location: 'merihaka'
    }))
}

function getTapiola(isoDate) {
    return getTableWithMapper(isoDate, 'tennispuisto', 1, obj => _.merge(obj, {
        field:    'K' + obj.res,
        location: 'tapiola'
    }))
}

var laajasaloCodes = {
    '1': 'A',
    '2': 'B',
    '3': 'C',
    '4': 'D'
}

function getLaajasalo(isoDate) {
    return getTableWithMapper(isoDate, 'laajasalonpalloiluhallit', 1, obj => _.merge(obj, {
        field:    laajasaloCodes[obj.res],
        location: 'laajasalo'
    }))
}

function getTableWithMapper(isoDate, client, sportTypeId, fn) {
    return getSlSystemsTable(isoDate, client, sportTypeId).map((res) => _.map(res, fn))
}

function getSlSystemsTable(isoDate, client, sportTypeId) {
    return Bacon.fromNodeCallback(request.get, {
        url: 'https://www.slsystems.fi/' + client + '/ftpages/ft-varaus-table-01.php?laji=' + sportTypeId +
             '&pvm=' + isoDate + '&goto=0'
    }).map('.body').map(fromSlSystemsTable)
}

function fromSlSystemsTable(html) {
    return (html.match(/res=[^"]+/g) || []).map((el) => url.parse('?' + el, true).query).map(fromSlSystemsResult)
}

function fromSlSystemsResult(item) {
    return {
        duration: item.kesto,
        time:     item.klo.substring(0, 5),
        date:     item.pvm,
        res:      Number(item.res)
    }
}
