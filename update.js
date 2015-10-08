#!/usr/bin/env node
var DateTime = require('dateutils').DateTime
var cache = require('./cache')
cache.update(DateTime.today().plusDays(7))
cache.update(DateTime.today().plusDays(8))
