module.exports = o => `<head>
    <title>Vapaat Tenniskentät Helsingissä</title>
    <meta charset="utf-8"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="google" content="notranslate" />
    <meta name="Description" content="Helsingin tenniskenttien varaustilanne ja yhteystiedot.">
    <link rel="stylesheet" type="text/css" href="${process.env.NODE_ENV === 'production' ? '/styles.prefixed.css' : '/styles.css'}"/>
    <meta name="twitter:image:src" content="http://tennisvuorot.fi/tennisvuorot.png">
    <meta property="og:image" content="http://tennisvuorot.fi/tennisvuorot.png">
    <meta property="og:locale" content="fi_FI">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Vapaat Tennisvuorot Helsingissä">
    <meta property="og:description" content="Helsingin tenniskenttien varaustilanne ja yhteystiedot.">
    <meta property="og:url" content="http://tennisvuorot.fi/">
    <meta property="og:site_name" content="Tennisvuorot.fi">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:description" content="Helsingin tenniskenttien varaustilanne ja yhteystiedot.">
    <meta name="twitter:title" content="Tennisvuorot.fi - Vapaat tennisvuorot Helsingissä">
    <link rel="apple-touch-icon" sizes="57x57" href="/icon/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="/icon/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="/icon/apple-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="/icon/apple-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="/icon/apple-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="/icon/apple-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="/icon/apple-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/icon/apple-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/icon/apple-icon-180x180.png">
    <link rel="icon" type="image/png" sizes="192x192"  href="/icon/android-icon-192x192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/icon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="96x96" href="/icon/favicon-96x96.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/icon/favicon-16x16.png">
    <link rel="manifest" href="/icon/manifest.json">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-TileImage" content="/icon/ms-icon-144x144.png">
    <meta name="theme-color" content="#ffffff">
</head>`
