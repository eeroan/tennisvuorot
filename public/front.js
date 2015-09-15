var DateTime = require('dateutils').DateTime
var DateFormat = require('dateutils').DateFormat
var DateLocale = require('dateutils').DateLocale
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
    _.once(renderMap)()
})

$.getJSON('/courts?date=' + todayIsoDate(1), function (allData) {
    var data = _.flatten((_.map(allData, _.identity)))
    $('.schedule').html(groupBySortedAsList(data, 'date').map(toDateSection).join(''))
})

$('.schedule').on('click', '.locationLabel', function (e) {
    var $locationLabel = $(e.currentTarget)
    $locationLabel.toggle()
    $locationLabel.parent().find('.fieldLabel').toggle()
})
$.getJSON('/locations', function (locations) {
    window.locations = locations
    $('.information tbody').html(locations.map(function (obj) {
        var address = obj.address
        var url = obj.url
        var title = obj.title
        var tel = obj.tel
        return '<tr><td class="place">' + (url ? '<a target="_blank" href="' + url + '">' + title + '</a>' : title) + '</td>' +
            '<td><a target="_blank" href="http://maps.google.com/?q=' + address + '">' + address + '</a></td>' +
            '<td><a href="tel:' + tel + '">' + tel + '</a></td></tr>'
    }).join(''))
})

function todayIsoDate(delta) {
    var now = new Date()
    if (delta) {
        now.setDate(now.getDate() + delta)
    }
    var isoDateTime = now.toISOString()
    return isoDateTime.split('T')[0]
}

function renderMap() {
    var bounds = new google.maps.LatLngBounds()
    var map = new google.maps.Map(document.getElementById("map_canvas"), {mapTypeId: 'roadmap'})
    map.setTilt(45)
    var infoWindow = new google.maps.InfoWindow()
    locations.filter(function (loc) {
        return loc.lat !== null
    }).forEach(function (loc, i) {
        var position = new google.maps.LatLng(loc.lat, loc.lng)
        bounds.extend(position)
        var marker = new google.maps.Marker({
            position: position,
            map:      map,
            title:    loc.title
        })
        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
                infoWindow.setContent(locationTooltip(loc))
                infoWindow.open(map, marker)
            }
        })(marker, i))
        map.fitBounds(bounds)
    })
}

function locationTooltip(location) {
    return '<h3>' + location.title + '</h3><p><a href="' + location.url + '">Varausjärjestelmä</a></p>' +
        '<p>' + location.address + '</p>' +
        '<p><a href="tel:' + location.tel + '">' + location.tel + '</a></p>'
}

function toDateSection(dateObject) {
    var isoDate = dateObject.key
    var times = dateObject.val
    return '<h4>' + DateFormat.format(DateTime.fromIsoDate(isoDate), DateFormat.patterns.FiWeekdayDatePattern,  DateLocale.FI) + '</h4>' +
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
