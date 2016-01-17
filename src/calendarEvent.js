const icsDateFormat = 'YmdTHi00'
const DateFormat = require('dateutils').DateFormat
const DateTime = require('dateutils').DateTime
const calendarTmpl = require('./calendarTmpl')

module.exports = {
    show:            show,
    getCalendarLink: getCalendarLink
}
function show(req, res) {
    res.set('Content-Type', 'text/calendar;charset=UTF-8')
    res.set('Content-Disposition','attachment;filename=Testi.ics')
    res.send(getCalendarLink())
}

function getCalendarLink() {
    const startTime = DateTime.now().plusDays(7)
    const location = 'Viikintie 9 A 1'
    const duration = 60
    const summary = 'Summary text'
    return calendarTmpl({
        username:    'user',
        description: 'Calendar description\nNext row <a href="http://www.google.fi">Google</a>',
        location:    location,
        start:       DateFormat.format(startTime, icsDateFormat),
        end:         DateFormat.format(startTime.plusMinutes(duration), icsDateFormat),
        now:         DateFormat.format(DateTime.now(), icsDateFormat),
        summary:     summary
    })
}
