var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
// draw a circle to get started
var Country = (function () {
    function Country() {
    }
    return Country;
}());
var heldUnits;
function convertWindowCoordsToCanvas(c, x, y) {
    var bbox = c.getBoundingClientRect();
    return {
        x: x - bbox.left * (c.width / bbox.width),
        y: y - bbox.top * (c.height / bbox.height)
    };
}
canvas.onmousedown = function (e) {
    //check if the mouse is inside a country
    //check if that country belongs to the current player
    if (heldUnits == 0) {
        if (e.which === 1) {
            //subtract 1 from that country's units
            heldUnits++;
        }
        if (e.which === 3) {
        }
    }
    if (heldUnits > 0) {
        if (e.which === 1) {
        }
        if (e.which === 3) {
        }
    }
};
//# sourceMappingURL=main.js.map