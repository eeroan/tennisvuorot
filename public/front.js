var DateTime = require('dateutils').DateTime
var DateFormat = require('dateutils').DateFormat
var DateLocale = require('dateutils').DateLocale
var attachFastClick = require('fastclick')
var mapView = require('./mapView')
var locations = require('./locations')
attachFastClick(document.body)
var activeDate = DateTime.today()

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
listAvailabilityForDate(activeDate).done(function () {
    if ($window.height() === $document.height()) loadMoreResults()
})

initJumpToDate()

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
    activeDate = activeDate.plusDays(1)
    listAvailabilityForDate(activeDate)
}

function listAvailabilityForDate(requestedDateTime) {
    var requestedDate = requestedDateTime.toISODateString()
    $('#schedule').addClass('loading')
    return $.getJSON('/courts?date=' + requestedDate, function (allDataWithDate) {
        var deltaMin = parseInt((new Date().getTime() - allDataWithDate.timestamp) / 60000, 10)
        var timeStamp = 'päivitetty ' + deltaMin + ' minuuttia sitten'
        var data = allDataWithDate.freeCourts
        $('#schedule').removeClass('loading')
            //.append($timeStamp)
            .append(groupBySortedAsList(data, 'date').filter(function (x) {
                return x.key === requestedDate
            }).map(function (dateObject) {
                return toDateSection(dateObject, timeStamp)
            }).join(''))
    })
}

function renderLocations(locations) {
    $('.information tbody').html(locations.map(function (obj) {
        var address = obj.address
        var url = obj.url
        var title = obj.title
        var tel = obj.tel
        return '<tr><td class="place">' + (url ? '<a target="_blank" href="' + url + '">' + title + '</a>' : title) + '</td>' +
            '<td class="address"><a target="_blank" href="http://maps.google.com/?q=' + address + '">' + address + '</a></td>' +
            '<td class="tel"><a href="tel:' + tel + '">' + tel + '</a></td></tr>'
    }).join(''))
}

function toDateSection(dateObject, timeStamp) {
    var isoDate = dateObject.key
    var times = dateObject.val
    return '<h4>' + DateFormat.format(DateTime.fromIsoDate(isoDate), DateFormat.patterns.FiWeekdayDatePattern, DateLocale.FI) + '</h4>' +
        '<div class="timestamp">' + timeStamp + '</div>' +
        groupBySortedAsList(times, 'time').map(toTimeRow).join('')
}

function toTimeRow(timeObject) {
    var isoTime = timeObject.key
    var fields = timeObject.val
    return '<div class="timeRow"><span class="timeWrapper"><span class="time">' + isoTime + '</span></span>' +
        groupBySortedAsList(fields, 'location').map(toLocationButtonGroup).join('') + '</div>'
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
    return '<button type="button" class="fieldLabel btn ' + field.location + ' ' + (field.isBubble ? 'bubble' : '') + ' btn-xs">' + field.field + '</button>'
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

function initJumpToDate() {
    $('.jumpToDate').html(_.range(1, 60).map(function (delta) {
        var dateTime = new DateTime().plusDays(delta)
        var format = DateFormat.format(dateTime, DateFormat.patterns.FiWeekdayDatePattern, DateLocale.FI)
        return '<option value="' + dateTime.toISODateString() + '">' + format + '</option>'
    }).join('\n')).change(function () {
        activeDate = DateTime.fromIsoDate($(this).val())
        $('#schedule').empty()
        listAvailabilityForDate(activeDate)
    })
}
