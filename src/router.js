#!/usr/bin/env node
var express = require('express')
var route = express()
var babelify = require('express-babelify-middleware')
var dao = require('./dao/dao')
var calendarEvent = require('./calendarEvent')
var mainPage = require('./mainPage')

route.use('/front.min.js', babelify(__dirname + '/front.js'))
route.use('/history.min.js', babelify(__dirname + '/history/history.front.js'))
route.get('/courts', dao.sendFreeCourts)
route.use(express.static(__dirname + '/../public'))
route.get(['/historia', '/historia/:location'], history.historyResponse)
route.get('/calendar', calendarEvent.show)
route.get('/', mainPage.show)
module.exports = route
