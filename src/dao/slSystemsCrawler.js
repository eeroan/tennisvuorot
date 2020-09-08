#!/usr/bin/env node
const url = require('url')
const request = require('request')
const Duration = require('dateutils').Duration
const util = require('util')
module.exports = {
    getMerihaka,
    table,
    getTapiola,
    getLaajasalo,
}

async function getMerihaka(isoDate) {
    const table = await getSlSystemsTable(isoDate, 'meripeli', 3);
    return table.map(obj => ({
        ...obj,
        field: 'K1',
        location: 'merihaka'
    }))
}

async function getTapiola(isoDate) {
    const table = await getSlSystemsTable(isoDate, 'tennispuisto', 1);
    return table.map(obj => ({
        ...obj,
        field: `K${obj.res}`,
        location: 'tapiola'
    }))
}

const laajasaloCodes = {
    '1': 'A',
    '2': 'B',
    '3': 'C',
    '4': 'D'
}

async function getLaajasalo(isoDate) {
    const table = await getSlSystemsTable(isoDate, 'laajasalonpalloiluhallit', 1);
    return table.map(obj => ({
        ...obj,
        field: laajasaloCodes[obj.res],
        location: 'laajasalo'
    }))
}

async function getSlSystemsTable(isoDate, client, sportTypeId) {
    const url = `https://vj.slsystems.fi/${client}/ftpages/ft-varaus-table-01.php?laji=${sportTypeId}&pvm=${isoDate}&goto=0`
    const res = await util.promisify(request.get)(url)
    return table(res.body)
}

function table(html) {
    return (html.match(/res=[^"]+/g) || []).map((el) => url.parse(`?${el}`, true).query).map(fromSlSystemsResult)
}

function fromSlSystemsResult({kesto, klo, pvm, res}) {
    return {
        duration: Duration.fromIsoTime(kesto).asUnit(Duration.MIN),
        time: (klo || '').substring(0, 5),
        date: pvm,
        res: Number(res)
    }
}
