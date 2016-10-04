#!/usr/bin/env node
const fs = require('fs')
const format = require('../src/format')
const webTimmi2 = require('../src/dao/webTimmi2')

const fileName = 'profiles.js'

webTimmi2.getProfiles.onValue(data => fs.writeFileSync(__dirname + '/../generated/' + fileName, format.formatModule(data)))
