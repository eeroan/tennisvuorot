$.getJSON('/courts', function (data) {

    var modified = data.map(function (item) {
        return {
            duration: item.kesto,
            time: item.klo.substring(0,5),
            date: item.pvm,
            field: meilahtiFieldName(item.res)
        }
    })

    var sameDates = _.groupBy(modified, 'date')

    var list = []
    _.forEach(sameDates, function (times, isoDate) {
        list.push('<h4>' + new Date(isoDate).toDateString() + '</h4>')
        var sameTimes = _.groupBy(times, 'time')
        _.forEach(sameTimes, function(fields, isoTime) {
            list.push('<p><span class="time">'+isoTime+'</span>')
            list.push(fields.map(function (field) {
                return '<button type="button" class="btn btn-default btn-xs">'+field.field+'</button>'
            }).join(''))
            list.push('</p>')
        })
    })
    $('.schedule').html(list.join(''))
})


function meilahtiFieldName(index) {
    index = Number(index)
    return (index > 5 ? 'Sisä' : 'Kupla') + ' K' + index
}
