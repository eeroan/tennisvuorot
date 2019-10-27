const fs = require('fs')
const slSystems = require('../src/dao/slSystemsCrawler')
const webTimmi = require('../src/dao/webTimmi')

describe('sls systems crawler', () => {
    let obj
    let expected
    before(() => {
        obj = slSystems.table(fs.readFileSync(__dirname + '/fixture/meilahti.html', 'utf-8'))
        expected = JSON.parse(fs.readFileSync(__dirname + '/fixture/meilahti.json', 'utf-8'))
    })

    it('transforms table to json', () => {
        expect(obj).to.eql(expected)
    })
})

describe('webTimmi crawler', () => {
    let obj
    let expected
    before(() => {
        obj = webTimmi.table(fs.readFileSync(__dirname + '/fixture/tali.html', 'utf-8'))
        expected = JSON.parse(fs.readFileSync(__dirname + '/fixture/tali.json', 'utf-8'))
    })

    it('transforms table to json', () => {
        expect(obj).to.eql(expected)
    })
})
