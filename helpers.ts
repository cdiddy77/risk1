//
// POINT
// ========================================================================
class Point {
    x: number;
    y: number;
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    static parse(event: MouseEvent): Point {
        var canvasRect = canvas.getBoundingClientRect();

        return new Point(
            event.clientX - canvasRect.left,
            event.clientY - canvasRect.top);
    }

    toAttrString(): string { return this.x.toString() + ',' + this.y; }
}

//
// VECTOR
// ========================================================================
class Vector {
    x: number;
    y: number;
    constructor(x: number = 0, y: number = 0) {

        var point = { x, y };
        this.x = point.x;
        this.y = point.y;
    }

    get magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    set magnitude(m) {
        var uv = this.normalize();
        this.x = uv.x * m;
        this.y = uv.y * m;
    }

    static fromPoints(p1, p2) {
        return new Vector(p2.x - p1.x, p2.y - p1.y);
    }

    cross(vector) {
        return this.x * vector.y - this.y * vector.x;
    }

    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    divide(scalar) {
        return new Vector(this.x / scalar, this.y / scalar);
    }

    normalize() {
        var v = new Vector();
        var m = this.magnitude;
        v.x = this.x / m;
        v.y = this.y / m;
        return v;
    }

    unit() {
        return this.divide(this.magnitude);
    }

    perp() {
        return new Vector(-this.y, this.x)
    }

    perpendicular(vector) {
        return this.subtract(this.project(vector));
    }

    project(vector) {
        var percent = this.dot(vector) / vector.dot(vector);
        return vector.multiply(percent);
    }

    reflect(axis) {
        var vdot = this.dot(axis);
        var ldot = axis.dot(axis);
        var ratio = vdot / ldot;
        var v = new Vector();
        v.x = 2 * ratio * axis.x - this.x;
        v.y = 2 * ratio * axis.y - this.y;
        return v;
    }
}

class Polyline {
    pts: Point[] = [];

    addPoint(p: Point) {
        this.pts.push(p);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.pts[0].x, this.pts[0].y);
        for (var i = 1; i < this.pts.length; i++) {
            ctx.lineTo(this.pts[i].x, this.pts[i].y);
        }
       
    }

    	isPointInside(testPoint:Point):boolean
		{
			let i:number;
            let j:number;
			let c:boolean = false;
			for (i = 0, j = this.pts.length - 1; i < this.pts.length; j = i++)
			{
				if (((this.pts[i].y > testPoint.y) != (this.pts[j].y > testPoint.y)) 
				&& (testPoint.x < (this.pts[j].x - this.pts[i].x) * (testPoint.y - this.pts[i].y) / (this.pts[j].y - this.pts[i].y) + this.pts[i].x))
				{
					c = !c;
				}
			}

			return c;
		}
}