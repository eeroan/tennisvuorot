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

const getItems = cookie => json(get('weekViewAjaxAction.do?oper=getItems', cookie))
const getProfiles = cookie => json(post('autoCompleteAjax.do', cookie, {actionCode: 'getProfiles'}))
const getRoomParts = cookie => json(post('getRoomPartsForCalendarAjax.do', cookie, {
    actionCode: 'getRoomPartsForProfile',
    id: 2
}))
const getWeekView = cookie => json(post('weekViewAjaxAction.do', cookie, {oper: 'getRightsResourcesForCalendar'}))
const updateStructure = cookie => post('weekViewAjaxAction.do', cookie, {
    oper: 'updateStructure',
    structure: JSON.stringify({
        "structure": [{
            "roomPartIds": ["5741", "5742", "5743", "5744", "5745", "5746", "5799", "5800", "5846", "5847", "5848", "5823"],
            "roomPartNames": ["TK 13", "TK 10", "TK 9", "TK 8", "TK 1", "TK 2", "TK 14", "TK 15", "TK 20", "TK 21", "TK 22", "HUOM"],
            "roomPartColors": ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
            "startTime": "06:30",
            "endTime": "22:30",
            "periodization": "60",
            "calendarSize": 4,
            "selectedDays": [0, 0, 0, 0, 0, 0, 1],
            "singlePickedDates": false,
            "referenceDateMills": 1474885798000
        }]
    }),
    form: JSON.stringify({
        "sundaySelected": "1",
        "startTime": "06:30",
        "endTime": "22:30",
        "timePeriod": "60",
        "copyMoveDefault": "0",
        "copyMoveOption": "0",
        "lockTimeOnChoose": "1",
        "minTimeChange": "15",
        "calendarSize": "4"
    })
})
const getTimeCells = cookie => json(get('weekViewAjaxAction.do?oper=getTimeCells', cookie))
const getTimeZone = cookie => json(get('timeZoneAjax.do', cookie))

//login().flatMap(getProfiles).onValue(x => console.log('jee', format.prettyPrint(x)))
//login().flatMap(getRoomParts).map(format.prettyPrint).log()
login().flatMap(cookie =>
    getProfiles(cookie)
        .flatMap(x => getTimeZone(cookie))
        .flatMap(x => getWeekView(cookie))
        .flatMap(x => getProfiles(cookie))
        .flatMap(x => getRoomParts(cookie))
        .flatMap(x => updateStructure(cookie))
        .flatMap(x => getWeekView(cookie))
        .flatMap(x => getTimeCells(cookie))
        .flatMap(x => getItems(cookie)))
    .map(format.prettyPrint).log()
