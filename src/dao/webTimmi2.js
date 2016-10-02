#!/usr/bin/env node
const request = require('request')
const Bacon = require('baconjs').Bacon
const format = require('../format')
const dateutils = require('dateutils')
const DateTime = dateutils.DateTime
const DateFormat = dateutils.DateFormat
const DateLocale = dateutils.DateLocale

const req = (method, url, cookie, form) => {
    var opts = {
        url: `https://timmi.talintenniskeskus.fi/WebTimmi/${url}`,
        headers: {
            Cookie: cookie,
            'Cache-Control': 'no-cache'
        }
    }
    if(cookie) opts.headers = {Cookie: cookie}
    if(form) opts.form = form
    return Bacon.fromNodeCallback(request[method], opts)
}
const get = (url, cookie, form) => req('get', url, cookie, form)
const post = (url, cookie, form) => req('post', url, cookie, form)
const json = observable => observable.map('.body').map(JSON.parse)

const login = () => get('login.do?loginName=GUEST&password=GUEST').flatMap(res => {
    try {
        return res.headers['set-cookie'][0].split(';')[0]
    } catch (e) {
        return new Bacon.Error(e)
    }
})

const getItems = cookie => json(get('weekViewAjaxAction.do?oper=getItems', cookie))
    .map(res => res
        .map(item => ({
            name: item.roomPartName,
            startTime: new Date(item.startTime.time).toISOString().replace(':00.000Z', ''),
            endTime: new Date(item.endTime.time).toISOString().split('T')[1].replace(':00.000Z', '')
        }))
        .map(item => `${item.name} ${item.startTime}-${item.endTime}`)
    )
/*{
    usageRestrictionId: 0,
    roomPartName: 'TK 10',
    eventActionLinks: [],
    eventBookingId: 3921343,
    colorPrintAlways: false,
    roomId: 5516,
    eventInfo: [],
    eventColorBlue: 211,
    endTime: {
        time: 1475382600000,
        minutes: 30,
        seconds: 0,
        hours: 7,
        month: 9,
        year: 116,
        timezoneOffset: -180,
        day: 0,
        date: 2
    },
    hideBookingsUnderUsageRestriction: 0,
    startTime: {
        time: 1475379000000,
        minutes: 30,
        seconds: 0,
        hours: 6,
        month: 9,
        year: 116,
        timezoneOffset: -180,
        day: 0,
        date: 2
    },
    endDateInMills: 1475382600000,
    customerId: 0,
    startDateInMills: 1475379000000,
    overDrawable: false,
    eventId: 3546217,
    showTimeSpan: false,
    colNumber: 2,
    userId: 71,
    meetingStatus: '',
    sAreaActionLinks: [],
    selectedTimeSpanId: 0,
    orderId: 511700,
    roomPartIdOnCalendar: 5742,
    bookingGroupId: 0,
    invoiceId: 0,
    eventColorGreen: 211,
    reservationType: 1,
    roomPartId: 5742,
    cashId: 0,
    extraOperations: '',
    weekNumber: 39,
    privateEvent: false,
    meeting: false,
    eventColorRed: 211,
    eventStyle: null,
    personalPrivateEvent: false,
    eventTextField: ['Varaus'],
    paymentMethod: 'M'
}*/
const getProfiles = cookie => json(post('autoCompleteAjax.do', cookie, {actionCode: 'getProfiles'}))
const getRoomPartsForCalendarAjax = (cookie, profileId) => json(post('getRoomPartsForCalendarAjax.do', cookie, {
    actionCode: 'getRoomPartsForProfile',
    id: profileId
}))
const getRightsResourcesForCalendar = cookie => json(post('weekViewAjaxAction.do', cookie, {oper: 'getRightsResourcesForCalendar'}))
const updateStructure = (cookie, roomParts, dateTime) => {
    var form = {
        startTime: '06:30',
        endTime: '22:30',
        timePeriod: '60',
        copyMoveDefault: '0',
        copyMoveOption: '0',
        lockTimeOnChoose: '1',
        minTimeChange: '15',
        calendarSize: '4'
    }
    var dayName = DateFormat.format(dateTime, 'l', DateLocale.EN).toLocaleLowerCase() + 'Selected'
    form[dayName] = '1'

    return post('weekViewAjaxAction.do', cookie, {
        oper: 'updateStructure',
        structure: JSON.stringify({
            structure: [{
                roomPartIds: roomParts.map(x=> x.roomPartBean.roomPartId).map(String),
                roomPartNames: [],
                roomPartColors: [],
                calendarSize: 4,
                singlePickedDates: false,
                referenceDateMills: dateTime.getTime()
            }]
        }),
        form: JSON.stringify(form)
    })
}
const getTimeCells = cookie => json(get('weekViewAjaxAction.do?oper=getTimeCells', cookie))
const timeZoneAjax = cookie => json(get('timeZoneAjax.do', cookie))

login().flatMap(cookie =>
    getProfiles(cookie)
        .flatMap(profiles => getRoomPartsForCalendarAjax(cookie, profiles[0].profileId))
        .flatMap(roomParts => updateStructure(cookie, roomParts, DateTime.today().plusDays(1)))
        .flatMap(x => getItems(cookie)))
    .map(format.prettyPrint).log()
