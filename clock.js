#!/usr/bin/env node
var DateTime = require('dateutils').DateTime
var cache = require('./cache')
setInterval(function () {
    cache.update(DateTime.today())
    cache.update(DateTime.today().plusDays(1))
}, 1000*60*5)
