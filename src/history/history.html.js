module.exports = o => { with(o) return `<!DOCTYPE html>`+
`<body>
<link rel="stylesheet" href="/history.css"/>
<div class="container detail">
<h1>Tilastoja - ${location ? location : 'Kaikki paikat'}</h1>
    <ul>
        <li><a href="/historia">Kaikki</a></li>
        ${rates.locations.map(location=>`<li><a href="/historia/${location}">${location}</a></li>`).join('')}
    </ul>
<h2>Myymättä jääneet kentät päivämäärittäin</h2>
<table>
    <thead>
    <tr>
        <th>Pvm</th>
        ${times.map(time=>`
        <th>
            <div>${time}</div>
        </th>
        `).join('')}
    </tr>
    </thead>
    <tbody>
    ${dates.map(date=>`
    <tr class="day${date.dateTime.getDay()}">
        <th>${date.formattedDate}</th>
        ${times.map(time=> {
        const allAvailabilityForDate = findAvailabilityForDate(date.dateTime, time)
        const availabilityForDate = location ?
        _.get(allAvailabilityForDate.find(a=>a.location === location), 'available', 0) :
        _.sum(allAvailabilityForDate.map(a=>a.available))
        const rgb = 255 - availabilityForDate * 15
        return `
        <td style="background:rgb(${rgb},${rgb},255)" title="${time}, vapaana ${availabilityForDate}"></td>
        `
        }).join('')}
    </tr>
    `).join('')}

    </tbody>
</table>
<h2>Myymättä jääneet kentät viikonpäivittäin</h2>
<div class="ct-chart ct-perfect-fourth chartData"></div>
<ul class="ct-legend">
    <li class="ct-series-b"><span class="legendBox"></span>Ma</li>
    <li class="ct-series-c"><span class="legendBox"></span>Ti</li>
    <li class="ct-series-d"><span class="legendBox"></span>Ke</li>
    <li class="ct-series-e"><span class="legendBox"></span>To</li>
    <li class="ct-series-f"><span class="legendBox"></span>Pe</li>
    <li class="ct-series-g"><span class="legendBox"></span>La</li>
    <li class="ct-series-a"><span class="legendBox"></span>Su</li>
</ul>

<h2>Kenttien hinnat eri viikonpäivinä</h2>

<div class="ct-chart ct-perfect-fourth rates"></div>

<ul class="ct-legend">
    ${rates.locations.map((location, i)=>`<li class="ct-series-${String.fromCharCode('a'.charCodeAt(0)+i)}"><span class="legendBox"></span>${location}</li>`).join('')}
</ul>
        <script>window.chartData = ${JSON.stringify(weeklyAvailability)}</script>
<script>window.rates= ${JSON.stringify(rates)}</script>
<script src="/history.min.js"></script>
    </div>
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
</body>
</html>`}
