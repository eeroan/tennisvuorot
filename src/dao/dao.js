const slSystems = require('./slSystemsCrawler')
const _ = require('lodash')
const webTimmi = require('./webTimmi')
const DateTime = require('dateutils').DateTime
const MongoClient = require('mongodb').MongoClient
const [, mongoUri, mongoDbName] = (process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test').match('(.*)\/([^/]+)')
const mongoOptions = {
    useNewUrlParser: true,
    authMechanism: mongoUri.includes('localhost') ? undefined : 'SCRAM-SHA-1',
    authSource: mongoDbName,
    useUnifiedTopology: true
}
const rates = require('../../generated/rates')
const format = require('../format')
let db = null

module.exports = {
    sendFreeCourts,
    freeCourts,
    refresh,
    fetch,
    getHistoryData
}

async function sendFreeCourts(req, res) {
    const forceRefresh = req.query.refresh === 'true' || false
    try {
        const data = await freeCourts(req.query.date, Number(req.query.days) || 1, forceRefresh)
        res.send(data)
    } catch (err) {
        res.status(500).send(err)
    }
}

async function freeCourts(isoDate, days, forceRefresh) {
    if (forceRefresh) {
        console.log('force refresh...')
        const refreshed = await refresh(isoDate, days)
        return wrapIfNeeded(refreshed)

    } else {
        console.log('fetching from db...')
        const data = await getFromMongo(isoDate, days)
        if (data.length > 0) {
            console.log(`fetched from db ${days} days from ${isoDate} with ${_.sumBy(data, 'freeCourts.length')} rows`)
            return wrapIfNeeded(data)
        } else {
            console.log(`empty result, refreshing for ${isoDate} for ${days} days...`)
            const newData = await refresh(isoDate, days)
            console.log('refreshed as fallback', newData)
            return wrapIfNeeded(newData)
        }
    }

    function wrapIfNeeded(data) {
        return data.timestamp ? [data] : data
    }
}


async function refresh(isoDate, days) {
    console.log(`fetching for ${isoDate} for ${days} days...`)
    const obj = await fetch(isoDate)
    console.log(`fetched ${obj.freeCourts.length} from sites for `, isoDate)
    await upsertToMongo(isoDate, obj)
    return obj
}

async function getHistoryData() {
    const start = DateTime.fromDate(2015, 10, 5)
    const end = new DateTime()
    const data = await mongoQuery({date: {$gte: start.date, $lte: end.date}})
    return transform(data)
}

function transform(data) {
    return _.flatten(data.map(row => row.freeCourts))
}

async function getFromMongo(isoDate, days) {
    const start = DateTime.fromIsoDate(isoDate)
    const end = start.plusDays(days - 1)
    const filter = {date: {$gte: start.date, $lte: end.date}}
    return mongoQuery(filter)
}

async function mongoQuery(filter) {
    const db = await mongoConnect()
    const collection = db.collection('tennishelsinki')
    const docs = await collection.find(filter).sort({date: 1}).toArray()
    return docs.map(doc => {
        doc.created = doc._id.getTimestamp && doc._id.getTimestamp().toISOString()
        return doc
    })
}

async function upsertToMongo(isoDate, {freeCourts, timestamp}) {
    const db = await mongoConnect()
    const collection = db.collection('tennishelsinki')
    const date = new Date(isoDate)
    await collection.replaceOne({date}, {
        date,
        freeCourts,
        timestamp
    }, {upsert: true})
}

function getType({type, field, res}) {
    if (type) {
        return type
    }
    const isBubble = /kupla/i.test(field) || /kupla/i.test(res) || /Kaarihalli.*/i.test(field)
    const isOutdoor = /ulko/i.test(field) || /ulko/i.test(res)
    return isBubble ? 'bubble' : (isOutdoor ? 'outdoor' : 'indoor')
}

async function fetch(isoDate) {
    const allData = await Promise.all([
        webTimmi.getMeilahti,
        webTimmi.getHerttoniemi,
        webTimmi.getKulosaari,
        slSystems.getMerihaka,
        slSystems.getTapiola,
        slSystems.getLaajasalo,
        //slSystems.getHiekkaharju,
        webTimmi.getTaivallahti,
        webTimmi.getTaliOutdoor,
        webTimmi.getTaliIndoor
    ].map(fn => fn(isoDate)))

    const freeCourts = _.flatten(allData).filter(reservation => {
        if (!reservation || !reservation.field) return false
        return reservation.date === isoDate
    }).map(reservation => {
        const dateTime = DateTime.fromIsoDateTime(`${reservation.date}T${reservation.time}`)
        const type = getType(reservation)
        reservation.type = type
        reservation.price = getPrice(dateTime, reservation.time, reservation.location, type)
        return reservation
    })
    return {
        freeCourts: withDoubleLessonInfo(freeCourts),
        timestamp: new Date().getTime(),
        date: isoDate
    }
}

function getPrice(dateTime, time, location, type) {
    const hm = time.split(':')
    const timeKey = format.formatTimeKey(hm)
    const weekDay = (dateTime.getDay() + 6) % 7
    const priceByType = _.get(rates, [location, type, timeKey, weekDay], 0)
    const commonPrice = _.get(rates, [location, timeKey, weekDay], 0)
    return priceByType || commonPrice
}

function withDoubleLessonInfo(freeCourts) {
    const timeAndPlace = {}
    freeCourts.forEach(court => {
        timeAndPlace[`${court.date}T${court.time}${court.location}${court.field}`] = true
    })
    return freeCourts.map(court => {
        const nextTime = nextHour(court.time)
        court.doubleLesson = (`${court.date}T${nextTime}${court.location}${court.field}`) in timeAndPlace
        return court
    })
}

function nextHour(time) {
    const hm = time.split(':')
    const next = Number(hm[0]) + 1
    return `${next > 9 ? '' : '0'}${next}:${hm[1]}`
}

async function mongoConnect() {
    if (db) return db
    const client = await MongoClient.connect(mongoUri, mongoOptions)
    if (db) {
        client.close()
    } else {
        db = client.db(mongoDbName)
    }
    return db
}
