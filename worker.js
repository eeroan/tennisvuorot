const DateTime = require('dateutils').DateTime
const dao = require('./src/dao/dao')

const intervalInSeconds = 60 * 5
const seconsAfterFirstRefresh = 120
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
updateReservations(2)
setTimeout(() => updateReservations(60), 1000 * seconsAfterFirstRefresh)

async function updateReservations(maxDaysAhead) {
    let daysAhead = 0
    await doRefresh()
    // noinspection InfiniteLoopJS
    while(true) {
        await doRefresh()
        await delay(1000 * intervalInSeconds)
    }
    async function doRefresh() {
        await dao.refresh(new DateTime().plusDays(daysAhead).toISODateString(), 1)
        if (daysAhead > maxDaysAhead) daysAhead = 0
        else daysAhead++
    }
}


