#!/usr/bin/env node
var express = require('express')
var route = express()
var browserify = require('browserify-middleware')
var dao = require('./dao')
route.use('/front.min.js', browserify(__dirname + '/../public/front.js'))
route.use(express.static(__dirname + '/../public'))
route.get('/courts', dao.freeCourts)
route.get('/locations', dao.locations)

module.exports = route
