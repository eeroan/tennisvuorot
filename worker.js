#!/usr/bin/env node
var DateTime = require('dateutils').DateTime
var dao = require('./src/dao')
var daysAhead = 0
var maxDaysAhead = 30

doRefresh()
setInterval(function () {
    doRefresh()
}, 1000 * 60 * 10)

function doRefresh() {
    dao.refresh(new DateTime().plusDays(daysAhead).toISODateString(), function () { })
    if(daysAhead>maxDaysAhead) daysAhead = 0
    else daysAhead++
}


