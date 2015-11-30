var nr = require('newrelic')
var slSystems = require('./slSystemsCrawler')
var Bacon = require('baconjs').Bacon
var _ = require('lodash')
var webTimmi = require('./webTimmiCrawler')
var DateTime = require('dateutils').DateTime
var MongoClient = require('mongodb').MongoClient
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test';
var rates = require('./rates')
var format = require('./format')

module.exports = {
    sendFreeCourts: sendFreeCourts,
    freeCourts:     freeCourts,
    refresh:        refresh,
    fetch:          fetch
}

function sendFreeCourts(req, res) {
    var forceRefresh = req.query.refresh === 'true' || false
    freeCourts(req.query.date, Number(req.query.days) || 1, forceRefresh,
        data => res.send(data),
        err => res.status(500).send(err))
}

function freeCourts(isoDate, days, forceRefresh, callback, errCallback) {
    if (forceRefresh) {
        refresh(isoDate, days, data => { doCallback(data) })
    } else {
        getFromMongo(isoDate, days, (err, data) => {
            if (err) {
                errCallback(err)
            } else if (data.length > 0) {
                console.log('fetching from db for date', isoDate, days, data.length)
                doCallback(data)
            } else {
                refresh(isoDate, days, (data) => { doCallback(data) })
            }
        })
    }

    function doCallback(data) {
        callback(data.timestamp ? [data] : data)
    }
}

function refresh(isoDate, days, callback) {
    console.log('fetching from servers for date', isoDate)
    nr.createBackgroundTransaction('fetch:reservations', fetch(isoDate).onValue((obj) => {
        upsertToMongo(isoDate, obj)
        nr.endTransaction()
        callback(obj)
    }))

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
    var isBubble = /kupla/i.test(reservation.field) || /kupla/i.test(reservation.res) || /Kaarihalli.*/i.test(reservation.field)
    var isOutdoor = /ulko/i.test(reservation.field) || /ulko/i.test(reservation.res)
    return isBubble ? 'bubble' : (isOutdoor ? 'outdoor' : 'indoor')
}
function fetch(isoDate) {
    return Bacon.combineAsArray([
            slSystems.getMeilahti,
            slSystems.getHerttoniemi,
            slSystems.getKulosaari,
            slSystems.getMerihaka,
            slSystems.getTapiola,
            slSystems.getLaajasalo,
            slSystems.getHiekkaharju,
            webTimmi.getAll].map(function (fn) { return fn(isoDate) }))
        .map(function (allData) {
            var freeCourts = _.flatten(allData).filter(function (reservation) {
                if (!reservation || !reservation.field) return false
                return reservation.date === isoDate
            }).map(function (reservation) {
                var dateTime = DateTime.fromIsoDateTime(reservation.date + 'T' + reservation.time)
                var type = getType(reservation)
                reservation.type = type
                reservation.price = getPrice(dateTime, reservation.time, reservation.location, type)
                return reservation
            })
            return {
                freeCourts: withDoubleLessonInfo(freeCourts),
                timestamp:  new Date().getTime(),
                date:       isoDate
            }
        })
}

function getPrice(dateTime, time, location, type) {
    var hm = time.split(':')
    var timeKey = format.formatTimeKey(hm)
    var weekDay = (dateTime.getDay() + 6) % 7
    var priceByType = _.get(rates, [location, type, timeKey, weekDay], 0)
    var commonPrice = _.get(rates, [location, timeKey, weekDay], 0)
    return priceByType || commonPrice
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
