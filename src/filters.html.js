module.exports = o => `<div class="filters">
        <a href="javascript:void(0)" class="toggleFilters" title="Näytä hakuehdot"></a>

        <div class="locationsContainer">
            <a href="javascript:void(0)" class="toggle toggleMapInformation"></a>
            <a href="javascript:void(0)" class="toggle toggleInformation">i</a>
            ${o.places.map(place => `
            <button type="button" class="${place.id}" id="${place.id}">${place.name}</button>
            `).join('')}
        </div>
        <div class="fieldTypeContainer">
            <button type="button" class="bubble" id="bubble">Kupla</button>
            <button type="button" class="outdoor" id="outdoor">Ulko</button>
            <button type="button" class="indoor" id="indoor">Sisä</button>
            <label><input id="single" type="checkbox"> Vapaana 2h</label>
        </div>
        <div class="timeFilterContainer">
            <div id="slider"></div>
            <span class="rangeLabel">6:00-23:00</span>
        </div>
        <div class="jumpToDateContainer">
            <span class="jumpToDateTitle"></span>
            <select class="jumpToDate"></select>
        </div>
        <div class="close" title="Piilota">&times;</div>
    </div>`
