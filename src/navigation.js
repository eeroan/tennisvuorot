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

function initNavigation(bindEsc) {
    activeFilters(settings).forEach(name => {
        document.getElementById(name).classList.add('inactive')
    })
    const singleToggle = document.getElementById('single')
    singleToggle.checked = 'single' in settings.typeToggles
    setContainerFilterClasses()
    elems('.filters button').forEach(el => el.addEventListener('click', toggleEvent))
    singleToggle.addEventListener('click', toggleEvent)
    function toggleEvent(e) {
        const button = e.target
        button.classList.toggle('inactive')
        const id = button.id
        toggleObj(id, settings)
        setTimeout(() => {
            schedule.classList.toggle(id)
            saveFilters()
        }, 1)
    }

    elem('.toggleInformation').addEventListener('click',() => {
        window.ga('send', 'event', 'Info', 'open')
        elem('.information').style.display='block'
        bindEsc()
    })
    elem('.toggleMapInformation').addEventListener('click',() => {
        elem('#map_wrapper').style.display='block'
        if (mapMissing) {
            mapView.renderMap()
            mapMissing = false
        }
        bindEsc()
    })
    toggleNavi()
    elem('.toggleFilters').addEventListener('click', () => toggle(false))
    elem('.filters .close').addEventListener('click', () => toggle(true))

    function toggle(isCollapsed) {
        settings.collapsed = isCollapsed
        toggleNavi()
        saveFilters()
    }
    initTimeFilter()
    initFeedback()
}

function initFeedback() {
    elem('.feedbackForm').addEventListener('submit', e => {
        e.preventDefault()
        var feedback = elem('.feedback')
        var text = feedback.value
        window.ga('send', 'event', 'Feedback', text)
        feedback.value = ''
        const submitFeedback = elem('.submitFeedback')
        submitFeedback.disabled = true
        submitFeedback.textContent = 'Palaute lähetetty'
    })
    return false
}

function toggleNavi() {
    elem('.filters').classList.toggle('collapsed', settings.collapsed)
    schedule.classList.toggle('collapsed', settings.collapsed)
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
var $rangeLabel = elem('.rangeLabel')

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
    window.localStorage.setItem('filters', JSON.stringify({
        toggles:   _.extend({}, settings.fieldToggles, settings.typeToggles),
        start:     settings.start,
        end:       settings.end,
        collapsed: settings.collapsed
    }))
}

function loadFilters() {
    var jsonString = window.localStorage.getItem('filters')
    var parsedJson = JSON.parse(jsonString)
    if (!parsedJson) return null
    if (jsonString) window.ga('send', 'event', 'User settings', reportSettings(parsedJson))
    return {
        fieldToggles: _.omit(parsedJson.toggles, typeToggles),
        typeToggles:  _.pick(parsedJson.toggles, typeToggles),
        start:        parsedJson.start,
        end:          parsedJson.end,
        collapsed:    parsedJson.collapsed
    }
}

function elem(selector) { return document.querySelector(selector) }

function elems(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)) }
