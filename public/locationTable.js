var $ = require('jquery')
var locations = require('./locations')

module.exports = {
    init: renderLocations
}

function renderLocations() {
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
