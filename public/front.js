var DateTime = require('dateutils').DateTime
var DateFormat = require('dateutils').DateFormat
var DateLocale = require('dateutils').DateLocale
var attachFastClick = require('fastclick')
var mapView = require('./mapView')
var locations = require('./locations')
attachFastClick(document.body)
var deltaDate = 0

var _throttleTimer = null
var _throttleDelay = 100
var $window = $(window)
var $document = $(document)
$document.ready(function () {
    $window
        .off('scroll', ScrollHandler)
        .on('scroll', ScrollHandler)
})

var nearAlready = false
initNavigation()
listAvailabilityForDate(todayIsoDate(0)).done(function () {
    if ($window.height() === $document.height()) loadMoreResults()
})
$('#schedule').on('click', '.locationLabel', function (e) {
    var $locationLabel = $(e.currentTarget)
    $locationLabel.toggle()
    $locationLabel.parent().find('.fieldLabel').toggle()
})
renderLocations(locations)

function ScrollHandler(e) {
    clearTimeout(_throttleTimer);
    _throttleTimer = setTimeout(function () {
        if ($window.scrollTop() + $window.height() > $document.height() - 400) {
            if (!nearAlready) {
                loadMoreResults()
            }
            nearAlready = true
        } else {
            nearAlready = false
        }

    }, _throttleDelay)
}

function loadMoreResults() {
    deltaDate++
    listAvailabilityForDate(todayIsoDate(deltaDate))
}

function listAvailabilityForDate(requestedDate) {
    $('#schedule').addClass('loading')
    return $.getJSON('/courts?date=' + requestedDate, function (allDataWithDate) {
        var deltaMin = parseInt((new Date().getTime() - allDataWithDate.date) / 60000, 10)
        //var $timeStamp = $('span').addClass('timestamp').html('päivitetty ' + deltaMin + ' minuuttia sitten')
        var data = allDataWithDate.freeCourts.filter(function (reservation) {
            var startingDateTime = DateTime.fromIsoDateTime(reservation.date + 'T' + reservation.time)
            return startingDateTime.compareTo(new DateTime().minusMinutes(60)) >= 0
        })
        $('#schedule').removeClass('loading')
            //.append($timeStamp)
            .append(groupBySortedAsList(data, 'date').filter(function (x) {
                return x.key === requestedDate
            }).map(toDateSection).join(''))
    })
}

function todayIsoDate(delta) {
    var now = new Date()
    if (delta) {
        now.setDate(now.getDate() + delta)
    }
    var isoDateTime = now.toISOString()
    return isoDateTime.split('T')[0]
}

function renderLocations(locations) {
    $('.information tbody').html(locations.map(function (obj) {
        var address = obj.address
        var url = obj.url
        var title = obj.title
        var tel = obj.tel
        return '<tr><td class="place">' + (url ? '<a target="_blank" href="' + url + '">' + title + '</a>' : title) + '</td>' +
            '<td><a target="_blank" href="http://maps.google.com/?q=' + address + '">' + address + '</a></td>' +
            '<td><a href="tel:' + tel + '">' + tel + '</a></td></tr>'
    }).join(''))
}

function toDateSection(dateObject) {
    var isoDate = dateObject.key
    var times = dateObject.val
    return '<h4>' + DateFormat.format(DateTime.fromIsoDate(isoDate), DateFormat.patterns.FiWeekdayDatePattern, DateLocale.FI) + '</h4>' +
        groupBySortedAsList(times, 'time').map(toTimeRow).join('')
}

function toTimeRow(timeObject) {
    var isoTime = timeObject.key
    var fields = timeObject.val
    return '<p><span class="time">' + isoTime + '</span>' +
        groupBySortedAsList(fields, 'location').map(toLocationButtonGroup).join('') + '</p>'
}

function toLocationButtonGroup(locationFields) {
    var location = locationFields.key
    var fields = locationFields.val
    return '<span class="locationBoxes"><button type="button" class="locationLabel btn ' +
        location +
        ' btn-xs">' + location + ' (' + fields.length + ')</button>' +
        fields.map(toButtonMarkup).join('') + '</span>'
}

function toButtonMarkup(field) {
    return '<button type="button" class="fieldLabel btn ' + field.location + ' btn-xs">' + field.field + '</button>'
}

function groupBySortedAsList(list, key) {
    return _.sortBy(_.map(_.groupBy(list, key), objectToArray), 'key')
}

function objectToArray(val, key) {
    return {key: key, val: val}
}

function initNavigation() {
    $('.toggles button').click(function (e) {
        e.preventDefault()
        var $button = $(this)
        $button.toggleClass('inactive')
        var id = $button.prop('id')
        $('#schedule').toggleClass(id)
    })
    $('.toggleReservations').click(function () {
        $('nav li').removeClass('selected')
        $(this).addClass('selected')
        $('.detail').hide()
        $('.reservations').show()
    })

    $('.toggleInformation').click(function () {
        $('nav li').removeClass('selected')
        $(this).addClass('selected')
        $('.detail').hide()
        $('.information').show()
    })
    $('.toggleMapInformation').click(function () {
        $('nav li').removeClass('selected')
        $(this).addClass('selected')
        $('.detail').hide()
        $('#map_wrapper').show()
        _.once(mapView.renderMap)()
    })
}
