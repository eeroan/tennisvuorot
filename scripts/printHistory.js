#!/usr/bin/env node
const util = require('util')
const history = require('../src/history')

var data = history.availabilityByDate()
console.log(util.inspect(data, {
    colors: true,
    depth:  null
}))
