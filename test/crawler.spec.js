var fs = require('fs')
var slSystems = require('../src/slSystemsCrawler')
var webTimmi = require('../src/webTimmiCrawler')

describe('sls systems crawler', () => {
    var obj
    var expected
    before(() => {
        obj = slSystems.table(fs.readFileSync(__dirname + '/fixture/meilahti.html', 'utf-8'))
        expected = JSON.parse(fs.readFileSync(__dirname + '/fixture/meilahti.json', 'utf-8'))
    })

    it('transforms table to json', () => {
        expect(obj).to.eql(expected)
    })
})

describe('web timmi crawler', () => {
    var obj
    var expected
    before(() => {
        obj = webTimmi.parseMarkup(fs.readFileSync(__dirname + '/fixture/weekViewMenu.html', 'utf-8'))
        expected = JSON.parse(fs.readFileSync(__dirname + '/fixture/taivallahti.json', 'utf-8'))
    })

    it('transforms table to json', () => {
        expect(obj).to.eql(expected)
    })
})
