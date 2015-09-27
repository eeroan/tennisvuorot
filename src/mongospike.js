#!/usr/bin/env node
var MongoClient = require('mongodb').MongoClient

var mongoUri = process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/test';

var args = process.argv.splice(2)
var firstArg = args[0] || 'find'
var todayIsoDate = new Date().toISOString().split('T')[0]


MongoClient.connect(mongoUri, function (err, db) {
    var collection = db.collection('tennishelsinki')
    if (firstArg === 'find') {
        collection.find({}).toArray(function (err, docs) {
            console.log(err, docs)
            db.close()
        })
    } else if (firstArg === 'insert') {
        var obj = {}
        obj[todayIsoDate] = {foo: 'bar'}
        collection.insertOne(obj, {safe: true}, function (er, rs) {
            console.log(er, rs)
            db.close()
        });
    } else if(firstArg === 'remove') {
        collection.removeMany( {mykey:'myvalue'}, function (er, rs) {
            console.log(er, rs && rs.result)
            db.close()
        })
    } else if(firstArg === 'update') {
        collection.updateOne()
    }
});

