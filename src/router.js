#!/usr/bin/env node
var express = require('express')
var route = express()
var babelify = require('express-babelify-middleware')
var dao = require('./dao')
route.use('/front.min.js', babelify(__dirname + '/../public/front.js'))
route.use(express.static(__dirname + '/../public'))
route.get('/courts', dao.freeCourts)

module.exports = route
