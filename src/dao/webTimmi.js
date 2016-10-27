#!/usr/bin/env node
const request = require('request')
//require('request-debug')(request)
const Bacon = require('baconjs').Bacon
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
    return (date.getHours() > 9 ? '' : '0' ) + date.getHours() + ':' + (date.getMinutes() > 9 ? '' : '0') + date.getMinutes()
}

const toMinutes = timeInMillis => {
    const date = new Date(timeInMillis)
    return (date.getHours() * 60) + date.getMinutes() || (24 * 60)
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
const objectToArray = (val, key) => ({key: key, val: val})

const groupBySortedAsList = (list, key) => _.sortBy(_.map(_.groupBy(list, key), objectToArray), 'key')

const taliProfileIds = [2, 5, 14, 13]

const getType = profileId => {
    const indoors = [2, 3, 4, 5]
    const outdoor = [13, 14, 18]
    if(indoors.indexOf(profileId) !== -1) return 'indoor'
    else if(outdoor.indexOf(profileId) !== -1) return 'outdoor'
    else return undefined
}
const location = profileId => taliProfileIds.indexOf(profileId) !== -1 ? 'tali' : 'taivallahti'

//TODO show availability also for fully empty days
const getItemsWithStructure = (cookie, profile, roomParts, startDateTime) =>
    updateStructure(cookie, profile.startTime, profile.endTime, roomParts.map(x=> String(x.id)), startDateTime)
        .flatMap(() => getItems(cookie))
        .flatMap(reservations => groupBySortedAsList(reservations, 'name').map(keyVal =>
                date.freeSlots(profile.startTime, profile.endTime, keyVal.val).map(time => ({
                        time: date.formatTime(time),
                        duration: 60,
                        date: startDateTime.toISODateString(),
                        res: profile.name + ' ' + keyVal.key,
                        location: location(profile.id),
                        field: keyVal.key,
                        type: getType(profile.id)
                    })
                ).filter(booking => booking.field.indexOf('HUOM') === -1 && booking.type)
            )
        )

const getAll = isoDate => login()
    .flatMap(cookie =>
        profiles.reduce((resultsStream, profile) =>
                resultsStream.flatMap(res =>
                        getItemsWithStructure(cookie, profile.profile, profile.roomParts, DateTime.fromIsoDate(isoDate))
                            .map(newRes => res.concat(newRes))
                    ),
            Bacon.once([]))
    )
    .map(_.flattenDeep)

const mapRoomPart = roomPart => ({
    id: roomPart.roomPartBean.roomPartId,
    name: roomPart.roomBean.name,
    code: roomPart.roomBean.roomCode
})

const getLatestProfiles = () => login()
    .flatMap(cookie => getProfiles(cookie)
        .flatMap(profiles => Bacon.combineAsArray(profiles.map(profile => getRoomPartsForCalendarAjax(cookie, profile.id).flatMap(roomParts => ({
            profile:   profile,
            roomParts: roomParts.map(mapRoomPart)
        }))))))

module.exports = {
    getAll,
    getLatestProfiles
}
