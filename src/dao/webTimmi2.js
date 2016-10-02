#!/usr/bin/env node
const request = require('request')
const Bacon = require('baconjs').Bacon
const format = require('../format')

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

const getWeek = cookie => json(get('weekViewAjaxAction.do?oper=getItems', cookie))
const getProfiles = cookie => json(post('autoCompleteAjax.do', cookie, {actionCode: 'getProfiles'}))
const getRoomParts = cookie => json(post('getRoomPartsForCalendarAjax.do', cookie, {
    actionCode: 'getRoomPartsForProfile',
    id: 3
}))
const getWeekView = cookie => json(post('weekViewAjaxAction.do', cookie, { oper: 'getRightsResourcesForCalendar'}))
const getTimeCells = cookie => json(get('weekViewAjaxAction.do?oper=getTimeCells', cookie))
const getTimeZone = cookie => json(get('timeZoneAjax.do', cookie))

//login().flatMap(getProfiles).onValue(x => console.log('jee', format.prettyPrint(x)))
//login().flatMap(getRoomParts).map(format.prettyPrint).log()
login().flatMap(cookie =>
    getProfiles(cookie)
        .flatMap(x => getRoomParts(cookie))
        .flatMap(x => getTimeZone(cookie))
        .flatMap(x => getWeekView(cookie))
        .flatMap(x => getTimeCells(cookie))
        .flatMap(x => getWeek(cookie)))
    .map(format.prettyPrint).log()
