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

var requestedDate = todayIsoDate(1)
$.getJSON('/courts?date=' + requestedDate, function (allData) {
    var data = _.flatten((_.map(allData, _.identity)))
    $('.schedule').html(groupBySortedAsList(data, 'date').filter(function(x) {
        return x.key === requestedDate
    }).map(toDateSection).join(''))
})

$('.schedule').on('click', '.locationLabel', function (e) {
    var $locationLabel = $(e.currentTarget)
    $locationLabel.toggle()
    $locationLabel.parent().find('.fieldLabel').toggle()
})

//$.getJSON('/locations', renderLocations)

renderLocations(locations())

function todayIsoDate(delta) {
    var now = new Date()
    if (delta) {
        now.setDate(now.getDate() + delta)
    }
    var isoDateTime = now.toISOString()
    return isoDateTime.split('T')[0]
}

function renderLocations(locations) {
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

function locations() {
    return [{
        "title":   "tali",
        "lat":     60.2134843,
        "lng":     24.876687,
        "url":     "https://webtimmi.talintenniskeskus.fi/login.do?loginName=GUEST&password=GUEST",
        "address": "Kutomokuja 4, 00381 Helsinki",
        "tel":     "09 5656050"
    }, {
        "title":   "taivallahti",
        "lat":     60.1728402,
        "lng":     24.9062133,
        "url":     "https://webtimmi.talintenniskeskus.fi/login.do?loginName=GUEST&password=GUEST",
        "address": "Hiekkarannantie 2, 00100 Helsinki",
        "tel":     "09 4770490"
    }, {
        "title":   "meilahti",
        "lat":     60.19008059999999,
        "lng":     24.8972334,
        "url":     "https://www.slsystems.fi/meilahti/",
        "address": "Meilahden Liikuntapuisto, 00250 Helsinki",
        "tel":     "050 3748068"
    }, {
        "title":   "puistola",
        "lat":     60.2706335,
        "lng":     25.033526,
        "url":     "https://oma.enkora.fi/tapanila/reservations2/reservations/25/-/-/-",
        "address": "Tapulikaupungintie 4, 00750 Helsinki",
        "tel":     "09 3462511"
    }, {
        "title":   "herttoniemi",
        "lat":     60.2089734,
        "lng":     25.0682377,
        "url":     "https://www.slsystems.fi/fite/",
        "address": "Varikkotie 4, 00900 Helsinki",
        "tel":     "09 341 7130"
    }, {
        "title":   "kulosaari",
        "lat":     60.1859158,
        "lng":     25.0006762,
        "url":     "http://www.slsystems.fi/puhoscenter/",
        "address": "Kulosaarentie 2, 00570 Helsinki",
        "tel":     "09 6211303"
    }, {
        "title":   "viikki",
        "lat":     60.23024509999999,
        "lng":     25.0249103,
        "tel":     "02941 58702",
        "address": "Maakaari 3, 00790 Helsinki"
    }, {
        "title":   "merihaka",
        "lat":     60.17964199999999,
        "lng":     24.9629867,
        "url":     "https://www.slsystems.fi/meripeli/",
        "address": "Haapaniemenkatu 14 B, 00530 Helsinki",
        "tel":     "01043 97 979"
    }, {
        "title":   "esport",
        "lat":     60.1767394,
        "lng":     24.7814655,
        "url":     "http://varaus.esportcenter.fi/index.php?pageId=11&func=mod_rc_v2&tac=",
        "address": "Koivu-Mankkaan tie 5, 02200 Espoo",
        "tel":     "09 502 4700"
    }, {
        "title":   "hiekkaharju",
        "lat":     60.3043802,
        "lng":     25.0522693,
        "url":     "https://www.slsystems.fi/hiekkaharjuntenniskeskus/",
        "address": "Tennistie 5, 01370 Vantaa",
        "tel":     "09 8731923"
    }, {"title": "kalastajatorppa", "tel": "010 423 9960", "address": "Kärkitie 4, 00330 Helsinki"}, {
        "title":   "laajasalo",
        "url":     "http://www.slsystems.fi/laajasalonpalloiluhallit/",
        "address": "Sarvastonkaari 23, 00840 Helsinki",
        "tel":     "09 6987654"
    }, {
        "title":   "varmatennis",
        "tel":     "+358 9 548 6101",
        "address": "Ruosilankuja 12, 00390 Helsinki"
    }, {"title": "metsälä", "address": "Krämertintie 6, 00620 Helsinki", "tel": "09 798 521"}, {
        "title":   "kaisaniemi",
        "lat":     60.1738527,
        "lng":     24.9442649,
        "url":     "https://www.slsystems.fi/fite/",
        "address": "Kaisaniemen puisto",
        "tel":     "09 341 7130"
    }]

}
