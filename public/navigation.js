var $ = require('jquery')
var _ = require('lodash')
var mapView = require('./mapView')
var toggles = {}

module.exports = {
    init: initNavigation
}

function initNavigation() {
    $('.toggles button').click(function (e) {
        e.preventDefault()
        var $button = $(this)
        $button.toggleClass('inactive')
        var id = $button.prop('id')
        toggleObj(id, toggles)
        $('#schedule').toggleClass(id)
    })
    $('.toggleReservations').click(function () {
        $('nav li').removeClass('selected')
        $(this).addClass('selected')
        $('.detail').hide()
        $('.reservations').show()
    })

    $('.toggleInformation').click(function () {
        $('nav li').removeClass('selected')
        $(this).addClass('selected')
        $('.detail').hide()
        $('.information').show()
    })
    $('.toggleMapInformation').click(function () {
        $('nav li').removeClass('selected')
        $(this).addClass('selected')
        $('.detail').hide()
        $('#map_wrapper').show()
        _.once(mapView.renderMap)()
    })
    initTimeFilter($('.timeFilterStart'), '0600')
    initTimeFilter($('.timeFilterEnd'), '2230')
}

function toggleObj(key, obj) {
    if (key in obj) delete obj[key]
    else obj[key] = true
}
var start = 60
var end = 235
var all = _.range(60, 235, 5)

function initTimeFilter($container, defaultValue) {
    $('.timeFilterStart,.timeFilterEnd').on('change input', function () {
        var val = $(this).val()
        var name = $(this).prop('name')
        var isStart = name === 'start'
        setTimeFilterClasses(isStart, val)
        $('.rangeLabel').html(formatTime(start) + '-' + formatTime(end))
    })
}

function formatTime(val) {
    console.log('jee', val)
    var hour = Math.floor(val / 10)
    var min = val % 10 * .6
    console.log('juu', min)
    return hour + ':' + min + '0'
}

function setTimeFilterClasses(isStart, val) {
    if (isStart) start = Number(val)
    else end = Number(val)
    var hiddenTimes = all.filter(function (time) {
        return time < start || time > end
    })
    $('#schedule').prop('class', _.map(toggles, function (v, k) { return k }).concat(hiddenTimes.map(function (time) { return 'h' + time })).join(' '))
}
