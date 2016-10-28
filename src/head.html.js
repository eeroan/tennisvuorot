module.exports = o => { with(o) return `<head>
    <title>Tennisvuorot.fi</title>
    <meta charset="utf-8"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="google" content="notranslate" />
    <meta name="Description" content="Tenniskenttien varaustilanne ja yhteystiedot Helsingin, Espoon ja Vantaan seuraaville kentille: ${locations.map(loc => _.capitalize(loc.title)).join(', ')} ">
    <link rel="stylesheet" type="text/css" href="${process.env.NODE_ENV === 'production' ? '/styles.prefixed.css' : '/styles.css'}"/>
    <meta name="twitter:image:src" content="http://tennisvuorot.fi/tennisvuorot.png">
    <meta property="og:image" content="http://tennisvuorot.fi/tennisvuorot.png">
    <meta property="og:locale" content="fi_FI">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Tennisvuorot.fi - Vapaat tenniskentät Helsingissä">
    <meta property="og:description" content="Helsingin tenniskenttien varaustilanne ja yhteystiedot.">
    <meta property="og:url" content="http://tennisvuorot.fi/">
    <meta property="og:site_name" content="Tennisvuorot.fi - Vapaat tenniskentät Helsingissä">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:description" content="Helsingin tenniskenttien varaustilanne ja yhteystiedot.">
    <meta name="twitter:title" content="Tennisvuorot.fi - Vapaat tenniskentät Helsingissä">
    <link rel="apple-touch-icon" href="/icon/tennisvuorot-black.png"/>
    <link id="page_favicon" href="/icon/favicon.ico" rel="icon" type="image/x-icon"/>
    <link rel="manifest" href="/icon/manifest.json">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-TileImage" content="/icon/ms-icon-144x144.png">
    <meta name="theme-color" content="#ff6900">
</head>`}
