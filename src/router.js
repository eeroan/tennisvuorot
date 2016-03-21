#!/usr/bin/env node
const express = require('express')
const route = express()
const babelify = require('express-babelify-middleware')
const dao = require('./dao/dao')
const calendarEvent = require('./calendarEvent')
const history = require('./history/history')
const mainPage = require('./mainPage/mainPage')

route.use('/front.min.js', babelify(__dirname + '/front.js'))
route.use('/history.min.js', babelify(__dirname + '/history/history.front.js'))
route.get('/courts', dao.sendFreeCourts)
route.use(express.static(__dirname + '/../public'))
route.get(['/historia', '/historia/:location'], history.historyResponse)
route.get('/calendar', calendarEvent.show)
route.get('/', mainPage.show)
module.exports = route
