#!/usr/bin/env node
var url = require('url')
var request = require('request')
var Bacon = require('baconjs').Bacon

module.exports = {
    getMeilahti: getMeilahti,
    table:       table
}

//Format: 2015-08-28
function getMeilahti(isoDate) {
    return Bacon.fromNodeCallback(request.get, {
        url: 'https://www.slsystems.fi/meilahti/ftpages/ft-varaus-table-01.php?laji=1&pvm=' + isoDate + '&goto=0'
    }).map('.body').map(table)
}

function table(html) {
    return html.match(/res=[^"]+/g).map(function (el) {
        return url.parse('?' + el, true).query
    })
}
