const DateTime = require('dateutils').DateTime
const dao = require('./src/dao/dao')

updateReservations(2)
setTimeout(() => updateReservations(60), 1000 * 60 * 2)

function updateReservations(maxDaysAhead) {
    let daysAhead = 0
    doRefresh()
    setInterval(() => {
        doRefresh()
    }, 1000 * 60 * 5)

    function doRefresh() {
        dao.refresh(new DateTime().plusDays(daysAhead).toISODateString(), 1, () => { })
        if (daysAhead > maxDaysAhead) daysAhead = 0
        else daysAhead++
    }
}


