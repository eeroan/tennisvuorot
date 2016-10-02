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
    .map(res => ({reservations: res, length: res.length}))
const getProfiles = cookie => json(post('autoCompleteAjax.do', cookie, {actionCode: 'getProfiles'}))
const getRoomPartsForCalendarAjax = (cookie, profileId) => json(post('getRoomPartsForCalendarAjax.do', cookie, {
    actionCode: 'getRoomPartsForProfile',
    id: profileId
}))
const getRightsResourcesForCalendar = cookie => json(post('weekViewAjaxAction.do', cookie, {oper: 'getRightsResourcesForCalendar'}))
const updateStructure = (cookie, roomParts, dateTime) => {
    var form = {
        startTime: '06:30',
        endTime: '22:30'
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
        .flatMap(profiles => Bacon.combineAsArray(profiles.map(profile => getRoomPartsForCalendarAjax(cookie, profile.profileId))))
        .flatMap(roomParts => updateStructure(cookie, [].concat.apply([], roomParts), DateTime.today().plusDays(1)))
        .flatMap(x => getItems(cookie)))
    .map(format.prettyPrint).log()
