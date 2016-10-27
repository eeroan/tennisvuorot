const fs = require('fs')
const path = require('path')
module.exports = {
    show
}

function show(req, res) {
    const headFile = tryOrEmpty(() => fs.readFileSync(path.resolve(__dirname, '..', '.git/HEAD'), 'utf-8'))
    const head = headFile.split(' ').pop().replace('\n', '')
    const hash = tryOrEmpty(() => fs.readFileSync(path.resolve(__dirname, '..', '.git', head), 'utf-8'))
    res.send(`<!DOCTYPE html><html><body>
    <pre>
    NODE_ENV: ${process.env.NODE_ENV}
    HEAD: ${head}
    COMMIT: ${hash}
    </pre>
    </body></html>`)
}

function tryOrEmpty(fn) {
    try {
        return fn()
    } catch(e) {
        return 'N/A'
    }
}
