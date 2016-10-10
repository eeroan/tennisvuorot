const date = require('../src/date')
const sampleData = [
    '07:30-8:30',
    '09:00-10:00',
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
    '21:30'
]
describe('date lib', () => {
    it('lists free slots', () => {
        expect(date.freeSlots(startTime, endTime, sampleData)).to.eql(availableSlots)
    })
})
