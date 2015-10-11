#!/usr/bin/env node
var request = require('request')
var slSystems = require('./slSystemsCrawler')
var Bacon = require('baconjs').Bacon
var _ = require('lodash')
var courts = require('../public/courts')
var webTimmi = require('./webTimmiCrawler')
var DateTime = require('dateutils').DateTime
var MongoClient = require('mongodb').MongoClient
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test';

module.exports = {
    freeCourts:freeCourts,
    locations:locations,
    refresh:refresh
}

function freeCourts(req, res) {
    var isoDate = req.query.date
    var forceRefresh = req.query.forceRefresh || false

    if (forceRefresh) {
        refresh(isoDate, function (obj) { res.send(obj) })
    } else {
        getFromMongo(isoDate, function (err, data) {
            if (err) {
                res.status(500).send(err)
            } else if (data.length > 0) {
                console.log('fetching from db for date', isoDate)
                res.send(data[0])
            } else {
                refresh(isoDate, function (obj) { res.send(obj) })
            }
        })
    }
}

function refresh(isoDate, callback) {
    console.log('fetching from servers for date', isoDate)
    fetch(isoDate).onValue(function (obj) {
        upsertToMongo(isoDate, obj)
        callback(obj)
    })

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
                freeCourts: _.flatten(allData).filter(function (reservation) {
                    if(!reservation || !reservation.field) return false
                    var startingDateTime = DateTime.fromIsoDateTime(reservation.date + 'T' + reservation.time)
                    return startingDateTime.compareTo(new DateTime().minusMinutes(60)) >= 0
                }).map(function (reservation) {
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
