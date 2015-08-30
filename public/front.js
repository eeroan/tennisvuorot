$.getJSON('/courts', function (allData) {
    var data = [].concat(allData.meilahti, allData.herttoniemi)
    var sameDates = groupBySortedAsList(data, 'date')

    $('.schedule').html(sameDates.map(function (dateObject) {
        var isoDate = dateObject.key
        var times = dateObject.val
        return '<h4>' + new Date(isoDate).toDateString() + '</h4>' +
        groupBySortedAsList(times, 'time').map(function (timeObject) {
            var isoTime = timeObject.key
            var fields = timeObject.val
            return '<p><span class="time">' + isoTime + '</span>' +
            fields.map(function (field) {
                return '<button type="button" class="btn btn-' +
                    (field.location === 'meilahti' ? 'primary' : 'success') +
                    ' btn-xs">' + field.field + '</button>'
            }).join('')+'</p>'
        }).join('')
    }).join(''))
})

function groupBySortedAsList(list, key) { return _.sortBy(_.map(_.groupBy(list, key), objectToArray), 'key')}

function objectToArray(val, key) { return { key: key, val:val}}
