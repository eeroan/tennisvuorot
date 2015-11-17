module.exports = o => `<!DOCTYPE html>
<html>
<head>
    <title>Tennisvuorot Helsingissä</title>
    <meta charset="utf-8"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <link rel="apple-touch-icon" href="tennisBall.png"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="google" content="notranslate" />
    <meta name="Description" content="Helsingin tenniskenttien varaustilanne ja yhteystiedot.">
    <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
<div class="container reservations detail">
    <div class="filters">
        <a href="javascript:void(0)" class="toggleFilters" title="Näytä hakuehdot"></a>

        <div class="locationsContainer">
            <a href="javascript:void(0)" class="toggle toggleMapInformation"></a>
            <a href="javascript:void(0)" class="toggle toggleInformation">i</a>
            <button type="button" class="meilahti" id="meilahti">Meilahti</button>
            <button type="button" class="herttoniemi" id="herttoniemi">Herttoniemi</button>
            <button type="button" class="kulosaari" id="kulosaari">Kulosaari</button>
            <button type="button" class="merihaka" id="merihaka">Merihaka</button>
            <button type="button" class="taivallahti" id="taivallahti">Taivallahti</button>
            <button type="button" class="tapiola" id="tapiola">Tapiola</button>
            <button type="button" class="tali" id="tali">Tali</button>
        </div>
        <div class="fieldTypeContainer">
            <button type="button" class="bubble" id="bubble">Kupla</button>
            <button type="button" class="outdoor" id="outdoor">Ulko</button>
            <button type="button" class="indoor" id="indoor">Sisä</button>
            <label><input id="single" type="checkbox"> Vapaana 2h</label>
        </div>
        <div class="timeFilterContainer">
            <div id="slider"></div>
            <span class="rangeLabel">6:00-23:00</span>
        </div>
        <div class="jumpToDateContainer">
            <span class="jumpToDateTitle"></span>
            <select class="jumpToDate"></select>
        </div>
        <div class="close" title="Piilota">&times;</div>
    </div>
    <section class="" id="schedule">
        ${o.markup}
    </section>
</div>
<div class="information modal">
    <h3>Tietoja</h3>
    <p>Tämän palvelun on tehnyt Eero Anttila harrasteprojektinaan. </p>
    <p>Lähdekoodi: <a href="https://github.com/eeroan/tennisvuorot">GitHub</a></p>
    <p>Twitter: <a href="https://twitter.com/eeroan">@eeroan</a></p>
    <p>Töissä: <a href="http://reaktor.com">Reaktorilla</a></p>
    <form class="feedbackForm">
    <textarea class="feedback" placeholder="Tähän voit antaa palautetta ja toiveita"></textarea>
    <button type="submit" class="submitFeedback">Lähetä</button>
    </form>
    <p><div class="fb-like" data-href="http://tennisvuorot.fi" data-layout="button_count" data-action="like" data-show-faces="false" data-share="true"></div></p>
    <div class="close">&times;</div>
</div>
<div id="map_wrapper" style="display: none" class="locationMap modal">
    <div id="map_canvas" class="mapping"></div>
    <div class="close">&times;</div>
</div>
<script>
    window.refresh=${o.refresh};
    window.serverDate='${o.serverDate}';
</script>
<script src="http://maps.googleapis.com/maps/api/js?sensor=false"></script>
<script>
    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function () {
                    (i[r].q = i[r].q || []).push(arguments)
                }, i[r].l = 1 * new Date();
        a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

    ga('create', 'UA-67013989-1', 'auto');
    ga('send', 'pageview');
</script>
<script src="front.min.js?"></script>
<div id="fb-root"></div>
<div id="fb-root"></div>
<script>(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/fi_FI/sdk.js#xfbml=1&version=v2.5";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>
</body>
</html>`