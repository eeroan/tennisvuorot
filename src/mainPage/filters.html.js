module.exports = o => { with(o) return `<div class="filters">
        <a href="javascript:void(0)" class="toggleFilters" title="Näytä hakuehdot"></a>

        <h3>Tennispaikat <a href="javascript:void(0)" class="toggle toggleMapInformation">Näytä kartalla</a></h3> 
        <div class="locationsContainer">
            ${places.map(place => `
            <button type="button" class="button ${place.id}" id="${place.id}">${place.name}</button>
            `).join('')}
        </div>
        <h3>Kentän tyyppi</h3>
        <div class="fieldTypeContainer">
            ${types.map(type => `
            <button type="button" class="button ${type.id}" id="${type.id}">${type.name}</button>
            `).join('')}
        </div>
        <h3>Aikavalinnat</h3>
        <div class="timeFilterContainer">
            <div id="slider"></div>
            <span class="rangeLabel">6:00-23:00</span>
            <label><input id="single" type="checkbox"> Vapaana&nbsp;2h</label>
        </div>
        
        <div class="close" title="Piilota">&times;</div>
    </div>`}
