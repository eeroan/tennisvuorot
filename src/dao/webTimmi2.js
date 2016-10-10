#!/usr/bin/env node
const request = require('request')
const Bacon = require('baconjs').Bacon
const format = require('../format')
const dateutils = require('dateutils')
const DateTime = dateutils.DateTime
const DateFormat = dateutils.DateFormat
const DateLocale = dateutils.DateLocale
const profiles = require('../../generated/profiles')
const date = require('../date')
const _ = require('lodash')

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

const formatTime = timeInMillis => {
    const date = new Date(timeInMillis)
    return date.getHours() + ':' + date.getMinutes()
}

const toMinutes = timeInMillis => {
    const date = new Date(timeInMillis)
    return (date.getHours() * 60) + date.getMinutes()
}

const getItems = cookie => json(get('weekViewAjaxAction.do?oper=getItems', cookie))
    .map(res => res
        .map(item => ({
            id: item.roomPartId,
            name: item.roomPartName,
            date: new Date(item.startTime.time),
            formattedStartTime: formatTime(item.startTime.time),
            formattedEndTime: formatTime(item.endTime.time),
            startDate: DateTime.fromMillis(item.startTime.time).toISOString(),
            startTime: toMinutes(item.startTime.time),
            endTime: toMinutes(item.endTime.time)
        }))
    )

const getProfiles = cookie => json(post('autoCompleteAjax.do', cookie, {actionCode: 'getProfiles'}))
    .map(res => res
        .map(profile => ({
            id: profile.profileId,
            name: profile.profileName,
            startTime: profile.roomPartStartTime,
            endTime: profile.roomPartEndTime
        })))

const getRoomPartsForCalendarAjax = (cookie, profileId) => json(post('getRoomPartsForCalendarAjax.do', cookie, {
    actionCode: 'getRoomPartsForProfile',
    id: profileId
}))
const updateStructure = (cookie, startTime, endTime, roomPartIds, dateTime) => {
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
                roomPartIds: roomPartIds,
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
function groupBySortedAsList(list, key) {
    return _.sortBy(_.map(_.groupBy(list, key), objectToArray), 'key')
}

function objectToArray(val, key) {
    return {key: key, val: val}
}

//TODO show availability also for fully empty days
const getItemsWithStructure = (cookie, profile, location, roomParts, startDateTime) =>
    updateStructure(cookie, profile.startTime, profile.endTime, roomParts.map(x=> String(x.roomPartBean.roomPartId)), startDateTime)
        .flatMap(() => getItems(cookie))
        .flatMap(reservations => [].concat.apply([], groupBySortedAsList(reservations, 'name').map(keyVal =>
                date.freeSlots(profile.startTime, profile.endTime, keyVal.val).map(time => ({
                        time: date.formatTime(time),
                        duration: 60,
                        date: startDateTime.toISODateString(),
                        res: profile.name + ' ' + keyVal.key,
                        location: location,
                        field: keyVal.key
                    })
                )
            )).filter(booking => booking.field !== 'HUOM')
        )
const taliProfileIds = [2, 5, 14, 13]
const taivallahtiProfileIds = [3, 4, 18]

const taliProfiles = profiles.filter(p => [2].indexOf(p.id) !== -1)
const taivallahtiProfiles = profiles.filter(p => taivallahtiProfileIds.indexOf(p.id) !== -1)
//console.log('tali', taliProfiles)
//console.log('taivallahti', taivallahtiProfiles)

var startDdateTime = DateTime.today().plusDays(1)
const location = profileId =>taliProfileIds.indexOf(profileId) !== -1 ? 'tali' : 'taivallahti'
login()
    .flatMap(cookie => Bacon.combineAsArray(taliProfiles.map(profile =>
        getRoomPartsForCalendarAjax(cookie, profile.id)
            .flatMap(roomParts => getItemsWithStructure(cookie, profile, location(profile.id), roomParts, startDdateTime))
    )))
    .map(format.prettyPrint).log()

module.exports = {
    getProfiles: login().flatMap(getProfiles)
}
