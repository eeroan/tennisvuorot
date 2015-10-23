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
var all = _.range(60,235,5)
function initTimeFilter($container, defaultValue) {
    $container.html(_.range(6, 23).map(function (hour) {
        hour = (hour > 9 ? '' : '0') + hour
        function extracted(min) {
            return '<option value="' + (Number(hour) * 10 + (Number(min) / 6)) + '" ' + (defaultValue === (hour + min) ? 'selected' : '') + '>' + hour + ':' + min + '</option>'
        }

        return extracted('00') + extracted('30')
    }).join('\n')).change(function () {
        var val = $(this).val()
        var name = $(this).prop('name')
        if(name === 'start') start = val
        else end = val
        var hiddenTimes = all.filter(function (time) {
            return time < start || time > end
        })
        $('#schedule').prop('class', _.map(toggles, function (v, k) { return k }).concat(hiddenTimes.map(function (time) { return 'h' +time })).join(' '))
    })
}
