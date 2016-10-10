const nr = require('newrelic')
const slSystems = require('./slSystemsCrawler')
const Bacon = require('baconjs').Bacon
const _ = require('lodash')
const webTimmi = require('./webTimmi2')
const DateTime = require('dateutils').DateTime
const MongoClient = require('mongodb').MongoClient
const mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test';
const rates = require('../../generated/rates')
const format = require('../format')
var db = null

module.exports = {
    sendFreeCourts: sendFreeCourts,
    freeCourts:     freeCourts,
    refresh:        refresh,
    fetch:          fetch,
    getHistoryData: getHistoryData
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

function getHistoryData(callback) {
    const start = DateTime.fromDate(2015,10,5)
    const end = new DateTime()
    mongoQuery({date: {$gte: start.date, $lte:end.date}}, (err, data) => callback(err, transform(data)) )
}

function transform(data) {
    return _.flatten(data.map(row => row.freeCourts))
}

function getFromMongo(isoDate, days, callback) {
    const start = DateTime.fromIsoDate(isoDate)
    const end = start.plusDays(days - 1)
    const filter = {date: {$gte: start.date, $lte: end.date}}
    mongoQuery(filter, callback)
}

function mongoQuery(filter, callback) {
    mongoConnect((err, db) => {
        const collection = db.collection('tennishelsinki')
        collection.find(filter).sort({date: 1}).toArray((err, docs) => {
            const transformedDoc = docs.map(doc => {
                doc.created = doc._id.getTimestamp && doc._id.getTimestamp().toISOString()
                return doc
            })
            callback(err, transformedDoc)
        })
    })
}

function upsertToMongo(isoDate, obj) {
    mongoConnect((err, db) => {
        const collection = db.collection('tennishelsinki')
        const date = new Date(isoDate)
        collection.updateOne({date: date}, {
            date:       date,
            freeCourts: obj.freeCourts,
            timestamp:  obj.timestamp
        }, {
            upsert: true
        }, (err, rs) => {
            console.error(err)
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
            webTimmi.getAll].map(fn => fn(isoDate)))
        .map(allData => {
            const freeCourts = _.flatten(allData).filter(reservation => {
                if (!reservation || !reservation.field) return false
                return reservation.date === isoDate
            }).map(reservation => {
                const dateTime = DateTime.fromIsoDateTime(reservation.date + 'T' + reservation.time)
                const type = getType(reservation)
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
    freeCourts.forEach(court => {
        timeAndPlace[court.date + 'T' + court.time + court.location + court.field] = true
    })
    return freeCourts.map(court => {
        const nextTime = nextHour(court.time)
        court.doubleLesson = (court.date + 'T' + nextTime + court.location + court.field) in timeAndPlace
        return court
    })
}

function nextHour(time) {
    const hm = time.split(':')
    const next = Number(hm[0]) + 1
    return (next > 9 ? '' : '0') + next + ':' + hm[1]
}

function mongoConnect(cb) {
    if(db) cb(null, db)
    else {
        MongoClient.connect(mongoUri, (err, dbConn) => {
            if(db) {
                dbConn.close()
            } else {
                db = dbConn
            }
            cb(err, db)
        })
    }
}
