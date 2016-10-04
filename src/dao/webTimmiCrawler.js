#!/usr/bin/env node
const url = require('url')
const request = require('request')
const Bacon = require('baconjs').Bacon
const _ = require('lodash')
const webTimmiResources = require('./webTimmiResources')
const dateutils = require('dateutils')
const DateTime = dateutils.DateTime
const DateFormat = dateutils.DateFormat
const DateLocale = dateutils.DateLocale
module.exports = {
    getAll:            getAll,
    getAllInSequence:  getAllInSequence,
    parseMarkup:       parseMarkup,
    getFieldsForGroup: getFieldsForGroup
}

function getAll(isoDate) {
    return Bacon.combineAsArray([
        1018,
        1019,
        2186,
        2189
    ].map((cmbProfile) => getFieldsForGroup(cmbProfile, isoDate))).map((list) => _.flatten(list))
}

function getAllInSequence(isoDate) {
    const tali1 = login().flatMap(getWeek).flatMap(weekForProfile(1018, isoDate)).flatMapError(emptyList)
    const tali2 = tali1.flatMap(weekForProfile(1019, isoDate)).flatMapError(emptyList)
    const taivallahti1 = tali2.flatMap(weekForProfile(2186, isoDate)).flatMapError(emptyList)
    const taivallahti2 = taivallahti1.flatMap(weekForProfile(2189, isoDate)).flatMapError(emptyList)

    return Bacon.combineAsArray(tali1.map('.obj'), tali2.map('.obj'), taivallahti1.map('.obj'), taivallahti2.map('.obj'))
        .map((list) => _.flatten(list))
}

function weekForProfile(cmbProfile, isoDate) {
    return (obj) => weekView(obj.cookie, obj.token, cmbProfile, isoDate)
}

function emptyList() {
    return []
}

function getFieldsForGroup(fieldGroup, isoDate) {
    return login().flatMap(getWeek).flatMap((obj) => weekView(obj.cookie, obj.token, fieldGroup, isoDate)).flatMapError(() => []).map('.obj')
}

function login() {
    return Bacon.fromNodeCallback(request.get, {
        url: 'https://webtimmi.talintenniskeskus.fi/login.do?loginName=GUEST&password=GUEST'
    }).flatMap((res) => {
        try {
            return res.headers['set-cookie'][0].split(';')[0]
        } catch (e) {
            return new Bacon.Error(e)
        }
    })
}

function getWeek(cookie) {
    return Bacon.fromNodeCallback(request.get, {
        url:     'https://webtimmi.talintenniskeskus.fi/getWeekView.do',
        headers: {
            Cookie: cookie
        }
    }).map('.body').map((markup) => {
        return {
            cookie: cookie,
            token:  _.last(markup.match(/TOKEN" value="([^"]+)"/i))
        }
    })
}

function weekView(cookie, token, fieldGroup, isoDate) {
    if (!token) return new Bacon.Error('No token')
    var dateTime = DateTime.fromIsoDate(isoDate)
    var fiDate = DateFormat.format(dateTime, 'd.m.Y', DateLocale.FI)
    var dayName = DateFormat.format(dateTime, 'l', DateLocale.EN).toLocaleLowerCase() + 'Selected'
    var week = dateTime.getWeekInYear('ISO')
    var form = {
        'org.apache.struts.taglib.html.TOKEN': token,
        //roomPartIds:'5743|5744|5745|5746|5799|5800|5846|5847|5848|',
        roomPartIds:                           '',
        date:                                  fiDate,
        //periodTime:                            '01:00',
        cmbProfile:                            fieldGroup,
        action:                                'Hae',
        //week number and date matters
        weekNum:                               week,
        startTime:                             '06:30',
        endTime:                               '22:30',
        taskBookingClassification:             '0',
        taskMemoClassification:                '0',
        taskOrderDepartment:                   '0'
    }
    form[dayName] = 'on'
    return Bacon.fromNodeCallback(request.post, {
        url:     'https://webtimmi.talintenniskeskus.fi/weekViewMenu.do',
        headers: {
            Cookie: cookie
        },
        form:    form
    }).map('.body').map((markup) => {
        return {
            obj:    parseMarkup(markup),
            token:  markup.match(/TOKEN" value="([^"]+)"/i).pop(),
            cookie: cookie
        }
    })
}

function parseMarkup(markup) {
    return _.uniq(markup.match(/getCreateBooking.do[^,"']+/g).map((el) => url.parse(el, true).query).map((obj) => {
        const startDateTime = obj.startTime.split(' ')
        const courtName = webTimmiResources[obj['amp;roomPartId']]
        const endTime = obj['amp;endTime'].split(' ')[1]
        const startDate = startDateTime[0].split('.')
        const isoDate = startDate[2] + '-' + startDate[1] + '-' + startDate[0]
        const startTime = startDateTime[1]
        return {
            time:     startTime,
            duration: toMinutes(endTime) - toMinutes(startTime),
            date:     isoDate,
            res:      courtName.type + ' ' + courtName.name,
            location: /TAIVALLAHTI/i.test(courtName.type) ? 'taivallahti' : 'tali',
            field:    courtName.name
        }
    }).filter((obj) => obj.duration === 60), JSON.stringify)
}

function toMinutes(hoursAndMinutes) {
    var splitted = hoursAndMinutes.split(':')
    return Number(splitted[0]) * 60 + Number(splitted[1])
}
