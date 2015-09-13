#!/usr/bin/env node
var url = require('url')
var request = require('request')
var Bacon = require('baconjs').Bacon
var _ = require('lodash')
var webTimmiResources = require('./webTimmiResources')
module.exports = {
    getTali: getTali
}

function getTali(isoDate) {
    var fieldGroup = 2186
    return login().flatMap(getWeek).flatMap(function (obj) {
        return weekView(obj.cookie, obj.token, fieldGroup, isoDate)
    })
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

function weekView(cookie, token, fieldGroup, isoDate) {
    var split = isoDate.split('-')
    var year = split[0]
    var month = split[1]
    var day = split[2]
    var date = day + '.' + month + '.' + year
    console.log(date)
    return Bacon.fromNodeCallback(request.post, {
        url:     'http://webtimmi.talintenniskeskus.fi/weekViewMenu.do',
        headers: {
            Cookie: cookie
        },
        form:    {
            'org.apache.struts.taglib.html.TOKEN': token,
            //roomPartIds:'5743|5744|5745|5746|5799|5800|5846|5847|5848|',
            roomPartIds:                           '',
            //date:                                  date,
            //periodTime:                            '01:00',
            cmbProfile:                            fieldGroup,
            action:                                'Hae',
            //week number and date matters
            weekNum:                               '36',
            thursdaySelected:                      'on',
            startTime:                             '06:30',
            endTime:                               '22:30',
            taskBookingClassification:             '0',
            taskMemoClassification:                '0',
            taskOrderDepartment:                   '0'
        }
    }).map('.body').map(function (markup) {
        return markup.match(/getCreateBooking.do[^,"']+/g).map(function (el) {
            return url.parse(el, true).query
        }).map(function (obj) {
            var startDateTime = obj.startTime.split(' ')

            var courtName = webTimmiResources[obj['amp;roomPartId']]
            var startDate = startDateTime[0].split('.')
            var isoDate = startDate[2] + '-' + startDate[1] + '-' + startDate[0]
            return {
                time:     startDateTime[1],
                date:     isoDate,
                res:      courtName.type + ' ' + courtName.name,
                location: /TAIVALLAHTI/i.test(courtName.type) ? 'taivallahti' : 'tali',
                field:    courtName.name
            }
        })
    })
}

function courtsTableToObj($table) {
    return $table.filter(':first tr').map(function (tr) {
        var tds = $(this).find('td');
        return {id: tds.find('input').val(), type: tds.eq(1).text(), name: tds.eq(3).text()}
    }).toArray()
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


getTali('2015-09-10').log()
