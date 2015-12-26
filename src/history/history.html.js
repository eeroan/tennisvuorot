module.exports = o => { with(o) return `<!DOCTYPE html>`+
`<body>
    <link rel="stylesheet" href="/vendor/chartist.min.css"/>
    <meta charset="utf-8"/>
    <style>
        .container {padding:10px 20px;box-sizing: border-box;}
        body { font-family: "Trebuchet MS"; line-height: 1; color: #666; }
        h1,h2,h3 { color: #333; }
        th { font-size: 14px; }
        thead th { text-align: center; padding: 0 0 10px; height: 50px; }
        thead th div { transform: rotate(-90deg); margin: 0 -10px; }
        tbody th { text-align: left; padding: 3px 10px 3px; white-space: nowrap; }
        td { text-align: center; }
        table { border-collapse: collapse; }
        .ct-chart,
        table { width:100%; }
        .day0 th,
        .day0 td { border-bottom: 3px solid #666; }
        /*.ct-perfect-fourth {width:500px;}*/
        .legendBox { display: inline-block; width: 13px; height: 13px; margin-right: 10px;}
        .ct-legend { list-style: none;}
        .ct-legend li { display: inline-block; margin-right: 40px;}
        .ct-series-a .legendBox { background: #d70206 }
        .ct-series-b .legendBox { background: #f05b4f }
        .ct-series-c .legendBox { background: #f4c63d }
        .ct-series-d .legendBox { background: #d17905 }
        .ct-series-e .legendBox { background: #453d3f }
        .ct-series-f .legendBox { background: #59922b }
        .ct-series-g .legendBox { background: #0544d3 }
        .ct-series-h .legendBox { background: #6b0392 }
        .ct-series-i .legendBox { background: #f05b4f }
        .ct-series-j .legendBox { background: #dda458 }
        .ct-series-k .legendBox { background: #eacf7d }
        .ct-series-l .legendBox { background: #86797d }
        .ct-series-m .legendBox { background: #b2c326 }
        .ct-series-n .legendBox { background: #6188e2 }
    </style>
    <div class="container detail">
<h1>Tilastoja</h1>

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
        const availabilityForDate = location ? _.get(allAvailabilityForDate.find(a=>a.location === location), 'available', 0) : _.sum(allAvailabilityForDate.map(a=>a.available))
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
<div class="ct-chart ct-perfect-fourth rates"></div>
<script>window.chartData = ${JSON.stringify(weeklyAvailability)}</script>
<script>window.rates= ${JSON.stringify(rates)}</script>
<script src="/history.min.js"></script>
    </div>
</body>
</html>`}
