require('newrelic')
const app = require('./src/router')
const port = process.env.PORT || 5000
app.listen(port, () => console.log('Server started at localhost:' + port))
