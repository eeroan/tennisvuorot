const fs = require('fs')
const slSystems = require('../src/dao/slSystemsCrawler')

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
