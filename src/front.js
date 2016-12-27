const DateTime = require('dateutils').DateTime
const attachFastClick = require('fastclick')
const navigation = require('./navigation')
attachFastClick(document.body)
const markupForDateRange = require('./markupForDateRange')
const locations = require('../generated/locations')
const format = require('./format')
let didScroll = false
let alreadyLoadingMoreResults = false
const today = DateTime.fromIsoDate(window.serverDate)
let activeDate = today.plusDays(2)
const body = document.body
window.addEventListener('scroll', () => {
    didScroll = true
})
setInterval(() => {
    if(didScroll) {
        didScroll = false
        if(!alreadyLoadingMoreResults && body.scrollTop + window.innerHeight > body.scrollHeight - 400) {
            loadMoreResults(5)
            ga('send', 'event', 'Scroll to end', today.distanceInDays(activeDate))
        }
    }
}, 250)
const schedule = document.getElementById('schedule')
navigation.init(bindEsc)
listAvailabilityForActiveDate(30)
const reservationModal = document.querySelector('.reservationModal')
reservationModal.addEventListener('click', e => {
    const clickArea = e.target
    if(clickArea.classList.contains('close')) {
        reservationModal.style.display = 'none'
        unbindEsc()
    }
})
schedule.addEventListener('click', e => {
    const clickArea = e.target
    const openAction = clickArea.classList.contains('locationLabel')
    if(openAction) {
        const locationBoxes = clickArea.parentNode
        const obj = JSON.parse(locationBoxes.getAttribute('data-fields'))
        const date = obj.date
        const time = obj.time
        const fields = obj.fields
        const location = obj.location
        reservationModal.innerHTML = reservationModalMarkup(date, time, fields, location)
        reservationModal.style.display = 'block'
        const distance = today.distanceInDays(DateTime.fromIsoDate(date))
        ga('send', 'event', 'Reservation', distance)
        bindEsc()
    }
})

elems('.locationMap .close, .information .close')
    .forEach(el => el.addEventListener('click', e => {
        e.target.parentNode.style.display = 'none'
        unbindEsc()
    }))

function loadMoreResults(days) {
    if(!alreadyLoadingMoreResults) {
        alreadyLoadingMoreResults = true
        listAvailabilityForActiveDate(days)
    }
}

function reservationModalMarkup(date, time, fields, selectedLocation) {
    const dateTime = DateTime.fromIsoDate(date)
    const locationObject = locations.find(loc => loc.title === selectedLocation)
    const address = locationObject.address
    const url = locationObject.url
    const tel = locationObject.tel
    const title = locationObject.title
    return `<h2>${selectedLocation}</h2> <p>${format.formatDate(dateTime)} klo ${time}</p>
        <h3>Lisää kalenteriin</h3> <div class="fields">${fields.map(toButtonMarkup).join('')}</div>
        <h3>Tiedot</h3>
        ${linksMarkup(address, url, tel, title)}
        <div class="close">&times;</div>`

    function toButtonMarkup(field) {
        const urlParams = encodeUrl({
            location: selectedLocation,
            field: field.field,
            price: field.price,
            tel: tel,
            date: date,
            time: time,
            address: address,
            url: url
        })
        const classes = [
            'button',
            'fieldLabel',
            selectedLocation,
            field.type,
            format.durationClass(field.doubleLesson)
        ].join(' ')
        return `<a href="/calendar?${urlParams}" class="${classes}">${field.field}<br/>${format.formatPrice(field.price)}</a>`
    }
}

function linksMarkup(address, url, tel, title) {
    return `<div class="links"><div><a class="tel"
    onclick="ga('send', 'event', 'Telephone', '${title}'); return true;" href="tel:${tel}">${tel}</a></div>
    <div><a class="map" target="_blank"
    onclick="ga('send', 'event', 'Map', '${title}'); return true;" href="http://maps.google.com/?q=${address}">${address}</a></div>` +
        (url ? `<div><a target="_blank" onclick="ga('send', 'event', 'Booking', '${title}'); return true;" href="${url}">Siirry varausjärjestelmään</a></div>` : '') + '</div>'
}

function listAvailabilityForActiveDate(days) {
    const requestedDate = activeDate.toISODateString()
    activeDate = activeDate.plusDays(days - 1)
    schedule.classList.add('loading')
    alreadyLoadingMoreResults = true
    const urlParams = encodeUrl({
        date: requestedDate,
        days: days,
        refresh: window.refresh
    })
    getJson(`/courts?${urlParams}`, allDataWithDates => {
        schedule.classList.remove('loading')
        schedule.innerHTML += markupForDateRange(allDataWithDates, today)
        alreadyLoadingMoreResults = false
    })
}

function getJson(url, cb) {
    const request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.onload = () => {
        if(request.status >= 200 && request.status < 400) {
            cb(JSON.parse(request.responseText))
        } else {
            console.error('Error with ajax request')
        }
    }
    request.onerror = () => console.error('There was a connection error of some sort')
    request.send()
}

function encodeUrl(obj) {
    return encodeURI(Object.keys(obj).map(k=>k + '=' + obj[k]).join('&'))
}

function elems(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector))
}

function bindEsc() {
    document.body.classList.add('overlay')
    document.addEventListener('keyup', escListener)
}

function escListener(e) {
    if(e.keyCode === 27 && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        elems('.modal').forEach(el => el.style.display = 'none')
        unbindEsc()
    }
}

function unbindEsc() {
    document.body.classList.remove('overlay')
    document.removeEventListener('keyup', escListener)
}
