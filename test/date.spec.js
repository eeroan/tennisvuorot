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
]

const startTime = '6:30'
const endTime = '22:30'

const availableSlots = [
    '6:30',
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
        expect(date.freeSlots(startTime, endTime, reservations)).to.eql(availableSlots)
    })
})

describe('is overlapping', () => {
    it('works as expected', () => {
        expect(date.isOverlapping(540, [540, 600])).to.be.true
        expect(date.isOverlapping(570, [540, 600])).to.be.true
        expect(date.isOverlapping(600, [540, 600])).to.be.false
        expect(date.isOverlapping(660, [540, 600])).to.be.false
        expect(date.isOverlapping(date.minutes('8:30'), ['9:00','10:00'].map(date.minutes))).to.be.true
        expect(date.isOverlapping(date.minutes('8:00'), ['9:00','10:00'].map(date.minutes))).to.be.false
    })
})
