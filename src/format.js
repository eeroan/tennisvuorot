const DateFormat = require('dateutils').DateFormat
const DateLocale = require('dateutils').DateLocale
const util = require('util')

module.exports = {
    formatDate,
    durationClass,
    formatModule,
    formatTimeKey,
    formatPrice,
    formatTime,
    parseTime,
    formatIsoTime,
    prettyPrint
}

function formatDate(dateTime) {
    return DateFormat.format(dateTime, DateFormat.patterns.FiWeekdayDatePattern, DateLocale.FI)
}

function durationClass(isDouble) {
    return isDouble ? 'double' : 'single'
}

function formatModule(data) {
    return 'module.exports = ' + prettyPrint(data)
}

function prettyPrint(data) {
    return util.inspect(data, {
        colors: false,
        depth: null,
        maxArrayLength: null
    })
}

function formatTimeKey(hm) {
    return (Number(hm[0]) * 10 + (Number(hm[1]) / 6))
}

function parseTime(isoTime) {
    const hm = isoTime.split(':')
    return String(formatTimeKey(hm))
}

function formatTime(val) {
    const hour = Math.floor(val / 10)
    const min = Math.round(val % 10 * .6)
    return hour + ':' + min + '0'
}

function formatIsoTime(val) {
    const hour = Math.floor(val / 10)
    const min = Math.round(val % 10 * .6)
    return (hour >= 10 ? hour : '0' + hour) + ':' + min + '0'
}

function formatPrice(num) {
    if(num === 0) return '-,-'
    return num % 1 === 0 ? num + ',-' : withDecimals(String(num).split('.'))
}

function withDecimals(decimal) {
    const cents = decimal[1]
    return decimal[0] + ',' + (cents.length === 1 ? cents + '0' : cents)
}
