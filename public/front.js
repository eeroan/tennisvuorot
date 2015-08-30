$.getJSON('/courts', function (allData) {
    var data = [].concat(allData.meilahti, allData.herttoniemi)
    var sameDates = _.sortBy(_.map(_.groupBy(data, 'date'), objectToArray), 'key')

    $('.schedule').html(sameDates.map(function (obj) {
        var isoDate = obj.key
        var times = obj.val
        return '<h4>' + new Date(isoDate).toDateString() + '</h4>' +
        _.sortBy(_.map(_.groupBy(times, 'time'), objectToArray), 'key') .map(function (obj2) {
            var isoTime = obj2.key
            var fields = obj2.val
            return '<p><span class="time">' + isoTime + '</span>' +
            fields.map(function (field) {
                return '<button type="button" class="btn btn-' +
                    (field.location === 'meilahti' ? 'primary' : 'success') +
                    ' btn-xs">' + field.field + '</button>'
            }).join('')+'</p>'
        }).join('')
    }).join(''))
})


function objectToArray(val, key) { return { key: key, val:val}}
