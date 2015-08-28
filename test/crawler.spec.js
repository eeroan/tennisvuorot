var fs = require('fs')
var crawler = require('../src/crawler')

describe('crawler', function () {
    var obj
    var expected
    before(function () {
        obj = crawler.table(fs.readFileSync(__dirname + '/fixture/meilahti.html', 'utf-8'))
        expected = JSON.parse(fs.readFileSync(__dirname + '/fixture/meilahti.json', 'utf-8'))
    })

    it('transforms table to json', function () {
        expect(obj).to.eql(expected)
    })
})
