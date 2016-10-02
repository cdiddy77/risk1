var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
//draw a circle to get started
var rectangle = (function () {
    function rectangle() {
    }
    rectangle.prototype.rectangle = function (x, y, w, h, value) {
        context.fillRect(x, y, w, h);
        context.fillText(value.toString(), x + w + 20, y + h + 20);
        return { left: x, top: y, right: x + w, bottom: y + h, val: value };
    };
    return rectangle;
}());
function windowToCanvas(canvas, x, y) {
    var bbox = canvas.getBoundingClientRect();
    return { x: x - bbox.left * (canvas.width / bbox.width),
        y: y - bbox.top * (canvas.height / bbox.height) };
}
function isInside(rect, x, y) {
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return true;
    }
    else {
        return false;
    }
    ;
}
function updateMouseVal() {
    context.clearRect(canvas.width - 50, canvas.height - 50, 50, 50);
    context.fillText(mouseValue.toString(), canvas.width - 20, canvas.height - 20);
}
var tangles = [];
tangles.push(new rectangle());
var mouseValue = 0;
canvas.onmousedown = function (e) {
    var loc = windowToCanvas(canvas, e.clientX, e.clientY);
    if (isInside(unit, loc.x, loc.y)) {
        unit.val -= 1;
        mouseValue += 1;
        updateMouseVal();
    }
    else {
        drawRect(loc.x - 12.5, loc.y - 25, 25, 50, 1);
        mouseValue -= 1;
        updateMouseVal();
    }
};
//# sourceMappingURL=main.js.map