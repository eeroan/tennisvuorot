#!/usr/bin/env node
var DateTime = require('dateutils').DateTime
var cache = require('./cache')
cache.update(DateTime.today())
cache.update(DateTime.today().plusDays(1))
