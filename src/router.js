#!/usr/bin/env node
var express = require('express')
var route = express()
var babelify = require('express-babelify-middleware')
var dao = require('./dao')
var _ = require('lodash')
var fs = require('fs')
route.use('/front.min.js', babelify(__dirname + '/../public/front.js'))
route.get('/courts', dao.sendFreeCourts)
route.use(express.static(__dirname + '/../public'))
var indexHtml = _.template(fs.readFileSync(__dirname + '/index.html', 'utf-8'))
route.get('/', (req, res) => {
    res.send(indexHtml({
        refresh: req.query.refresh==='true'
    }))
})

module.exports = route
