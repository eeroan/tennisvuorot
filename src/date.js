var _ = require('lodash')

function freeSlots(startTime, endTime, reservations) {
    const startTimes = _.range(minutes(startTime), minutes(endTime), 60)
    const reservationTuples = reservations.map(span => span.split('-').map(minutes))
    return startTimes
        .filter(startTime => reservationTuples.every(reservationTuple => notOverlapping(startTime, reservationTuple)))
        .map(formatTime)
}

const notOverlapping = (startTime, reservation) => startTime >= reservation[1] || startTime + 60 <= reservation[0]

function minutes(hoursAndMinutes) {
    const splitted = hoursAndMinutes.split(':')
    return (Number(splitted[0]) * 60) + Number(splitted[1])
}

function formatTime(minutes) {
    const m = minutes % 60
    const h = (minutes - m) / 60
    return `${h}:${m}`
}

module.exports = {
    freeSlots,
    minutes,
    formatTime,
    notOverlapping
}
