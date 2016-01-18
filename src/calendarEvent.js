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
    res.set('Content-Disposition', 'attachment;filename=Tennisvuoro.ics')
    res.send(getCalendarLink(req.query))
}

function getCalendarLink(query) {
    //http://localhost:5000/calendar
    // ?location=meilahti
    // &field=Kupla%20K2
    // &price=19
    // &tel=050%203748068
    // &date=2016-01-18
    // &time=07:30
    // &address=Meilahden%20Liikuntapuisto,%2000250%20Helsinki
    // &url=https://www.slsystems.fi/meilahti/
    const location = query.location//kulosaari
    const field = query.field//Bolltex Te2
    const price = query.price//20
    const tel = query.tel//09%206211303
    const date = query.date//2016-01-18
    const time = query.time//08:30
    const address = query.address//Kulosaarentie%202,%2000570%20Helsinki
    const url = query.url//http://www.slsystems.fi/puhoscenter/
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
