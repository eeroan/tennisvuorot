var $ = require('jquery')
var _ = require('lodash')
var DateTime = require('dateutils').DateTime
var DateFormat = require('dateutils').DateFormat
var DateLocale = require('dateutils').DateLocale
var attachFastClick = require('fastclick')
var navigation = require('./navigation')
attachFastClick(document.body)
var activeDate = DateTime.today()
var $window = $(window)
var $document = $(document)
var locations = require('./locations')

var didScroll = false
var alreadyLoadingMoreResults = false
$(window).scroll(function () { didScroll = true });

setInterval(function () {
    if (didScroll) {
        didScroll = false;
        if (!alreadyLoadingMoreResults && $window.scrollTop() + $window.height() > $document.height() - 400) {
            console.log('loading more')
            loadMoreResults(5)
        }
    }
}, 250)

navigation.init()
listAvailabilityForDate(activeDate, 2, 30)
initJumpToDate()

$('#schedule').on('click', '.locationLabel, .close', function (e) {
    var $locationBoxes = $(e.currentTarget).parents('.locationBoxes')
    $locationBoxes.toggleClass('showDetails')
})
$('.information .close').click(function () {
    $(this).parents('.modal').hide()
})

$('.locationMap .close').click(function () {
    $(this).parents('.modal').hide()
})

function loadMoreResults(days) {
    if (!alreadyLoadingMoreResults) {
        alreadyLoadingMoreResults = true
        activeDate = activeDate.plusDays(1)
        listAvailabilityForDate(activeDate, days)
    }
}

function listAvailabilityForDate(requestedDateTime, days, daysTwo) {
    var requestedDate = requestedDateTime.toISODateString()
    $('#schedule').addClass('loading')
    alreadyLoadingMoreResults = true
    return $.getJSON('/courts?date=' + requestedDate + '&days=' + days, function (allDataWithDates) {
        $('#schedule').removeClass('loading')
            //.append($timeStamp)
            .append(allDataWithDates.map(function (allDataWithDate) {
                var deltaMin = parseInt((new Date().getTime() - allDataWithDate.timestamp) / 60000, 10)
                var timeStamp = 'päivitetty ' + deltaMin + ' minuuttia sitten'
                var currentDate = allDataWithDate.date.split('T')[0]
                var data = allDataWithDate.freeCourts
                return groupBySortedAsList(data, 'date').filter(function (x) {
                    return x.key === currentDate
                }).map(function (dateObject) {
                    return toDateSection(dateObject, timeStamp)
                }).join('')
            }).join(''))
        alreadyLoadingMoreResults = false
        if (daysTwo) loadMoreResults(daysTwo)
    })
}

function toDateSection(dateObject, timeStamp) {
    var isoDate = dateObject.key
    var times = dateObject.val.filter(function (reservation) {
        var startingDateTime = DateTime.fromIsoDateTime(reservation.date + 'T' + reservation.time)
        return startingDateTime.compareTo(new DateTime().minusMinutes(60)) >= 0
    })

    var dateTime = DateTime.fromIsoDate(isoDate)
    return '<div class="titleContainer day' + dateTime.getDay() + '"><h4>' + DateFormat.format(dateTime, DateFormat.patterns.FiWeekdayDatePattern, DateLocale.FI) + '</h4>' +
        '<div class="timestamp">' + timeStamp + '</div></div>' +
        groupBySortedAsList(times, 'time').map(toTimeRow).join('')
}

function toTimeRow(timeObject) {
    var isoTime = timeObject.key
    var fields = timeObject.val
    var hm = isoTime.split(':')
    return '<div class="timeRow h' + (Number(hm[0]) * 10 + (Number(hm[1]) / 6)) + '"><span class="timeWrapper"><span class="time">' + isoTime + '</span></span>' +
        groupBySortedAsList(fields, 'location').map(toLocationButtonGroup).join('') + '</div>'
}

function toLocationButtonGroup(locationFields) {
    var location = locationFields.key
    var fields = locationFields.val
    return '<span class="locationBoxes">' + collapsedButtons(location, fields) + modal(fields) + '</span>'
}

function modal(fields) {
    var dateTime = DateTime.fromIsoDate(fields[0].date)
    var currentLocation = fields[0].location
    var locationObject = locations.find(function (location) {
        return location.title === currentLocation
    })

    return '<div class="modal">' +
        '<h3>' + currentLocation + ' ' + DateFormat.format(dateTime, DateFormat.patterns.FiWeekdayDatePattern, DateLocale.FI) + ' klo ' + fields[0].time + '</h3>'
        + fields.map(toButtonMarkup).join('') +
        linksMarkup(locationObject) +
    '<div class="close">&times;</div></div>'
}

function linksMarkup(locationObject) {
    var address = locationObject.address
    var url = locationObject.url
    var tel = locationObject.tel
    var systemLink = (url ? '<div><a target="_blank" href="' + url + '">Siirry varausjärjestelmään</a></div>' : '')
    var addressLink = '<div><a class="map" target="_blank" href="http://maps.google.com/?q=' + address + '">' + address + '</a></div>'
    var telLink = '<div><a class="tel" href="tel:' + tel + '">' + tel + '</a></div>'
    return '<div class="links">' + telLink + addressLink + systemLink + '</div>'
}

function collapsedButtons(location, fields) {
    return groupBySortedAsList(fields, 'type').filter(function (fieldsForType) {
        return fieldsForType.val.length > 0
    }).map(function (fieldsForType) {
        var type = fieldsForType.key
        var field = fieldsForType.val[0]
        var hasDoubleLessons = fieldsForType.val.some(function (field) { return field.doubleLesson })
        return '<button type="button" class="locationLabel ' + location + ' ' + field.type + ' ' + (hasDoubleLessons ? 'double' : 'single') + '">' + (field.price ? field.price + '€' : '&nbsp;&nbsp;') + '</button>'
    }).join(' ')
}

function toButtonMarkup(field) {
    return '<button type="button" class="fieldLabel ' + field.location + ' ' + field.type + (field.doubleLesson ? ' double' : ' single') + '">' + field.field + ', ' + field.price + '€</button>'
}

function groupBySortedAsList(list, key) {
    return _.sortBy(_.map(_.groupBy(list, key), objectToArray), 'key')
}

function objectToArray(val, key) {
    return {key: key, val: val}
}

function initJumpToDate() {
    $('.jumpToDate').html(_.range(1, 60).map(function (delta) {
        var dateTime = new DateTime().plusDays(delta)
        var format = DateFormat.format(dateTime, DateFormat.patterns.FiWeekdayDatePattern, DateLocale.FI)
        return '<option value="' + dateTime.toISODateString() + '">' + format + '</option>'
    }).join('\n')).change(function () {
        activeDate = DateTime.fromIsoDate($(this).val())
        $('#schedule').empty()
        alreadyLoadingMoreResults = true
        listAvailabilityForDate(activeDate, 2)
    })
}
