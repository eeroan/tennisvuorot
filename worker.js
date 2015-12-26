process.env.NEW_RELIC_ENABLED = true
require('newrelic')
var DateTime = require('dateutils').DateTime
var dao = require('./src/dao')
var daysAhead = 0
var maxDaysAhead = 60

doRefresh()
setInterval(() => {
    doRefresh()
}, 1000 * 60 * 5)

function doRefresh() {
    dao.refresh(new DateTime().plusDays(daysAhead).toISODateString(), 1, () => { })
    if (daysAhead > maxDaysAhead) daysAhead = 0
    else daysAhead++
}


