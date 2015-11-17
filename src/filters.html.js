module.exports = o => `<div class="filters">
        <a href="javascript:void(0)" class="toggleFilters" title="Näytä hakuehdot"></a>

        <div class="locationsContainer">
            <a href="javascript:void(0)" class="toggle toggleMapInformation"></a>
            <a href="javascript:void(0)" class="toggle toggleInformation">i</a>
            <button type="button" class="meilahti" id="meilahti">Meilahti</button>
            <button type="button" class="herttoniemi" id="herttoniemi">Herttoniemi</button>
            <button type="button" class="kulosaari" id="kulosaari">Kulosaari</button>
            <button type="button" class="merihaka" id="merihaka">Merihaka</button>
            <button type="button" class="taivallahti" id="taivallahti">Taivallahti</button>
            <button type="button" class="tapiola" id="tapiola">Tapiola</button>
            <button type="button" class="tali" id="tali">Tali</button>
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
