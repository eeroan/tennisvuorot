var $ = require('jquery')
var _ = require('lodash')
var DateTime = require('dateutils').DateTime
var DateFormat = require('dateutils').DateFormat
var DateLocale = require('dateutils').DateLocale
var attachFastClick = require('fastclick')
var locationTable = require('./locationTable')
var navigation = require('./navigation')
attachFastClick(document.body)
var activeDate = DateTime.today()
var $window = $(window)
var $document = $(document)

var didScroll = false
var alreadyLoadingMoreResults = false
$(window).scroll(function () { didScroll = true });

setInterval(function () {
    if (didScroll) {
        didScroll = false;
        if(!alreadyLoadingMoreResults && $window.scrollTop() + $window.height() > $document.height() - 400) {
            loadMoreResults()
        }
    }
}, 250)

navigation.init()
locationTable.init()
listAvailabilityForDate(activeDate)
initJumpToDate()

$('#schedule').on('click', '.locationLabel', function (e) {
    var $locationLabel = $(e.currentTarget)
    $locationLabel.parent().toggleClass('showDetails')
})

function loadMoreResults() {
    if(!alreadyLoadingMoreResults) {
        alreadyLoadingMoreResults = true
        activeDate = activeDate.plusDays(1)
        listAvailabilityForDate(activeDate)
    }
}

function listAvailabilityForDate(requestedDateTime) {
    var requestedDate = requestedDateTime.toISODateString()
    $('#schedule').addClass('loading')
    return $.getJSON('/courts?date=' + requestedDate, function (allDataWithDate) {
        alreadyLoadingMoreResults = false
        var deltaMin = parseInt((new Date().getTime() - allDataWithDate.timestamp) / 60000, 10)
        var timeStamp = 'päivitetty ' + deltaMin + ' minuuttia sitten'
        var data = allDataWithDate.freeCourts
        $('#schedule').removeClass('loading')
            //.append($timeStamp)
            .append(groupBySortedAsList(data, 'date').filter(function (x) {
                return x.key === requestedDate
            }).map(function (dateObject) {
                return toDateSection(dateObject, timeStamp)
            }).join(''))
        if ($window.height() === $document.height()) loadMoreResults()
    })
}

function toDateSection(dateObject, timeStamp) {
    var isoDate = dateObject.key
    var times = dateObject.val
    return '<h4>' + DateFormat.format(DateTime.fromIsoDate(isoDate), DateFormat.patterns.FiWeekdayDatePattern, DateLocale.FI) + '</h4>' +
        '<div class="timestamp">' + timeStamp + '</div>' +
        groupBySortedAsList(times, 'time').map(toTimeRow).join('')
}

function toTimeRow(timeObject) {
    var isoTime = timeObject.key
    var fields = timeObject.val
    return '<div class="timeRow"><span class="timeWrapper"><span class="time">' + isoTime + '</span></span>' +
        groupBySortedAsList(fields, 'location').map(toLocationButtonGroup).join('') + '</div>'
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
    return '<button type="button" class="fieldLabel btn ' + field.location + ' ' + field.type  + ' btn-xs">' + field.field + '</button>'
}

function groupBySortedAsList(list, key) {
    return _.sortBy(_.map(_.groupBy(list, key), objectToArray), 'key')
}

function objectToArray(val, key) {
    return {key: key, val: val}
}

function initJumpToDate() {
    $('.jumpToDate').html(_.range(1, 60).map(function (delta) {
        var dateTime = new DateTime().plusDays(delta)
        var format = DateFormat.format(dateTime, DateFormat.patterns.FiWeekdayDatePattern, DateLocale.FI)
        return '<option value="' + dateTime.toISODateString() + '">' + format + '</option>'
    }).join('\n')).change(function () {
        activeDate = DateTime.fromIsoDate($(this).val())
        $('#schedule').empty()
        alreadyLoadingMoreResults = true
        listAvailabilityForDate(activeDate)
    })
}
