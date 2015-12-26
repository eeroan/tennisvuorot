module.exports = o => `<div class="information modal">
    <h3>Tietoja</h3>
    <p>Tämän palvelun on tehnyt Eero Anttila harrasteprojektinaan. </p>
    <p>Katso myös <a href="/historia" onclick="ga('send', 'event', 'History', 'navigate'); return true;">Tilastot</a></p>
    <p>
    Lähdekoodi: <a href="https://github.com/eeroan/tennisvuorot">GitHub</a>
    <br>Twitter: <a href="https://twitter.com/eeroan">@eeroan</a>
    <br>Töissä: <a href="http://reaktor.com">Reaktorilla</a></p>
    <form class="feedbackForm">
    <textarea class="feedback" placeholder="Tähän voit antaa palautetta ja toiveita"></textarea>
    <button type="submit" class="submitFeedback">Lähetä</button>
    </form>
    <p><div class="fb-like" data-href="http://tennisvuorot.fi" data-layout="button_count" data-action="like" data-show-faces="false" data-share="true"></div></p>
    <div class="close">&times;</div>
</div>
<div id="map_wrapper" style="display: none" class="locationMap modal">
    <div id="map_canvas" class="mapping"></div>
    <div class="close">&times;</div>
</div>`
