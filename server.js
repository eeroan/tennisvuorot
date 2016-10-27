require('newrelic')
var app = require('./src/router')
var port = process.env.PORT || 5000
app.listen(port, () => console.log('Server started at localhost:' + port))
