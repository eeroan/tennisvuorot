#!/usr/bin/env node
var express = require('express')
var app = express()
var crawler = require('./src/crawler')

app.use(express.static(__dirname + '/public'))

app.get('/courts', function (req, res) {
    var now = new Date()
    var isoDateTime = now.toISOString();
    var isoDate = isoDateTime.split('T')[0]
    crawler.getMeilahti(isoDate).onValue(function(obj) {
        res.send(obj)
    })
});
var port = 5000
var server = app.listen(port, function() {console.log('Server started at localhost:' + port)})
