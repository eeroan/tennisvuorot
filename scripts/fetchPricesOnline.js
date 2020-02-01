#!/usr/bin/env node
const request = require('request')
const util = require('util')
const DateTime = require('dateutils').DateTime
const DateLocale = require('dateutils').DateLocale
const _ = require('lodash')
const fs = require('fs').promises

function formatDateTime(dateTime) {
    return dateTime.toString().replace('T', '+');
}

function formatDateTimeOld(dateTime) {
    return dateTime.toString().replace('T', '&klo=');
}

const parsePrice = markup => {
    return Number(markup.match(/.*(\d+)\s*€/)[1])
}
const parsePriceOld = markup => {
    try {
        return Number(markup.match(/.*Hinta.*>([\d|.]+)\s+<.*/)[1])
    } catch (e) {
        process.stdout.write(markup)
        return -1
    }
}
const urls = {
    taivallahti: [date => `https://varaukset.talintenniskeskus.fi/booking/create-booking?alkuaika=${formatDateTime(date)}&kesto=60&resid=46`, parsePrice],
    tali: {
        indoor: [date => `https://varaukset.talintenniskeskus.fi/booking/create-booking?alkuaika=${formatDateTime(date)}&kesto=60&resid=1`, parsePrice]
    },
    kulosaari: {
        indoor: [date => `https://puhoscenter.slsystems.fi/booking/create-booking?alkuaika=${formatDateTime(date)}&kesto=60&resid=1`, parsePrice],
        bubble: [date => `https://puhoscenter.slsystems.fi/booking/create-booking?alkuaika=${formatDateTime(date)}&kesto=60&resid=3`, parsePrice],
    },
    meilahti: {
        indoor: [date => `https://meilahti.slsystems.fi/booking/create-booking?alkuaika=${formatDateTime(date)}&kesto=60&resid=6`, parsePrice],
        bubble: [date => `https://meilahti.slsystems.fi/booking/create-booking?alkuaika=${formatDateTime(date)}&kesto=60&resid=2`, parsePrice]
    },
    herttoniemi: { // vanha
        indoor: [date => `https://www.slsystems.fi/fite/ftpages/ft-varaus-input-01.php?laji=1&res=4&pvm=${formatDateTimeOld(date)}&kesto=01:00:00`, parsePriceOld],
        bubble: [date => `https://www.slsystems.fi/fite/ftpages/ft-varaus-input-01.php?laji=1&res=12&pvm=${formatDateTimeOld(date)}&kesto=01:00:00`, parsePriceOld]
    }, // vanha
    merihaka: [date => `https://www.slsystems.fi/meripeli/ftpages/ft-varaus-input-01.php?laji=3&res=26&pvm=${formatDateTimeOld(date)}&kesto=01:00:00`, parsePriceOld],
    // vanha
    tapiola: [date => `https://www.slsystems.fi/tennispuisto/ftpages/ft-varaus-input-01.php?laji=1&res=3&pvm=${formatDateTimeOld(date)}&kesto=01:00:00`, parsePriceOld],
    // vanha
    laajasalo: [date => `https://www.slsystems.fi/laajasalonpalloiluhallit/ftpages/ft-varaus-input-01.php?laji=1&res=1&pvm=${formatDateTimeOld(date)}&kesto=01:00:00`, parsePriceOld],
    hiekkaharju: {indoor: 1018267466, bubble: 692647002}
}


const getFor = async ([urlFunc, parser], dateTime) => {
    const url = urlFunc(dateTime)
    process.stdout.write(url + ' → ')
    try {
        const res = await util.promisify(request.get)({
            jar: true,
            url
        })
        const price = parser(res.body)
        console.log(price)
        return price
    } catch (e) {
        console.log(e.message)
        return ''
    }
}
//su=0

const range = size => [...Array(size).keys()]
const table = async key => {
    const start = DateTime.today().plusDays(90).getFirstDateOfWeek(DateLocale.FI)
    const times = {}
    for (let x in range(34)) {
        const time = (60 + (x * 5))
        const dates = []
        for (let x2 in range(6)) {
            const date = await getFor(key, start.plusMinutes((6 * 60) + (x * 30)).plusDays(x2))
            dates.push(date.toString())
        }
        times[time] = dates
        return times
    }
}


const main = async (key) => {


await fs.writeFile('rates2.js', util.inspect(times, null, 2))
console.log(times)
}


main()
