var courts = {
    tali: {
        url: 'https://webtimmi.talintenniskeskus.fi/login.do?loginName=GUEST&password=GUEST',
        address: 'Kutomokuja 4, 00381 Helsinki'
    },
    taivallahti: {
        url: 'https://webtimmi.talintenniskeskus.fi/login.do?loginName=GUEST&password=GUEST',
        address: 'Hiekkarannantie 2, 00100 Helsinki'
    },
    meilahti: {
        url: 'https://www.slsystems.fi/meilahti/',
        address: 'Meilahden Liikuntapuisto, 00250 Helsinki'
    },
    puistola: {
        url: 'https://oma.enkora.fi/tapanila/reservations2/reservations/25/-/-/-',
        address: 'Tapulikaupungintie 4, 00750 Helsinki'
    },
    herttoniemi: {
        url: 'https://www.slsystems.fi/fite/',
        address: 'Varikkotie 4, 00900 Helsinki'
    },
    kulosaari: {
        url: 'http://www.slsystems.fi/puhoscenter/',
        address: 'Kulosaarentie 2, 00570 Helsinki'
    },
    viikki: {
        tel: '02941 58702'
    },
    merihaka: {
        url: 'https://www.slsystems.fi/meripeli/'
    },
    esport: {
        url: 'http://varaus.esportcenter.fi/index.php?pageId=11&func=mod_rc_v2&tac='
    },
    hiekkaharju: {
        url: 'https://www.slsystems.fi/hiekkaharjuntenniskeskus/'
    },
    kalastajatorppa: {
        tel: '010 423 9960',
        address: 'Kärkitie 4, 00330 Helsinki'
    },
    laajasalo: {
        url: 'http://www.slsystems.fi/laajasalonpalloiluhallit/',
        address: 'Sarvastonkaari 23, 00840 Helsinki'
    },
    varmatennis: {
        tel: '+358 9 548 6101',
        address: 'Ruosilankuja 12, 00390 Helsinki'
    },
    metsälä: {
        address: 'Krämertintie 6, 00620 Helsinki',
        tel: '09 798 521'
    }
}

$('.information tbody').html(_.map(courts, objectToArray).map(function (obj) {
    return '<tr><td class="place">' + (obj.val.url ? '<a target="_blank" href="' + obj.val.url + '">' + obj.key + '</a>' : obj.key) + '</td>' +
        '<td><a target="_blank" href="http://maps.google.com/?q=' + obj.val.address + '">' + (obj.val.address || '') + '</a></td>' +
        '<td>' +
        (obj.val.tel ? ('<a href="tel:' + obj.val.tel + '">' + obj.val.tel + '</a>') : '') +
        '</td></tr>'

}).join(''))

$('.toggleInformation').click(function () {
    $('.information').slideToggle()
})

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
