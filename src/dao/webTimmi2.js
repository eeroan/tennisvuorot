#!/usr/bin/env node
const request = require('request')
const Bacon = require('baconjs').Bacon
const format = require('../format')
const dateutils = require('dateutils')
const DateTime = dateutils.DateTime
const DateFormat = dateutils.DateFormat
const DateLocale = dateutils.DateLocale
const profiles = require('../../generated/profiles')

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
    .map(res => res
        .map(profile => ({
            id:        profile.profileId,
            name:      profile.profileName,
            startTime: profile.roomPartStartTime,
            endTime:   profile.roomPartEndTime
        })))

const getRoomPartsForCalendarAjax = (cookie, profileId) => json(post('getRoomPartsForCalendarAjax.do', cookie, {
    actionCode: 'getRoomPartsForProfile',
    id: profileId
}))
const updateStructure = (cookie, startTime, endTime, roomParts, dateTime) => {
    var form = {
        startTime: startTime,
        endTime: endTime
    }
    var dayName = DateFormat.format(dateTime, 'l', DateLocale.EN).toLocaleLowerCase() + 'Selected'
    form[dayName] = '1'

    return post('weekViewAjaxAction.do', cookie, {
        oper: 'updateStructure',
        structure: JSON.stringify({
            structure: [{
                roomPartIds:        roomParts.map(x=> x.roomPartBean.roomPartId).map(String),
                roomPartNames:      [],
                roomPartColors:     [],
                calendarSize:       4,
                singlePickedDates:  false,
                referenceDateMills: dateTime.getTime()
            }]
        }),
        form: JSON.stringify(form)
    })
}
const getItemsWithStructure = (cookie, startTime, endTime, roomParts, startDateTime) =>
    updateStructure(cookie, startTime, endTime, roomParts, startDateTime)
        .flatMap(() => getItems(cookie))

login().flatMap(cookie =>
    Bacon.combineAsArray(profiles.map(profile =>
        Bacon.combineTemplate({
            items:   getRoomPartsForCalendarAjax(cookie, profile.id).flatMap(roomParts =>
                getItemsWithStructure(cookie, profile.startTime, profile.endTime, roomParts, DateTime.today().plusDays(1))),
            profile: profile
        }))))
    .map(format.prettyPrint).log()

module.exports = {
    getProfiles: login().flatMap(getProfiles)
}
