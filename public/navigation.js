var $ = require('jquery')
var _ = require('lodash')
var mapView = require('./mapView')
var noUiSlider = require('nouislider');
var toggles = {}

module.exports = {
    init: initNavigation
}

var mapMissing = true
function initNavigation() {
    $('.filters button, #single').click(function (e) {
        var $button = $(this)
        $button.toggleClass('inactive')
        var id = $button.prop('id')
        toggleObj(id, toggles)
        setTimeout(function () {
            $('#schedule').toggleClass(id)
        }, 1)
    })

    $('.toggleInformation').click(function () {
        $('.information').show()
    })
    $('.toggleMapInformation').click(function () {
        $('#map_wrapper').show()
        if (mapMissing) {
            mapView.renderMap()
            mapMissing = false
        }
    })
    $('.toggleFilters').click(function () {
        $('.filters').toggleClass('collapsed')
    })
    initTimeFilter()
}

function toggleObj(key, obj) {
    if (key in obj) delete obj[key]
    else obj[key] = true
}
var start = 60
var end = 235
var all = _.range(60, 235, 5)

function initTimeFilter() {
    var slider = document.getElementById('slider')
    noUiSlider.create(slider, {
        start:    [60, 230],
        step:     5,
        margin:   20,
        connect:  true,
        range:    {
            'min': 60,
            'max': 230
        },
        format:   {
            to:   formatTime,
            from: x => x
        }
    })
    slider.noUiSlider.on('update', function (values, endTime) {
        var isStart = !endTime
        setStartAndEndLabels(isStart, parseTime(values[endTime]))
    })
    slider.noUiSlider.on('change', function (values, endTime) {
        setTimeFilterClasses()
    })
}
var $rangeLabel = $('.rangeLabel')

function setStartAndEndLabels(isStart, val) {
    if (isStart) start = Number(val)
    else end = Number(val)
    $rangeLabel.html(formatTime(start) + '-' + formatTime(end))
}

function parseTime(isoTime) {
    console.log('parse',isoTime)
    var hm = isoTime.split(':')
    return String(Number(hm[0]) * 10 + Number(hm[1]) / 6)
}

function formatTime(val) {
    console.log('formt',arguments)
    var hour = Math.floor(val / 10)
    var min = Math.round(val % 10 * .6)
    return hour + ':' + min + '0'
}
var $schedule = $('#schedule')

function setTimeFilterClasses() {
    var hiddenTimes = all.filter(function (time) {
        return time < start || time > end
    })
    $schedule.prop('class', _.map(toggles, function (v, k) { return k }).concat(hiddenTimes.map(function (time) { return 'h' + time })).join(' '))
}

function saveFilters(obj) {
    localStorage.setItem('filters', JSON.stringify(obj))
}

function loadFilters() {
    return JSON.parse(localStorage.getItem('filters')) || {}
}
