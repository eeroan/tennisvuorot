#!/usr/bin/env node
var DateTime = require('dateutils').DateTime
var dao = require('./src/dao')
setInterval(function () {
    dao.refresh(DateTime.today().toISODateString(), function (done) {
        dao.refresh(DateTime.today().plusDays(1).toISODateString())
    })
}, 1000*60*60)
