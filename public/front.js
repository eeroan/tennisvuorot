var $ = require('jquery')
var _ = require('lodash')
var DateTime = require('dateutils').DateTime
var DateFormat = require('dateutils').DateFormat
var DateLocale = require('dateutils').DateLocale
var attachFastClick = require('fastclick')
var navigation = require('./navigation')
attachFastClick(document.body)
var activeDate = DateTime.today()
var $window = $(window)
var $document = $(document)
var markupForDateRange = require('./markupForDateRange')
var didScroll = false
var alreadyLoadingMoreResults = false
$(window).scroll(() => { didScroll = true })

setInterval(() => {
    if (didScroll) {
        didScroll = false
        if (!alreadyLoadingMoreResults && $window.scrollTop() + $window.height() > $document.height() - 400) {
            console.log('loading more')
            loadMoreResults(5)
        }
    }
}, 250)

navigation.init()
listAvailabilityForActiveDate(2, 30)
initJumpToDate()

$('#schedule').on('click', '.locationLabel, .close', e => {
    var $locationBoxes = $(e.currentTarget).parents('.locationBoxes')
    $locationBoxes.toggleClass('showDetails')
})

$('.locationMap .close').click(e => $(e.currentTarget).parents('.modal').hide())

function loadMoreResults(days) {
    if (!alreadyLoadingMoreResults) {
        alreadyLoadingMoreResults = true
        listAvailabilityForActiveDate(days)
    }
}

function listAvailabilityForActiveDate(days, daysTwo) {
    var requestedDate = activeDate.toISODateString()
    activeDate = activeDate.plusDays(days)
    $('#schedule').addClass('loading')
    alreadyLoadingMoreResults = true
    return $.getJSON(`/courts?date=${requestedDate}&days=${days}&refresh=${window.refresh}`, allDataWithDates => {
        $('#schedule').removeClass('loading').append(markupForDateRange(allDataWithDates))
        alreadyLoadingMoreResults = false
        if (daysTwo) loadMoreResults(daysTwo)
    })
}

function initJumpToDate() {
    $('.jumpToDate').html(_.range(1, 60).map(delta => {
        var dateTime = new DateTime().plusDays(delta)
        var format = DateFormat.format(dateTime, DateFormat.patterns.FiWeekdayDatePattern, DateLocale.FI)
        return `<option value="${dateTime.toISODateString()}">${format}</option>`
    }).join('\n')).change(e => {
        activeDate = DateTime.fromIsoDate($(e.currentTarget).val())
        $('#schedule').empty()
        alreadyLoadingMoreResults = true
        listAvailabilityForActiveDate(2)
    })
}
