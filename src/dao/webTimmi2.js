#!/usr/bin/env node
const request = require('request')
const Bacon = require('baconjs').Bacon
const format = require('../format')

const login = () =>
    Bacon.fromNodeCallback(request.get, {
        url: 'https://timmi.talintenniskeskus.fi/WebTimmi/login.do?loginName=GUEST&password=GUEST'
    }).flatMap(res => {
        try {
            return res.headers['set-cookie'][0].split(';')[0]
        } catch (e) {
            return new Bacon.Error(e)
        }
    })

const getWeek = cookie =>
    Bacon.fromNodeCallback(request.get, {
        url: 'https://timmi.talintenniskeskus.fi/WebTimmi/weekViewAjaxAction.do?oper=getItems',
        headers: {
            Cookie: cookie,
            'Cache-Control': 'no-cache'
        }
    }).map('.body').map(JSON.parse)

const getProfiles = cookie =>
    Bacon.fromNodeCallback(request.post, {
        url: 'https://timmi.talintenniskeskus.fi/WebTimmi/autoCompleteAjax.do',
        headers: {
            Cookie: cookie
        },
        form: {
            actionCode: 'getProfiles'
        }
    }).map('.body').map(JSON.parse)

const getRoomParts = cookie =>
    Bacon.fromNodeCallback(request.post, {
        url: 'https://timmi.talintenniskeskus.fi/WebTimmi/getRoomPartsForCalendarAjax.do',
        headers: {
            Cookie: cookie
        },
        form: {
            actionCode: 'getRoomPartsForProfile',
            id: 3
        }
    }).map('.body').map(JSON.parse)

const getWeekView = cookie =>
    Bacon.fromNodeCallback(request.post, {
        url: 'https://timmi.talintenniskeskus.fi/WebTimmi/weekViewAjaxAction.do',
        headers: {
            Cookie: cookie
        },
        form: {
            oper: 'getRightsResourcesForCalendar'
        }
    }).map('.body').map(JSON.parse)

const getTimeCells = cookie =>
    Bacon.fromNodeCallback(request.get, {
        url: 'https://timmi.talintenniskeskus.fi/WebTimmi/weekViewAjaxAction.do?oper=getTimeCells&_=1475315219135',
        headers: {
            Cookie: cookie
        }
    }).map('.body').map(JSON.parse)

const getTimeZone = cookie =>
    Bacon.fromNodeCallback(request.get, {
        url: 'https://timmi.talintenniskeskus.fi/WebTimmi/timeZoneAjax.do',
        headers: {
            Cookie: cookie
        }
    }).map('.body').map(JSON.parse)

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
