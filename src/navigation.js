const $ = require('jquery')
const _ = require('lodash')
const mapView = require('./mapView')
const noUiSlider = require('nouislider');
const format = require('./format')
const typeToggles = ['bubble', 'outdoor', 'indoor', 'single']
const defaults = {
    fieldToggles: {},
    typeToggles:  {},
    start:        60,
    end:          235,
    collapsed:    false
}
var settings = loadFilters() || defaults

module.exports = {
    init: initNavigation
}

var mapMissing = true

function reportSettings(settings) {
    return `${activeFilters(settings).sort().join(' ')} ${settings.start}-${settings.end} ${settings.collapsed ? 'collapsed' : ''}`
}

function initNavigation() {
    activeFilters(settings).forEach(name => { $('#' + name).addClass('inactive')})
    $('#single').prop('checked', 'single' in settings.typeToggles)
    setContainerFilterClasses()
    $('.filters button, #single').click(e => {
        const $button = $(e.target)
        $button.toggleClass('inactive')
        const id = $button.prop('id')
        toggleObj(id, settings)
        setTimeout(() => {
            $('#schedule').toggleClass(id)
            saveFilters()
        }, 1)
    })
    $('.toggleInformation').click(() => {
        ga('send', 'event', 'Info', 'open')
        $('.information').show()
    })
    $('.toggleMapInformation').click(() => {
        $('#map_wrapper').show()
        if (mapMissing) {
            mapView.renderMap()
            mapMissing = false
        }
    })
    toggleNavi()
    $('.toggleFilters, .filters .close').click(e => {
        settings.collapsed = $(e.target).hasClass('close')
        toggleNavi()
        saveFilters()
    })
    initTimeFilter()
    initFeedback()
}

function initFeedback() {
    $('.feedbackForm').on('submit', e => {
        e.preventDefault()
        var $feedback = $('.feedback')
        var text = $feedback.val()
        ga('send', 'event', 'Feedback', text)
        $feedback.val('')
        $('.submitFeedback').prop('disabled', true).text('Palaute lähetetty')
    })
    return false
}

function toggleNavi() { $('.filters, #schedule').toggleClass('collapsed', settings.collapsed) }

function toggleObj(key, objRoot) {
    var obj = (typeToggles.indexOf(key) >= 0) ? objRoot.typeToggles : objRoot.fieldToggles
    if (key in obj) delete obj[key]
    else obj[key] = true
    console.log(settings)
    console.log(obj)

}

var all = _.range(60, 235, 5)

function initTimeFilter() {
    var slider = document.getElementById('slider')
    noUiSlider.create(slider, {
        start:   [settings.start, settings.end],
        step:    5,
        connect: true,
        range:   {
            'min': 60,
            'max': 230
        },
        format:  {
            to:   formatTime,
            from: x => x
        }
    })
    slider.noUiSlider.on('update', (values, endTime) => {
        var isStart = !endTime
        setStartAndEndLabels(isStart, parseTime(values[endTime]))
    })
    slider.noUiSlider.on('change', () => {
        setContainerFilterClasses()
        saveFilters()
    })
}
var $rangeLabel = $('.rangeLabel')

function setStartAndEndLabels(isStart, val) {
    if (isStart) settings.start = Number(val)
    else settings.end = Number(val)
    $rangeLabel.html(formatTime(settings.start) + '-' + formatTime(settings.end))
}

function parseTime(isoTime) {
    var hm = isoTime.split(':')
    return String(format.formatTimeKey(hm))
}

function formatTime(val) {
    var hour = Math.floor(val / 10)
    var min = Math.round(val % 10 * .6)
    return hour + ':' + min + '0'
}

var $schedule = $('#schedule')

function setContainerFilterClasses() {
    var hiddenTimes = all.filter(time => time < settings.start || time > settings.end)
    $schedule.prop('class', activeFilters(settings).concat(hiddenTimes.map(time => 'h' + time)).join(' '))
}

function activeFilters(settings) { return _.map(_.extend({}, settings.fieldToggles, settings.typeToggles), (v, k) => k) }

function saveFilters() {
    localStorage.setItem('filters', JSON.stringify({
        toggles:   _.extend({}, settings.fieldToggles, settings.typeToggles),
        start:     settings.start,
        end:       settings.end,
        collapsed: settings.collapsed
    }))
}

function loadFilters() {
    var jsonString = localStorage.getItem('filters')
    var parsedJson = JSON.parse(jsonString)
    if (!parsedJson) return null
    if (jsonString) ga('send', 'event', 'User settings', reportSettings(parsedJson))
    return {
        fieldToggles: _.omit(parsedJson.toggles, typeToggles),
        typeToggles:  _.pick(parsedJson.toggles, typeToggles),
        start:        parsedJson.start,
        end:          parsedJson.end,
        collapsed:    parsedJson.collapsed
    }
}
