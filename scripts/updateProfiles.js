#!/usr/bin/env node
const fs = require('fs')
const format = require('../src/format')
const webTimmi = require('../src/dao/webTimmi')

const fileName = 'profiles.js'

webTimmi.getLatestProfiles.onValue(data => fs.writeFileSync(__dirname + '/../generated/' + fileName, format.formatModule(data)))
