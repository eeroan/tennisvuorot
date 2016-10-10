var _ = require('lodash')

function freeSlots(startTime, endTime, reservationObjects) {
    const startTimes = _.range(minutes(startTime), minutes(endTime), 60)
    return startTimes
        .filter(startTime => reservationObjects.every(reservationObject => notOverlapping(startTime, reservationObject)))
}

const notOverlapping = (startTime, reservationObj) => startTime >= reservationObj.endTime || startTime + 60 <= reservationObj.startTime

function minutes(hoursAndMinutes) {
    const splitted = hoursAndMinutes.split(':')
    return (Number(splitted[0]) * 60) + Number(splitted[1])
}
const fill = val => (val > 9 ? '' : '0') + val

function formatTime(minutes) {
    const m = minutes % 60
    const h = (minutes - m) / 60
    return `${fill(h)}:${fill(m)}`
}

module.exports = {
    freeSlots,
    minutes,
    formatTime,
    notOverlapping
}
