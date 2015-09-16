var locations = require('./locations')

module.exports = {
    renderMap: renderMap
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
