#!/usr/bin/env node
var slSystems = require('./slSystemsCrawler')
var Bacon = require('baconjs').Bacon
var _ = require('lodash')
var webTimmi = require('./webTimmiCrawler')
var DateTime = require('dateutils').DateTime
var MongoClient = require('mongodb').MongoClient
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test';
var rates = require('./rates')

module.exports = {
    freeCourts: freeCourts,
    refresh:    refresh
}

function freeCourts(req, res) {
    var isoDate = req.query.date
    var forceRefresh = req.query.refresh || false

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
        //var filter = {date: {$gte : new Date(isoDate)}}
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

function getType(reservation) {
    var isBubble = /kupla/i.test(reservation.field) || /kupla/i.test(reservation.res)
    var isOutdoor = /ulko/i.test(reservation.field) || /ulko/i.test(reservation.res)
    return isBubble ? 'bubble' : (isOutdoor ? 'outdoor' : 'indoor')
}
function fetch(isoDate) {
    return Bacon.combineAsArray([
        slSystems.getMeilahti,
        slSystems.getHerttoniemi,
        slSystems.getKulosaari,
        slSystems.getMerihaka,
        webTimmi.getAll].map(function (fn) { return fn(isoDate) }))
        .map(function (allData) {
            var freeCourts = _.flatten(allData).filter(function (reservation) {
                if (!reservation || !reservation.field) return false
                var startingDateTime = DateTime.fromIsoDateTime(reservation.date + 'T' + reservation.time)
                return startingDateTime.compareTo(new DateTime().minusMinutes(60)) >= 0
            }).map(function (reservation) {
                var dateTime = DateTime.fromIsoDateTime(reservation.date + 'T' + reservation.time)
                reservation.type = getType(reservation)
                reservation.price = getPrice(dateTime, reservation.time, reservation.location)
                return reservation
            })
            return {
                freeCourts: withDoubleLessonInfo(freeCourts),
                timestamp:  new Date().getTime()
            }
        })
}

function getPrice(dateTime, time, location) {
    var hm = time.split(':')
    var timeKey = (Number(hm[0]) * 10 + (Number(hm[1]) / 6))
    var weekDay = (dateTime.getDay() + 6) % 7
    return _.get(rates, [location, timeKey, weekDay], 0)
}

function withDoubleLessonInfo(freeCourts) {
    var timeAndPlace = {}
    freeCourts.forEach(function (court) {
        timeAndPlace[court.date + 'T' + court.time + court.location + court.field] = true
    })
    return freeCourts.map(function (court) {
        var nextTime = nextHour(court.time)
        court.doubleLesson = (court.date + 'T' + nextTime + court.location + court.field) in timeAndPlace
        return court
    })
}

function nextHour(time) {
    var hm = time.split(':')
    var next = Number(hm[0]) + 1
    return (next > 9 ? '' : '0') + next + ':' + hm[1]
}
