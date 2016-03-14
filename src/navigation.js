const _ = require('lodash')
const mapView = require('./mapView')
const noUiSlider = require('nouislider')
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
var schedule = document.getElementById('schedule')

module.exports = {
    init: initNavigation
}

var mapMissing = true

function reportSettings(settings) {
    return `${activeFilters(settings).sort().join(' ')} ${settings.start}-${settings.end} ${settings.collapsed ? 'collapsed' : ''}`
}

function initNavigation() {
    activeFilters(settings).forEach(name => {
        document.getElementById(name).classList.add('inactive')
    })
    document.getElementById('single').checked = 'single' in settings.typeToggles
    setContainerFilterClasses()
    Array.prototype.forEach.call(document.querySelectorAll('.filters button'), el => el.addEventListener('click', toggleEvent))
    document.getElementById('single').addEventListener('click', toggleEvent)
    function toggleEvent(e) {
        const button = e.target
        button.classList.toggle('inactive')
        const id = button.id
        toggleObj(id, settings)
        setTimeout(() => {
            document.getElementById('schedule').classList.toggle(id)
            saveFilters()
        }, 1)
    }

    document.querySelector('.toggleInformation').addEventListener('click',() => {
        ga('send', 'event', 'Info', 'open')
        document.querySelector('.information').style.display='block'
    })
    document.querySelector('.toggleMapInformation').addEventListener('click',() => {
        document.querySelector('#map_wrapper').style.display='block'
        if (mapMissing) {
            mapView.renderMap()
            mapMissing = false
        }
    })
    toggleNavi()
    document.querySelector('.toggleFilters').addEventListener('click', () => toggle(false))
    document.querySelector('.filters .close').addEventListener('click', () => toggle(true))

    function toggle(isCollapsed) {
        settings.collapsed = isCollapsed
        toggleNavi()
        saveFilters()
    }
    initTimeFilter()
    initFeedback()
}

function initFeedback() {
    document.querySelector('.feedbackForm').addEventListener('submit', e => {
        e.preventDefault()
        var feedback = document.querySelector('.feedback')
        var text = feedback.value
        ga('send', 'event', 'Feedback', text)
        feedback.value = ''
        const submitFeedback = document.querySelector('.submitFeedback')
        submitFeedback.disabled = true
        submitFeedback.textContent = 'Palaute lähetetty'
    })
    return false
}

function toggleNavi() {
    document.querySelector('.filters').classList.toggle('collapsed', settings.collapsed)
    document.querySelector('#schedule').classList.toggle('collapsed', settings.collapsed)
}

function toggleObj(key, objRoot) {
    var obj = (typeToggles.indexOf(key) >= 0) ? objRoot.typeToggles : objRoot.fieldToggles
    if (key in obj) delete obj[key]
    else obj[key] = true

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
            to:   format.formatTime,
            from: x => x
        }
    })
    slider.noUiSlider.on('update', (values, endTime) => {
        var isStart = !endTime
        setStartAndEndLabels(isStart, format.parseTime(values[endTime]))
    })
    slider.noUiSlider.on('change', () => {
        setContainerFilterClasses()
        saveFilters()
    })
}
var $rangeLabel = document.querySelector('.rangeLabel')

function setStartAndEndLabels(isStart, val) {
    if (isStart) settings.start = Number(val)
    else settings.end = Number(val)
    $rangeLabel.innerHTML = format.formatTime(settings.start) + '-' + format.formatTime(settings.end)
}

function setContainerFilterClasses() {
    var hiddenTimes = all.filter(time => time < settings.start || time > settings.end)
    schedule.className = activeFilters(settings).concat(hiddenTimes.map(time => 'h' + time)).join(' ')
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
