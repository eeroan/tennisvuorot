var locations = require('./locations')
var _ = require('lodash')
const dateutils = require('dateutils')
var DateTime = dateutils.DateTime
const format = require('./format')

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
    return `<div class="titleContainer day${dateTime.getDay()}"><h4>${format.formatDate(dateTime)}</h4>
    <div class="timestamp">${timeStamp}</div></div>` + groupBySortedAsList(times, 'time').map(toTimeRow).join('')
}

function toTimeRow(timeObject) {
    var isoTime = timeObject.key
    var fields = timeObject.val
    var hm = isoTime.split(':')
    return `<div class="timeRow h${format.formatTimeKey(hm)}">
    <span class="timeWrapper"><span class="time">${isoTime}</span></span>
        ${groupBySortedAsList(fields, 'location').map(toLocationButtonGroup).join('')}
        </div>`
}

function toLocationButtonGroup(locationFields) {
    var location = locationFields.key
    var fields = locationFields.val
    return `<span class="locationBoxes" data-fields='${JSON.stringify(compact(fields))}'>${collapsedButtons(location, fields)}</span>`
}

function compact(fields) {
    var first = fields[0]
    return {
        date:     first.date,
        location: first.location,
        time:     first.time,
        fields:   fields.map(f => ({
            type:         f.type,
            doubleLesson: f.doubleLesson,
            field:        f.field,
            price:        f.price
        }))
    }
}

function collapsedButtons(location, fields) {
    return groupBySortedAsList(fields, 'type')
        .filter(fieldsForType => fieldsForType.val.length > 0)
        .map(fieldsForType => {
            var type = fieldsForType.key
            var field = fieldsForType.val[0]
            var hasDoubleLessons = fieldsForType.val.some(field => field.doubleLesson)
            return `<button type="button" class="locationLabel ${location} ${field.type} ${format.durationClass(hasDoubleLessons)}">
        ${format.formatPrice(field.price)}</button>`
        }).join(' ')
}

function groupBySortedAsList(list, key) {
    return _.sortBy(_.map(_.groupBy(list, key), objectToArray), 'key')
}

function objectToArray(val, key) {
    return {key: key, val: val}
}
