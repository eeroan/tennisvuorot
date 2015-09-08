#!/usr/bin/env node
var url = require('url')
var request = require('request')
var Bacon = require('baconjs').Bacon
var _ = require('lodash')

module.exports = {
    table: table
}

function login() {
    return Bacon.fromNodeCallback(request.get, {
        url: 'http://webtimmi.talintenniskeskus.fi/login.do?loginName=GUEST&password=GUEST'
    }).map('.headers.set-cookie.0').map(function (cookie) {return cookie.split(';')[0]})
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

function table() {
    return login().flatMap(getWeek).flatMap(function (obj) {
        return weekView(obj.cookie, obj.token)
    })
}

function weekView(cookie, token) {
    return Bacon.fromNodeCallback(request.post, {
        url:     'http://webtimmi.talintenniskeskus.fi/weekViewMenu.do',
        headers: {
            Cookie: cookie
        },
        form:    {
            'org.apache.struts.taglib.html.TOKEN': token,
            roomPartIds:                           '',
            actionType:                            '',
            weekNum:                               '36',
            date:                                  '09.09.2015',
            periodTime:                            '01:00',
            additionalAction:                      '',
            cmbProfile:                            '1018',
            action:                                'Hae',
            selMonth:                              '09',
            selYear:                               '2015',
            wednesdaySelected:                     'on',
            startTime:                             '06:30',
            endTime:                               '22:30',
            textTaskSubject:                       '',
            textTaskInfo:                          '',
            taskBookingClassification:             '0',
            taskMemoClassification:                '0',
            taskOrderDepartment:                   '0',
            taskDate:                              '',
            taskStartTime:                         '',
            taskEndTime:                           '',
            taskDueDate:                           ''
        }
    }).map('.body').map(function (markup) {
        return markup.match(/getCreateBooking.do[^,"']+/g).map(function (el) {
            return url.parse(el, true).query
        })
    })
}

table().log()
