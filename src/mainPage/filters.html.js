module.exports = o => { with(o) return `<div class="filters">
        <a href="javascript:void(0)" class="toggleFilters" title="Näytä hakuehdot"></a>

        <div class="locationsContainer">
            <a href="javascript:void(0)" class="toggle toggleMapInformation"></a>
            ${places.map(place => `
            <button type="button" class="button ${place.id}" id="${place.id}">${place.name}</button>
            `).join('')}
        </div>
        <div class="fieldTypeContainer">
            ${types.map(type => `
            <button type="button" class="button ${type.id}" id="${type.id}">${type.name}</button>
            `).join('')}
            <label><input id="single" type="checkbox"> Vapaana 2h</label>
        </div>
        <div class="timeFilterContainer">
            <div id="slider"></div>
            <span class="rangeLabel">6:00-23:00</span>
        </div>
        <div class="close" title="Piilota">&times;</div>
    </div>`}
