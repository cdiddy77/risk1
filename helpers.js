//
// POINT
// ========================================================================
var Point = (function () {
    function Point(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
    }
    Point.parse = function (event) {
        var canvasRect = canvas.getBoundingClientRect();
        return new Point(event.clientX - canvasRect.left, event.clientY - canvasRect.top);
    };
    Point.prototype.toAttrString = function () { return this.x.toString() + ',' + this.y; };
    return Point;
}());
//
// VECTOR
// ========================================================================
var Vector = (function () {
    function Vector(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        var point = { x: x, y: y };
        this.x = point.x;
        this.y = point.y;
    }
    Object.defineProperty(Vector.prototype, "magnitude", {
        get: function () { return Math.sqrt(this.x * this.x + this.y * this.y); },
        set: function (m) {
            var uv = this.normalize();
            this.x = uv.x * m;
            this.y = uv.y * m;
        },
        enumerable: true,
        configurable: true
    });
    Vector.fromPoints = function (p1, p2) {
        return new Vector(p2.x - p1.x, p2.y - p1.y);
    };
    Vector.prototype.cross = function (vector) {
        return this.x * vector.y - this.y * vector.x;
    };
    Vector.prototype.dot = function (vector) {
        return this.x * vector.x + this.y * vector.y;
    };
    Vector.prototype.add = function (vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    };
    Vector.prototype.subtract = function (vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    };
    Vector.prototype.multiply = function (scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    };
    Vector.prototype.divide = function (scalar) {
        return new Vector(this.x / scalar, this.y / scalar);
    };
    Vector.prototype.normalize = function () {
        var v = new Vector();
        var m = this.magnitude;
        v.x = this.x / m;
        v.y = this.y / m;
        return v;
    };
    Vector.prototype.unit = function () {
        return this.divide(this.magnitude);
    };
    Vector.prototype.perp = function () {
        return new Vector(-this.y, this.x);
    };
    Vector.prototype.perpendicular = function (vector) {
        return this.subtract(this.project(vector));
    };
    Vector.prototype.project = function (vector) {
        var percent = this.dot(vector) / vector.dot(vector);
        return vector.multiply(percent);
    };
    Vector.prototype.reflect = function (axis) {
        var vdot = this.dot(axis);
        var ldot = axis.dot(axis);
        var ratio = vdot / ldot;
        var v = new Vector();
        v.x = 2 * ratio * axis.x - this.x;
        v.y = 2 * ratio * axis.y - this.y;
        return v;
    };
    return Vector;
}());
var Polyline = (function () {
    function Polyline() {
        this.pts = [];
    }
    Polyline.prototype.addPoint = function (p) {
        this.pts.push(p);
    };
    Polyline.prototype.draw = function (ctx) {
        ctx.beginPath();
        ctx.moveTo(this.pts[0].x, this.pts[0].y);
        for (var i = 1; i < this.pts.length; i++) {
            ctx.lineTo(this.pts[i].x, this.pts[i].y);
        }
    };
    return Polyline;
}());
//# sourceMappingURL=helpers.js.map