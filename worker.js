const DateTime = require('dateutils').DateTime
const dao = require('./src/dao/dao')

const intervalInSeconds = 60 * 5
const seconsAfterFirstRefresh = 120
updateReservations(2)
setTimeout(() => updateReservations(60), 1000 * seconsAfterFirstRefresh)

function updateReservations(maxDaysAhead) {
    let daysAhead = 0
    doRefresh()
    setInterval(() => {
        doRefresh()
    }, 1000 * intervalInSeconds)

    function doRefresh() {
        dao.refresh(new DateTime().plusDays(daysAhead).toISODateString(), 1, () => { })
        if (daysAhead > maxDaysAhead) daysAhead = 0
        else daysAhead++
    }
}


