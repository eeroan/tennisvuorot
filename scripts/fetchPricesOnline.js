#!/usr/bin/env node
const request = require('request')
const util = require('util')
var DateTime = require('dateutils').DateTime
var DateLocale = require('dateutils').DateLocale

const urls = {
    taivallahti: date => `https://varaukset.talintenniskeskus.fi/booking/create-booking?alkuaika=${date}&kesto=60&resid=46`,
    tali:        {
        indoor: date => `https://varaukset.talintenniskeskus.fi/booking/create-booking?alkuaika=${date}&kesto=60&resid=1`
    },
    kulosaari:   {
        indoor: date => `https://puhoscenter.slsystems.fi/booking/create-booking?alkuaika=${date}&kesto=60&resid=1`,
        bubble: date => `https://puhoscenter.slsystems.fi/booking/create-booking?alkuaika=${date}&kesto=60&resid=3`,

    },
    meilahti:    {
        indoor: date => `https://meilahti.slsystems.fi/booking/create-booking?alkuaika=${date}&kesto=60&resid=6`,
        bubble: date => `https://meilahti.slsystems.fi/booking/create-booking?alkuaika=${date}&kesto=60&resid=2`
        },
    herttoniemi: { // vanha
        indoor: date => `https://www.slsystems.fi/fite/ftpages/ft-varaus-input-01.php?laji=1&res=4&pvm=2020-01-05&klo=21:00:00&kesto=01:00:00`,
        bubble: date => `https://www.slsystems.fi/fite/ftpages/ft-varaus-input-01.php?laji=1&res=12&pvm=2020-01-05&klo=21:00:00&kesto=01:00:00`
    }, // vanha
    merihaka:    date => `https://www.slsystems.fi/meripeli/ftpages/ft-varaus-input-01.php?laji=3&res=26&pvm=2020-01-23&klo=08:30:00&kesto=01:00:00`,
    // vanha
    tapiola:     date => `https://www.slsystems.fi/tennispuisto/ftpages/ft-varaus-input-01.php?laji=1&res=3&pvm=2020-01-16&klo=08:30:00&kesto=01:00:00`,
    // vanha
    laajasalo:   date => `https://www.slsystems.fi/laajasalonpalloiluhallit/ftpages/ft-varaus-input-01.php?laji=1&res=1&pvm=2020-01-05&klo=22:00:00&kesto=01:00:00`,
    hiekkaharju: {indoor: 1018267466, bubble: 692647002}
}

const parsePrice = markup => {
    return parseInt(markup.match(/.*<td>(\d+)\s*€/)[1], 10)
}

const getFor = async (dateTime) => {
    const resid = 7
    const url = `https://meilahti.slsystems.fi/booking/create-booking?alkuaika=${dateTime.toString().replace('T', '+')}&kesto=60&resid=${resid}`
    console.log('Getting price for ', url)
    const res = await util.promisify(request.get)({
        jar: true,
        url
    })
    return parsePrice(res.body)
}
//su=0

const range = size => [...Array(size).keys()]
const main = async () => {
    const start = DateTime.today().plusDays(7).getFirstDateOfWeek(DateLocale.FI)
    const times = {}
    for (let x in range(34)) {
        const time = (60 + (x * 5))
        const dates = []
        for (let x2 in range(6)) {
            const date = await getFor(start.plusMinutes((6 * 60) + (x * 30)).plusDays(x2))
            dates.push(date.toString())
        }
        times[time] = dates
    }
    console.log(times)
}

main()
