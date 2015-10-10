#!/usr/bin/env node
var request = require('request')
var util = require('util')
require('request-debug')(request, function (type, data, r) {
    console.log(util.inspect(data, {colors: true, depth: null}))
})
var webTimmi = require('./webTimmiCrawler')

webTimmi.getFieldsForGroup(1018,'2010-10-11').onValue(function (data) {
    console.log(data)
})
