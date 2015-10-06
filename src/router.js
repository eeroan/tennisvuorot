#!/usr/bin/env node
var express = require('express')
var request = require('request')
var route = express()
var slSystems = require('./slSystemsCrawler')
var Bacon = require('baconjs').Bacon
var _ = require('lodash')
var courts = require('../public/courts')
var webTimmi = require('./webTimmiCrawler')
var browserify = require('browserify-middleware')
var MongoClient = require('mongodb').MongoClient
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test';
route.use('/front.min.js', browserify(__dirname + '/../public/front.js'))
route.use(express.static(__dirname + '/../public'))
var expirationInMin = 120
route.get('/courts', freeCourts)
route.get('/locations', locations)

module.exports = route

function freeCourts(req, res) {
    var isoDate = req.query.date
    var forceRefresh = req.query.forceRefresh || false
    var currentTimeMinusDelta = new Date().getTime() - 1000 * 60 * expirationInMin
    if (forceRefresh) {
        console.log('fetching from servers for date', isoDate)
        fetch(isoDate).onValue(function (obj) {
            upsertToMongo(isoDate, obj)
            res.send(obj)
        })
    } else {
        getFromMongo(isoDate, function (err, data) {
            if (err) {
                res.status(500).send(err)
            } else if (data.length > 0 && data[0].timestamp > currentTimeMinusDelta) {
                console.log('fetching from db for date', isoDate)
                res.send(data)
            } else {
                console.log('fetching from servers for date', isoDate)
                fetch(isoDate).onValue(function (obj) {
                    upsertToMongo(isoDate, obj)
                    res.send(obj)
                })
            }
        })
    }
}

function getFromMongo(isoDate, callback) {
    MongoClient.connect(mongoUri, function (err, db) {
        var collection = db.collection('tennishelsinki')
        var filter = {date: new Date(isoDate)}
        collection.find(filter).toArray(function (err, docs) {
            var transformedDoc = docs.map(function (doc) {
                doc.created = doc._id.getTimestamp && doc._id.getTimestamp().toISOString()
                return doc
            })
            callback(err, transformedDoc)
            db.close()
        })
    })
}

function upsertToMongo(isoDate, obj) {
    MongoClient.connect(mongoUri, function (err, db) {
        var collection = db.collection('tennishelsinki')
        var date = new Date(isoDate)
        collection.updateOne({date: date}, {
            date:       date,
            freeCourts: obj.freeCourts,
            timestamp:  obj.timestamp
        }, {
            upsert: true
        }, function (err, rs) {
            console.log(err, rs && rs.result)
            db.close()
        })
    })
}

function fetch(isoDate) {
    return Bacon.combineAsArray([
        slSystems.getMeilahti,
        slSystems.getHerttoniemi,
        slSystems.getKulosaari,
        slSystems.getMerihaka,
        webTimmi.getAll].map(function (fn) { return fn(isoDate) }))
        .map(function (allData) {
            return {
                freeCourts: _.flatten(allData).map(function (reservation) {
                    reservation.isBubble = /kupla/i.test(reservation.field)
                    return reservation
                }),
                timestamp:  new Date().getTime()
            }
        })
}

function locations(req, res) {
    Bacon.combineAsArray(_.map(courts, function (val, key) {
        return getLocation(val.address).map(function (location) {
            return _.extend({title: key}, location, val)
        })
    })).onValue(function (val) { res.send(val) })
}

function getLocation(address) {
    return Bacon.fromNodeCallback(request.get, {
        url: 'http://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&sensor=false'
    }).map('.body').map(JSON.parse).map('.results.0.geometry.location')
}
