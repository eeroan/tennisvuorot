var locations = require('./locations')
var _ = require('lodash')
var DateTime = require('dateutils').DateTime
var DateFormat = require('dateutils').DateFormat
var DateLocale = require('dateutils').DateLocale
module.exports = markupForDateRange

function markupForDateRange(allDataWithDates, today) {
    return allDataWithDates.map(allDataWithDate => {
        var deltaMin = parseInt((new Date().getTime() - allDataWithDate.timestamp) / 60000, 10)
        var timeStamp = `päivitetty ${deltaMin} minuuttia sitten`
        var currentDate = getCurrentDate(allDataWithDate.date)
        var data = allDataWithDate.freeCourts
        return groupBySortedAsList(data, 'date')
            .filter(x => x.key === currentDate)
            .map(dateObject => toDateSection(dateObject, timeStamp, today)).join('')
    }).join('')
}

function getCurrentDate(date) {
    return typeof date === 'string' ? date.split('T')[0] : new DateTime(date).toISODateString()
}
function toDateSection(dateObject, timeStamp, today) {
    var isoDate = dateObject.key
    var times = dateObject.val.filter(reservation => {
        var startingDateTime = DateTime.fromIsoDateTime(reservation.date + 'T' + reservation.time)
        return startingDateTime.compareTo(today.minusMinutes(60)) >= 0
    })

    var dateTime = DateTime.fromIsoDate(isoDate)
    return `<div class="titleContainer day ${dateTime.getDay()}"><h4>${formatDate(dateTime)}</h4>
    <div class="timestamp">${timeStamp}</div></div>` + groupBySortedAsList(times, 'time').map(toTimeRow).join('')
}

function toTimeRow(timeObject) {
    var isoTime = timeObject.key
    var fields = timeObject.val
    var hm = isoTime.split(':')
    return `<div class="timeRow h${(Number(hm[0]) * 10 + (Number(hm[1]) / 6))}">
    <span class="timeWrapper"><span class="time">${isoTime}</span></span>
        ${groupBySortedAsList(fields, 'location').map(toLocationButtonGroup).join('')}
        </div>`
}

function toLocationButtonGroup(locationFields) {
    var location = locationFields.key
    var fields = locationFields.val
    return `<span class="locationBoxes">${collapsedButtons(location, fields) + modal(fields)}</span>`
}

function modal(fields) {
    var dateTime = DateTime.fromIsoDate(fields[0].date)
    var currentLocation = fields[0].location
    var locationObject = locations.find(location => location.title === currentLocation)

    return `<div class="modal">
        <h3>${currentLocation} ${formatDate(dateTime)} klo ${fields[0].time}</h3>
        ${fields.map(toButtonMarkup).join('')}
        ${linksMarkup(locationObject)}
        <div class="close">&times;</div></div>`
}

function formatDate(dateTime) {
    return DateFormat.format(dateTime, DateFormat.patterns.FiWeekdayDatePattern, DateLocale.FI)
}
function linksMarkup(locationObject) {
    var address = locationObject.address
    var url = locationObject.url
    var tel = locationObject.tel
    return `<div class="links"><div><a class="tel" href="tel:${tel}">${tel}</a></div>
    <div><a class="map" target="_blank" href="http://maps.google.com/?q=${address}">${address}</a></div>` +
        (url ? `<div><a target="_blank" href="${url}">Siirry varausjärjestelmään</a></div>` : '') + '</div>'
}

function collapsedButtons(location, fields) {
    return groupBySortedAsList(fields, 'type')
        .filter(fieldsForType => fieldsForType.val.length > 0)
        .map(fieldsForType => {
            var type = fieldsForType.key
            var field = fieldsForType.val[0]
            var hasDoubleLessons = fieldsForType.val.some(field => field.doubleLesson)
            return `<button type="button" class="locationLabel ${location} ${field.type} ${durationClass(hasDoubleLessons)}">
        ${(field.price ? field.price + '€' : '&nbsp;&nbsp;')}</button>`
        }).join(' ')
}

function toButtonMarkup(field) {
    return `<button type="button" class="fieldLabel ${field.location} ${field.type} ${durationClass(field.doubleLesson)}">${field.field}, ${field.price}€</button>`
}

function durationClass(isDouble) {
    return isDouble ? 'double' : 'single'
}

function groupBySortedAsList(list, key) {
    return _.sortBy(_.map(_.groupBy(list, key), objectToArray), 'key')
}

function objectToArray(val, key) {
    return {key: key, val: val}
}
