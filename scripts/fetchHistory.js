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
        const fileName = 'historyData.js'
        console.log('Writing history data to ' + fileName)
        fs.writeFileSync(__dirname + '/../generated/' + fileName, format.formatModule(data))
    }
})
