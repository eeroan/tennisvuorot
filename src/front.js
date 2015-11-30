var $ = require('jquery')
var _ = require('lodash')
var DateTime = require('dateutils').DateTime
var DateFormat = require('dateutils').DateFormat
var DateLocale = require('dateutils').DateLocale
var attachFastClick = require('fastclick')
var navigation = require('./navigation')
attachFastClick(document.body)
var $window = $(window)
var $document = $(document)
var markupForDateRange = require('./markupForDateRange')
var locations = require('./locations')
const format = require('./format')
var didScroll = false
var alreadyLoadingMoreResults = false
var today = DateTime.fromIsoDate(window.serverDate)
var activeDate = today.plusDays(2)
$(window).scroll(() => { didScroll = true })

setInterval(() => {
    if (didScroll) {
        didScroll = false
        if (!alreadyLoadingMoreResults && $window.scrollTop() + $window.height() > $document.height() - 400) {
            loadMoreResults(5)
            ga('send', 'event', 'Scroll to end', today.distanceInDays(activeDate))
        }
    }
}, 250)

navigation.init()
listAvailabilityForActiveDate(30)
initJumpToDate()
var $reservationModal = $('.reservationModal')
$('#schedule').on('click', '.locationLabel, .close', e => {
    var $clickArea = $(e.currentTarget)
    var opened = $clickArea.hasClass('locationLabel')
    if (opened) {
        var $locationBoxes = $clickArea.closest('.locationBoxes')
        var fields = $locationBoxes.data('fields')
        $reservationModal.html(modal(fields)).show()
    } else {
        $reservationModal.hide()
    }
    ga('send', 'event', 'Reservation', opened ? 'open' : 'close')
})

$('.locationMap .close, .information .close').click(e => $(e.currentTarget).parents('.modal').hide())

function loadMoreResults(days) {
    if (!alreadyLoadingMoreResults) {
        alreadyLoadingMoreResults = true
        listAvailabilityForActiveDate(days)
    }
}

function modal(obj) {
    var dateTime = DateTime.fromIsoDate(obj.date)
    var currentLocation = obj.location
    var locationObject = locations.find(location => location.title === currentLocation)

    return `<h3>${currentLocation} ${format.formatDate(dateTime)} klo ${obj.time}</h3>
        ${obj.fields.map(toButtonMarkup).join('')}
        ${linksMarkup(locationObject)}
        <div class="close">&times;</div>`

    function toButtonMarkup(field) {
        return `<button type="button" class="fieldLabel ${obj.location} ${field.type} ${format.durationClass(field.doubleLesson)}">${field.field}, ${format.formatPrice(field.price)}</button>`
    }
}

function linksMarkup(locationObject) {
    var address = locationObject.address
    var url = locationObject.url
    var tel = locationObject.tel
    return `<div class="links"><div><a class="tel" href="tel:${tel}">${tel}</a></div>
    <div><a class="map" target="_blank" href="http://maps.google.com/?q=${address}">${address}</a></div>` +
        (url ? `<div><a target="_blank" href="${url}">Siirry varausjärjestelmään</a></div>` : '') + '</div>'
}

function listAvailabilityForActiveDate(days) {
    var requestedDate = activeDate.toISODateString()
    activeDate = activeDate.plusDays(days - 1)
    $('#schedule').addClass('loading')
    alreadyLoadingMoreResults = true
    return $.getJSON(`/courts?date=${requestedDate}&days=${days}&refresh=${window.refresh}`, allDataWithDates => {
        $('#schedule').removeClass('loading').append(markupForDateRange(allDataWithDates, today))
        alreadyLoadingMoreResults = false
    })
}

function initJumpToDate() {
    $('.jumpToDate').html(_.range(1, 60).map(delta => {
        var dateTime = today.plusDays(delta)
        var format = DateFormat.format(dateTime, DateFormat.patterns.FiWeekdayDatePattern, DateLocale.FI)
        return `<option value="${dateTime.toISODateString()}">${format}</option>`
    }).join('\n')).change(e => {
        activeDate = DateTime.fromIsoDate($(e.currentTarget).val())
        $('#schedule').empty()
        alreadyLoadingMoreResults = true
        listAvailabilityForActiveDate(2)
    })
}
