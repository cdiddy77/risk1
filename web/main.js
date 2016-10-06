var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
// draw a circle to get started
function convertWindowCoordsToCanvas(c, x, y) {
    var bbox = c.getBoundingClientRect();
    return {
        x: x - bbox.left * (c.width / bbox.width),
        y: y - bbox.top * (c.height / bbox.height)
    };
}
canvas.onmousedown = function (e) {
};
//# sourceMappingURL=main.js.map