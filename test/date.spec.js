const date = require('../src/date')
const reservations = [
    '7:30-8:30',
    '9:00-10:00',
    '10:00-10:30',
    '10:30-11:30',
    '12:00-14:00',
    '16:30-17:30',
    '17:30-18:30',
    '18:30-19:30',
    '19:30-20:30'
].map(str => {
    const splitted = str.split('-').map(date.minutes)
    return {
        startTime : splitted[0],
        endTime: splitted[1]
    }
})

const startTime = '6:30'
const endTime = '22:30'

const availableSlots = [
    '06:30',
    '14:30',
    '15:30',
    '20:30',
    '21:30'
]

describe('format and parse time', () => {
    it('returns same list', () => {
        expect(availableSlots
            .map(date.minutes)
            .map(date.formatTime)).to.eql(availableSlots)
    })
})

describe('date lib', () => {
    it('lists free slots', () => {
        expect(date.freeSlots(startTime, endTime, reservations).map(date.formatTime)).to.eql(availableSlots)
    })
})

describe('is overlapping', () => {
    it('works as expected', () => {
        expect(date.notOverlapping(540, {startTime:540, endTime: 600})).to.be.false
        expect(date.notOverlapping(570, {startTime:540, endTime: 600})).to.be.false
        expect(date.notOverlapping(600, {startTime:540, endTime: 600})).to.be.true
        expect(date.notOverlapping(660, {startTime:540, endTime: 600})).to.be.true
        expect(date.notOverlapping(date.minutes('8:30'), {startTime: date.minutes('9:00'), endTime: date.minutes('10:00')})).to.be.false
        expect(date.notOverlapping(date.minutes('8:00'), {startTime: date.minutes('9:00'), endTime: date.minutes('10:00')})).to.be.true
    })
})
