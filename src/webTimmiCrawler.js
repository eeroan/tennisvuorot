#!/usr/bin/env node
var url = require('url')
var request = require('request')
var Bacon = require('baconjs').Bacon
var _ = require('lodash')
var webTimmiResources = require('./webTimmiResources')
var DateTime = require('dateutils').DateTime
var DateFormat = require('dateutils').DateFormat
var DateLocale = require('dateutils').DateLocale
module.exports = {
    getTali1:        getTali1,
    getTali2:        getTali2,
    getTaivallahti1: getTaivallahti1,
    getTaivallahti2: getTaivallahti2,
    parseMarkup:     parseMarkup
}

var cmbProfile = {
    1018: 'TALI SISÄTENNIS 1',
    1019: 'TALI SISÄTENNIS 2',
    1020: 'TALI SULKAPALLO',
    1016: 'TALI HIEKKA 1-2',
    1017: 'TALI HIEKKA 3-5',
    1021: 'TALI KESÄ 1',
    1022: 'TALI KESÄ 2',
    1023: 'TALI KESÄSULKAPALLO',
    1024: 'TALI MASSA 6-8',
    1025: 'TALI MASSA 9-11',
    2186: 'TAIVALLAHTI 1',
    2189: 'TAIVALLAHTI 2'
}

function getTali1(isoDate) {
    return getFieldsForGroup(1018, isoDate)
}

function getTali2(isoDate) {
    return getFieldsForGroup(1019, isoDate)
}

function getTaivallahti1(isoDate) {
    return getFieldsForGroup(2186, isoDate)
}

function getTaivallahti2(isoDate) {
    return getFieldsForGroup(2189, isoDate)
}

function getFieldsForGroup(fieldGroup, isoDate) {
    return login().flatMap(getWeek).flatMap(function (obj) {
        return weekView(obj.cookie, obj.token, fieldGroup, isoDate)
    }).flatMapError(function () {
        return []
    })
}

function login() {
    return Bacon.fromNodeCallback(request.get, {
        url: 'http://webtimmi.talintenniskeskus.fi/login.do?loginName=GUEST&password=GUEST'
    }).flatMap(function (res) {
        try {
            return res.headers['set-cookie'][0].split(';')[0]
        } catch(e) {
            return new Bacon.Error(e)
        }
    })
}

function getWeek(cookie) {
    return Bacon.fromNodeCallback(request.get, {
        url:     'http://webtimmi.talintenniskeskus.fi/getWeekView.do',
        headers: {
            Cookie: cookie
        }
    }).map('.body').map(function (markup) {
        return {
            cookie: cookie,
            token:  markup.match(/TOKEN" value="([^"]+)"/i).pop()
        }
    })
}

function weekView(cookie, token, fieldGroup, isoDate) {
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
        url:     'http://webtimmi.talintenniskeskus.fi/weekViewMenu.do',
        headers: {
            Cookie: cookie
        },
        form:    form
    }).map('.body').map(parseMarkup)
}

function parseMarkup(markup) {
    return _.uniq(markup.match(/getCreateBooking.do[^,"']+/g).map(function (el) {
        return url.parse(el, true).query
    }).map(function (obj) {
        var startDateTime = obj.startTime.split(' ')
        var courtName = webTimmiResources[obj['amp;roomPartId']]
        var endTime = obj['amp;endTime'].split(' ')[1]
        var startDate = startDateTime[0].split('.')
        var isoDate = startDate[2] + '-' + startDate[1] + '-' + startDate[0]
        var startTime = startDateTime[1]
        return {
            time:     startTime,
            duration: toMinutes(endTime) - toMinutes(startTime),
            date:     isoDate,
            res:      courtName.type + ' ' + courtName.name,
            location: /TAIVALLAHTI/i.test(courtName.type) ? 'taivallahti' : 'tali',
            field:    courtName.name
        }
    }).filter(function (obj) {
        return obj.duration === 60
    }), function (item) {return JSON.stringify(item)})
}

function toMinutes(hoursAndMinutes) {
    var splitted = hoursAndMinutes.split(':')
    return Number(splitted[0]) * 60 + Number(splitted[1])
}
function courtsTableToObj($table) {
    return $table.filter(':first tr').map(function (tr) {
        var tds = $(this).find('td');
        return {id: tds.find('input').val(), type: tds.eq(1).text(), name: tds.eq(3).text()}
    }).toArray()
}
