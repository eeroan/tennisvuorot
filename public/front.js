$('.toggleInformation').click(function () {
    $('.information').slideToggle()
})

$.getJSON('/courts', function (allData) {
    var data = [].concat(allData.meilahti, allData.herttoniemi)
    $('.schedule').html(groupBySortedAsList(data, 'date').map(toDateSection).join(''))
})

$('.schedule').on('click', '.locationLabel', function (e) {
    console.log('click')
    var $locationLabel = $(e.currentTarget)
    $locationLabel.toggle()
    $locationLabel.parent().find('.fieldLabel').toggle()
})

function initialize() {
    $.getJSON('/locations', function (locations) {

        $('.information tbody').html(locations.map(function (obj) {
            var address = obj.address;
            var url = obj.url;
            var title = obj.title;
            var tel = obj.tel;
            return '<tr><td class="place">' + (url ? '<a target="_blank" href="' + url + '">' + title + '</a>' : title) + '</td>' + '<td><a target="_blank" href="http://maps.google.com/?q=' + address + '">' + address + '</a></td>' +
                '<td><a href="tel:' + tel + '">' + tel + '</a></td></tr>'
        }).join(''))

        var map
        var bounds = new google.maps.LatLngBounds()
        var mapOptions = {
            mapTypeId: 'roadmap'
        };

        // Display a map on the page
        map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
        map.setTilt(45)

        // Multiple Markers
        var locations2 = [
            {title: 'London Eye, London', lat: 51.503454, lng: -0.119562, info:'<div class="info_content">' +
            '<h3>London Eye</h3>' +
            '<p>The London Eye is a giant Ferris wheel situated on the banks of the River Thames. The entire structure is 135 metres (443 ft) tall and the wheel has a diameter of 120 metres (394 ft).</p>' + '</div>'},
            {title:'Palace of Westminster, London', lat: 51.499633,lng: -0.124755, info:'<div class="info_content">' +
            '<h3>Palace of Westminster</h3>' +
            '<p>The Palace of Westminster is the meeting place of the House of Commons and the House of Lords, the two houses of the Parliament of the United Kingdom. Commonly known as the Houses of Parliament after its tenants.</p>' +
            '</div>'}
        ];

        // Display multiple markers on a map
        var infoWindow = new google.maps.InfoWindow()

        locations2.forEach(function(loc, i) {
        // Loop through our array of markers & place each one on the map
            var position = new google.maps.LatLng(loc.lat, loc.lng);
            bounds.extend(position);
            var marker = new google.maps.Marker({
                position: position,
                map: map,
                title: loc.title
            });

            // Allow each marker to have an info window
            google.maps.event.addListener(marker, 'click', (function (marker, i) {
                return function () {
                    infoWindow.setContent(loc.info);
                    infoWindow.open(map, marker);
                }
            })(marker, i));

            // Automatically center the map fitting all markers on the screen
            map.fitBounds(bounds);
        })

        // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
        var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function (event) {
            this.setZoom(14);
            google.maps.event.removeListener(boundsListener);
        });
    })
}

function toDateSection(dateObject) {
    var isoDate = dateObject.key
    var times = dateObject.val
    return '<h4>' + new Date(isoDate).toDateString() + '</h4>' +
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
    return '<span class="locationBoxes"><button type="button" class="locationLabel btn btn-' +
        (location === 'meilahti' ? 'primary' : 'success') +
        ' btn-xs">' + location + ' (' + fields.length + ')</button>' +
        fields.map(toButtonMarkup).join('') + '</span>'
}

function toButtonMarkup(field) {
    return '<button type="button" class="fieldLabel btn btn-' +
        (field.location === 'meilahti' ? 'primary' : 'success') +
        ' btn-xs">' + field.field + '</button>'
}

function groupBySortedAsList(list, key) {
    return _.sortBy(_.map(_.groupBy(list, key), objectToArray), 'key')
}

function objectToArray(val, key) {
    return {key: key, val: val}
}
