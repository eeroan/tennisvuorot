module.exports = o => `<head>
    <title>Vapaat Tennisvuorot Helsingissä</title>
    <meta charset="utf-8"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <link rel="apple-touch-icon" href="/tennisBall.png"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="google" content="notranslate" />
    <meta name="Description" content="Helsingin tenniskenttien varaustilanne ja yhteystiedot.">
    <link rel="stylesheet" type="text/css" href="${process.env.NODE_ENV==='production' ? '/styles.prefixed.css':'/styles.css'}"/>
    <meta name="twitter:image:src" content="http://tennisvuorot.fi/tennisBall.png">
    <meta property="og:image" content="http://tennisvuorot.fi/tennisBall.png">
    <meta property="og:locale" content="fi_FI">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Vapaat Tennisvuorot Helsingissä">
    <meta property="og:description" content="Helsingin tenniskenttien varaustilanne ja yhteystiedot.">
    <meta property="og:url" content="http://tennisvuorot.fi/">
    <meta property="og:site_name" content="Vapaat Tennisvuorot Helsingissä">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:description" content="Helsingin tenniskenttien varaustilanne ja yhteystiedot.">
    <meta name="twitter:title" content="Vapaat Tennisvuorot Helsingissä">
</head>`
