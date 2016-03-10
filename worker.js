process.env.NEW_RELIC_ENABLED = true
require('newrelic')
var DateTime = require('dateutils').DateTime
var dao = require('./src/dao/dao')

updateReservations(2)
setTimeout(() => updateReservations(60), 1000 * 60 * 2)

function updateReservations(days) {
    var daysAhead = 0
    var maxDaysAhead = days

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


