const Browser = require('zombie')
const browser = new Browser({waitDuration: '15s'})
var app = require('../src/router')
var port = process.env.PORT || 5001
global.isTest = true
describe('Loads list of free courts', function () {
    this.timeout(19000)
    before(done => app.listen(port, done))

    before(done => browser.visit('http://localhost:' + port, done))

    it('Should load page with correct title', () => browser.assert.text('title', 'Tennisvuorot Helsingissä'))

    it('Should load some results', () => browser.assert.elements('.timeRow', {atLeast: 10}))
});
