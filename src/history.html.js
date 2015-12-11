module.exports = o => { with(o) return `<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="/vendor/chartist.min.css"/>
    <meta charset="utf-8"/>
    <style>
        body { font-family: "Trebuchet MS"; line-height: 1; color: #666; }
        h1 { color: #333; }
        th { font-size: 14px; }
        thead th { text-align: center; padding: 0 0 10px; height: 50px; }
        thead th div { transform: rotate(-90deg); margin: 0 -10px; }
        tbody th { text-align: left; padding: 3px 10px 3px; white-space: nowrap; }
        td { text-align: center; }
        table { border-collapse: collapse; }
        .day0 th,
        .day0 td { border-bottom: 3px solid #666; }
        /*.ct-perfect-fourth {width:500px;}*/
    </style>
</head>
<body>
<h1>Myymättä jääneet kentät</h1>
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
        <th>date.formattedDate</th>
        ${times.map(time=> {
        const availabilityForDate = findAvailabilityForDate(date.dateTime, time)
        const rgb = 255 - availabilityForDate * 15
        return `
        <td style="background:rgb(${rgb},${rgb},255)" title="${time}, vapaana ${availabilityForDate}"></td>
        `
        }).join('')}
    </tr>
    `).join('')}

    </tbody>
</table>
<div class="ct-chart ct-perfect-fourth"></div>
<script>window.chartData = ${JSON.stringify(weeklyAvailability)}</script>
<script src="/history.min.js"></script>

</body>
</html>`}
