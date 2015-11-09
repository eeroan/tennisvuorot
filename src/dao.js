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
    refresh:    refresh,
    fetch:      fetch
}

function freeCourts(req, res) {
    var isoDate = req.query.date
    var days = Number(req.query.days) || 1
    var forceRefresh = req.query.refresh || false

    if (forceRefresh) {
        refresh(isoDate, days, data => { res.send(data.timestamp ? [data] : data) })
    } else {
        getFromMongo(isoDate, days, (err, data) => {
            if (err) {
                res.status(500).send(err)
            } else if (data.length > 0) {
                console.log('fetching from db for date', isoDate, days, data.length)
                res.send(data.timestamp ? [data] : data)
            } else {
                refresh(isoDate, days, (data) => { res.send(data.timestamp ? [data] : data) })
            }
        })
    }
}

function refresh(isoDate, days, callback) {
    console.log('fetching from servers for date', isoDate)
    fetch(isoDate).onValue((obj) => {
        upsertToMongo(isoDate, obj)
        callback(obj)
    })

}

function getFromMongo(isoDate, days, callback) {
    MongoClient.connect(mongoUri, (err, db) => {
        var collection = db.collection('tennishelsinki')
        var start = DateTime.fromIsoDate(isoDate)
        var end = start.plusDays(days - 1)
        var filter = {date: {$gte: start.date, $lte: end.date}}
        collection.find(filter).sort({date: 1}).toArray((err, docs) => {
            var transformedDoc = docs.map((doc) => {
                doc.created = doc._id.getTimestamp && doc._id.getTimestamp().toISOString()
                return doc
            })
            callback(err, transformedDoc)
            db.close()
        })
    })
}

function upsertToMongo(isoDate, obj) {
    MongoClient.connect(mongoUri, (err, db) => {
        const collection = db.collection('tennishelsinki')
        const date = new Date(isoDate)
        collection.updateOne({date: date}, {
            date:       date,
            freeCourts: obj.freeCourts,
            timestamp:  obj.timestamp
        }, {
            upsert: true
        }, (err, rs) => {
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
                return reservation.date === isoDate
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
