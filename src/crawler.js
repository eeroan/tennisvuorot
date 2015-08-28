var url = require('url')

module.exports = {table: table}

function table(html) {
    return html.match(/res=[^"]+/g).map(function (el) {
        return url.parse('?' + el, true).query
    })
}
