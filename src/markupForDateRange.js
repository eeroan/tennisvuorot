const locations = require('../generated/locations')
const _ = require('lodash')
const dateutils = require('dateutils')
const DateTime = dateutils.DateTime
const format = require('./format')

module.exports = markupForDateRange

function markupForDateRange(allDataWithDates, today) {
    return allDataWithDates.map(allDataWithDate => {
        const deltaMin = parseInt((new Date().getTime() - allDataWithDate.timestamp) / 60000, 10)
        const timeStamp = `päivitetty ${deltaMin} minuuttia sitten`
        const currentDate = getCurrentDate(allDataWithDate.date)
        const data = allDataWithDate.freeCourts
        return groupBySortedAsList(data, 'date')
            .filter(x => x.key === currentDate)
            .map(dateObject => toDateSection(dateObject, timeStamp, today)).join('')
    }).join('')
}

function getCurrentDate(date) {
    return typeof date === 'string' ? date.split('T')[0] : new DateTime(date).toISODateString()
}
function toDateSection(dateObject, timeStamp, today) {
    const isoDate = dateObject.key
    const times = dateObject.val.filter(reservation => {
        const startingDateTime = DateTime.fromIsoDateTime(reservation.date + 'T' + reservation.time)
        return startingDateTime.compareTo(today.minusMinutes(60)) >= 0
    })

    const dateTime = DateTime.fromIsoDate(isoDate)
    return `<div class="titleContainer day${dateTime.getDay()}"><h4 id="date-${dateTime.toISODateString()}">${format.formatDate(dateTime)}</h4>
    <div class="timestamp">${timeStamp}</div></div>` + groupBySortedAsList(times, 'time').map(toTimeRow).join('')
}

function toTimeRow({key, val}) {
    const isoTime = key
    const fields = val
    const hm = isoTime.split(':')
    return `<div class="timeRow h${format.formatTimeKey(hm)}">
    <span class="timeWrapper"><span class="time">${isoTime}</span></span>
        ${groupBySortedAsList(fields, 'location').map(toLocationButtonGroup).join('')}
        </div>`
}

function toLocationButtonGroup(locationFields) {
    const location = locationFields.key
    const fields = locationFields.val
    return `<span class="locationBoxes" data-fields='${JSON.stringify(compact(fields))}'>${collapsedButtons(location, fields)}</span>`
}

function compact(fields) {
    const first = fields[0]
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
            const type = fieldsForType.key
            const field = fieldsForType.val[0]
            const hasDoubleLessons = fieldsForType.val.some(field => field.doubleLesson)
            return `<button type="button" class="button locationLabel ${location} ${field.type} ${format.durationClass(hasDoubleLessons)}">
        ${location.substring(0,4)}<br> ${format.formatPrice(field.price)}</button>`
        }).join(' ')
}

function groupBySortedAsList(list, key) {
    return _.sortBy(_.map(_.groupBy(list, key), objectToArray), 'key')
}

function objectToArray(val, key) {
    return {key: key, val: val}
}
