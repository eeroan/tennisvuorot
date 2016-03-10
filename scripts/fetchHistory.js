#!/usr/bin/env node
const fs = require('fs')
const util = require('util')
const format = require('../src/format')
const dao = require('../src/dao/dao')
const _ = require('lodash')
dao.getHistoryData((err, data) => {
    if (err) {
        console.log('Error occured:', err)
    } else {
        var fileName = 'historyData.js'
        console.log('Writing history data to ' + fileName)
        fs.writeFileSync(__dirname + '/../src/history/' + fileName, format.formatModule(data))
    }
})
