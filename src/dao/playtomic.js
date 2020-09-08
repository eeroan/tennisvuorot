const request = require('request')
const util = require('util')
const _ = require('lodash')
const DateTime = require('dateutils').DateTime

const hiekkaharjuCodes = {
    '22ed868d-364f-4091-afd2-798edf71c006': 'Ulko 1',
    '49f36e3f-4746-4b09-a69f-42d98b92f511': 'Ulko 2',
    '4c228fa8-9150-4a15-a9dd-ece3b44e6dbf': 'Ulko 3',
    'c1a61b6c-cf89-46ae-b492-227400b4a1b1': 'Ulko 4',
    '4c6f1fee-55ca-42e3-aa31-3d8b8fffc816': 'Kaarihalli 5',
    '9419363e-e07e-4257-bef0-477f41d7d4ed': 'Kaarihalli 6',
    '502def35-c2de-403d-ab69-ccc67bde9029': 'Htk-halli 7',
    '824ed07b-9195-4f24-ba8b-e0319a367e40': 'Htk-halli 8',
    'cd8b75f0-6b13-472c-b673-d2620c1b56bb': 'Htk-halli 9'
}

const offset = new Date().getTimezoneOffset()
const getHiekkaharju = async () => {
    const date = `2020-09-08`
    const url = `https://playtomic.io/api/v1/availability?tenant_id=8ee638e3-f0b5-41c4-bb68-d82af4eac424&sport_id=TENNIS&local_start_min=${date}T00:00:00&local_start_max=${date}T23:59:59`
    const res = await util.promisify(request.get)(url)
    const json = JSON.parse(res.body)
    return _.flatten(json.map(resource => {
        return resource.slots.filter(slot => slot.duration === 60).map(slot => ({
            duration: slot.duration,
            time:     DateTime.fromIsoDateTime(resource.start_date + 'T' + slot.start_time).plusMinutes(-offset).toISOString().split('T').pop().substring(0, 5),
            date:     resource.start_date,
            res:      resource.resource_id,
            field:    hiekkaharjuCodes[resource.resource_id],
            location: 'hiekkaharju',
            price:    parseInt(slot.price)
        }))
    }))
}

module.exports = {
    getHiekkaharju
}
