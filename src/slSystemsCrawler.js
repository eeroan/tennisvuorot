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
    table:          fromSlSystemsTable
}

function getMeilahti(isoDate) {
    return getSlSystemsTable(isoDate, 'meilahti', 1).map(function (res) {
        return _.map(res, function (obj) {
            var index = obj.res
            obj.field = (index > 5 ? 'Sisä' : 'Kupla') + ' K' + index
            obj.location = 'meilahti'
            return obj
        })
    })
}

function getHerttoniemi(isoDate) {
    return getSlSystemsTable(isoDate, 'fite', 1).map(function (res) {
        return _.map(res, function (obj) {
            var index = obj.res
            obj.field = (index > 9 ? 'Massakupla' : (index > 6 ? 'Janus' : 'Sisä')) + ' K' + index
            obj.location = 'herttoniemi'
            return obj
        })
    })
}

function getKulosaari(isoDate) {
    return getSlSystemsTable(isoDate, 'puhoscenter', 1).map(function (res) {
        return _.map(res, function (obj) {
            var index = obj.res
            obj.field = (index > 2 ? 'Green set' : 'Bolltex' ) + ' Te' + index
            obj.location = 'kulosaari'
            return obj
        })
    })
}

function getMerihaka(isoDate) {
    return getSlSystemsTable(isoDate, 'meripeli', 3).map(function (res) {
        return _.map(res, function (obj) {
            var index = obj.res
            obj.field = 'K1'
            obj.location = 'merihaka'
            return obj
        })
    })
}

function getSlSystemsTable(isoDate, client, sportTypeId) {
    return Bacon.fromNodeCallback(request.get, {
        url: 'https://www.slsystems.fi/' + client + '/ftpages/ft-varaus-table-01.php?laji=' + sportTypeId +
             '&pvm=' + isoDate + '&goto=0'
    }).map('.body').map(fromSlSystemsTable)
}

function fromSlSystemsTable(html) {
    return html.match(/res=[^"]+/g).map(function (el) {
        return url.parse('?' + el, true).query
    }).map(fromSlSystemsResult)
}

function fromSlSystemsResult(item) {
    return {
        duration: item.kesto,
        time:     item.klo.substring(0, 5),
        date:     item.pvm,
        res:      Number(item.res)
    }
}
