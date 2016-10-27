const icsDateFormat = 'YmdTHi00'
const DateFormat = require('dateutils').DateFormat
const DateTime = require('dateutils').DateTime
const calendarTmpl = require('./calendarTmpl')

module.exports = {
    show,
    getCalendarLink
}
function show(req, res) {
    res.set('Content-Type', 'text/calendar;charset=UTF-8')
    res.set('Content-Disposition', 'attachment;filename=Tennisvuoro.ics')
    res.send(getCalendarLink(req.query))
}

function getCalendarLink({location, field, price, tel, date, time, address, url}) {
    const startTime = DateTime.fromIsoDateTime(date + 'T' + time + ':00')
    const duration = 60
    const summary = `Tennisvuoro ${location} ${field}`
    const description = `Hinta ${price}\\n Puhelin ${tel}`
    return calendarTmpl({
        username:    'user',
        description: description,
        location:    address.replace(',', '\\,'),
        start:       DateFormat.format(startTime, icsDateFormat),
        end:         DateFormat.format(startTime.plusMinutes(duration), icsDateFormat),
        now:         DateFormat.format(new DateTime(), icsDateFormat),
        summary:     summary,
        url:         escape(url)
    })
}
