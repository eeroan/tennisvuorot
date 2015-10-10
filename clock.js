#!/usr/bin/env node
var DateTime = require('dateutils').DateTime
var dao = require('./src/dao')

doRefresh()
setInterval(function () {
    doRefresh()
}, 1000*60*60)

function doRefresh() {
    dao.refresh(DateTime.today().toISODateString(), function (done) {
        dao.refresh(DateTime.today().plusDays(1).toISODateString(), function () { })
    })
}


