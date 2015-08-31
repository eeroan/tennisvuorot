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
                    groupBySortedAsList(fields, 'location').map(function (locationFields) {
                        var location = locationFields.key
                        var fields = locationFields.val
                        return '<span class="locationBoxes"><button type="button" class="locationLabel btn btn-' +
                            (location === 'meilahti' ? 'primary' : 'success') +
                            ' btn-xs">' + location + ' (' + fields.length + ')</button>' +
                            fields.map(function (field) {
                                return '<button type="button" class="fieldLabel btn btn-' +
                                    (field.location === 'meilahti' ? 'primary' : 'success') +
                                    ' btn-xs">' + field.field + '</button>'
                            }).join('') + '</span>'
                    }).join('') + '</p>'
            }).join('')
    }).join(''))
})

$('.schedule').on('click', '.locationLabel', function (e) {
    console.log('click')
    var $locationLabel = $(e.currentTarget)
    $locationLabel.toggle()
    $locationLabel.parent().find('.fieldLabel').toggle()
})

function groupBySortedAsList(list, key) {
    return _.sortBy(_.map(_.groupBy(list, key), objectToArray), 'key')
}

function objectToArray(val, key) {
    return {key: key, val: val}
}
