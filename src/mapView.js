const locations = require('../generated/locations')

module.exports = {
    renderMap
}

const locationTooltip = location => `<h3>${location.title}</h3>${linksMarkup(location)}`

function renderMap() {
    const map = L.map('map_canvas').fitWorld()
    L.tileLayer(
        'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
        {
            maxZoom: 18,
            id: 'mapbox/streets-v11'
        }).addTo(map)
    const LeafIcon = L.Icon.extend({
        options: {
            iconSize: [29, 36],
            iconAnchor: [15, 36],
            popupAnchor: [0, -20],
            shadowUrl: 'marker-shadow.png',
            shadowSize: [67, 66],
            shadowAnchor: [20, 65]
        }
    })
    const icon = new LeafIcon({iconUrl: 'tennisvuorot-marker.png'})
    const group = new L.featureGroup(locations.filter(loc => !isNaN(loc.lat)).map((loc, i) =>
        L.marker(loc, {icon}).addTo(map).bindPopup(locationTooltip(loc))))
    map.fitBounds(group.getBounds())
}


function linksMarkup(locationObject) {
    const address = locationObject.address
    const url = locationObject.url
    const tel = locationObject.tel
    const systemLink = (url ? `<div><a target="_blank" href="${url}">Siirry varausjärjestelmään</a></div>` : '')
    const addressLink = `<div><a class="map" target="_blank" href="http://maps.google.com/?q=${address}">${address}</a></div>`
    const telLink = `<div><a class="tel" href="tel:${tel}">${tel}</a></div>`
    return `<div class="links">${telLink}${addressLink}${systemLink}</div>`
}
