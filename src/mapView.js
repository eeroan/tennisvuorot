var locations = require('../generated/locations')

module.exports = {
    renderMap
}

const locationTooltip = location => `<h3>${location.title}</h3>${linksMarkup(location)}`

function renderMap() {
    const bounds = new google.maps.LatLngBounds()
    const map = new google.maps.Map(document.getElementById('map_canvas'), {mapTypeId: 'roadmap'})
   // map.setTilt(45)
    const infoWindow = new google.maps.InfoWindow()
    locations.filter(function (loc) {
        return loc.lat !== null
    }).forEach((loc, i) => {
        const position = new google.maps.LatLng(loc.lat, loc.lng)
        bounds.extend(position)
        const marker = new google.maps.Marker({
            position: position,
            map:      map,
            title:    loc.title,
            icon:     '/tennisvuorot-marker.png'
        })
        google.maps.event.addListener(marker, 'click', ((marker, i) =>
            () => {
                infoWindow.setContent(locationTooltip(loc))
                infoWindow.open(map, marker)
            }
        )(marker, i))
        map.fitBounds(bounds)
    })
}


function linksMarkup(locationObject) {
    const address = locationObject.address
    const url = locationObject.url
    const tel = locationObject.tel
    const systemLink = (url ? `<div><a target="_blank" href="${url}">Siirry constausjärjestelmään</a></div>` : '')
    const addressLink = `<div><a class="map" target="_blank" href="http://maps.google.com/?q=${address}">${address}</a></div>`
    const telLink = `<div><a class="tel" href="tel:${tel}">${tel}</a></div>`
    return `<div class="links">${telLink}${addressLink}${systemLink}</div>`
}
