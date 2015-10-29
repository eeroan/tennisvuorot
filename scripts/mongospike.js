#!/usr/bin/env node
var MongoClient = require('mongodb').MongoClient

var mongoUri = process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/test';

var args = process.argv.splice(2)
var firstArg = args[0] || 'find'
var todayIsoDate = new Date().toISOString().split('T')[0]
//db.tennishelsinki.createIndex({"expireAt":1}, {expireAfterSeconds:0})
//db.tennishelsinki.createIndex({"date":1}, {expireAfterSeconds:86400})
MongoClient.connect(mongoUri, function (err, db) {
    var collection = db.collection('tennishelsinki')
    if (firstArg === 'find') {
        var filter = args[1] ? {date: new Date(args[1])} : {}
        collection.find(filter).toArray(function (err, docs) {
            var transformedDoc = docs.map(function (doc) {
                doc.timestamp = doc._id.getTimestamp && doc._id.getTimestamp().toISOString()
                return doc
            })
            console.log(err, transformedDoc)
            db.close()
        })
    } else if (firstArg === 'remove') {
        collection.removeMany({mykey: 'myvalue'}, function (er, rs) {
            console.log(er, rs && rs.result)
            db.close()
        })
    } else if (firstArg === 'update') {
        var date = new Date(args[1] || '2015-09-30')
        collection.updateOne({date: date}, {
            date:   date,
            courts: {court: args[2] || 'bar6'}
        }, {
            upsert: true
        }, function (err, rs) {
            console.log(err, rs && rs.result)
            db.close()
        })
    }
});

