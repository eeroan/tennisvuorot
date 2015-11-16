var locations = require('./locations')

module.exports = {
    renderMap: renderMap
}

function renderMap() {
    console.log('render')
    var bounds = new google.maps.LatLngBounds()
    var map = new google.maps.Map(document.getElementById("map_canvas"), {mapTypeId: 'roadmap'})
   // map.setTilt(45)
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
    return '<h3>' + location.title + '</h3>' +
        linksMarkup(location)
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
