#!/usr/bin/env node
const request = require('request')
//require('request-debug')(request)
const Bacon = require('baconjs')
const dateutils = require('dateutils')
const DateTime = dateutils.DateTime
const DateFormat = dateutils.DateFormat
const DateLocale = dateutils.DateLocale
const profiles = require('../../generated/profiles')
const date = require('../date')
const _ = require('lodash')

function table(html) {
    return html.match(/create-booking([^<])+/g)
        .map(decodeURIComponent)
        .map(x => x.match(/alkuaika=(.*)\+(.*):00&kesto=(.*)&resid=(.*)">(.*) (.*)/))
        .filter(x => x)
        .map(x => ({
            duration: x[3],
            time: x[2],
            date: x[1],
            res: x[4]
        }))
}

module.exports = {
    table
}
