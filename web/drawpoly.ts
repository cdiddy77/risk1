/// <reference path="../node_modules/@types/jquery/index.d.ts" />
var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
var context: CanvasRenderingContext2D = canvas.getContext('2d');
var img: HTMLImageElement;

class Model {
    allRegions: Region[] = [];
    activeDrawRegion: Polyline = null;
    currentMousePoint: Point = null;
    hoverRegion: Region = null;
}

class Region {
    constructor(p: Polyline, n: string) {
        this.coords = p;
        this.name = n;
    }
    coords: Polyline;
    name: string;
    unitCoords: Point;
    adjacent: Region[] = [];
}

var model: Model = new Model();

$(() => {
    console.log('we were here');
    img = <HTMLImageElement>document.getElementById('riskmap');
    context.font = "bold 16px Arial";
    context.fillText('loading...', canvas.width / 2, canvas.height / 2);
    setTimeout(() => {
        queueRedraw();
    }, 1000);

    canvas.onmousedown = function (ev: MouseEvent) {
        console.log('onmousedown');
        if (model.activeDrawRegion == null && model.hoverRegion == null) {
            model.activeDrawRegion = new Polyline();
        }
        var pt = Point.parse(ev);
        if (model.hoverRegion != null) {
            model.hoverRegion.unitCoords = pt;
        }
        // if the point is really close to the start of the polyline, 
        // then we will just close the polyline
        if (model.activeDrawRegion != null) {
            if (model.activeDrawRegion.pts.length > 0
                && Vector.fromPoints(model.activeDrawRegion.pts[0], pt).magnitude < 10) {
                model.activeDrawRegion.addPoint(model.activeDrawRegion.pts[0]);
                model.allRegions.push(new Region(model.activeDrawRegion, 'unnamed-region'));
                model.activeDrawRegion = null;
                model.currentMousePoint = null;
            } else {
                model.activeDrawRegion.addPoint(pt);
            }
        }
        queueRedraw();
    };
    canvas.onmousemove = function (ev: MouseEvent) {
        var pt = Point.parse(ev);
        if (model.activeDrawRegion != null) {
            model.currentMousePoint = pt;
            queueRedraw();
        } else {
            doHittest(pt);
        }
    };

    $('#clearAllButton').click(function (ev) {
        model.activeDrawRegion = null;
        model.currentMousePoint = null;
        model.allRegions = [];
        queueRedraw();
    });

    $('#dumpAllRegionsButton').click(function (ev) {
        console.log(JSON.stringify(model.allRegions));
    });

});

function doHittest(pt: Point) {
    let originalHoverRegion = model.hoverRegion;
    model.hoverRegion = null;
    for (let i = 0; i < model.allRegions.length; i++) {
        if (model.allRegions[i].coords.isPointInside(pt)) {
            model.hoverRegion = model.allRegions[i];
        }
    }
    if (model.hoverRegion != originalHoverRegion)
        queueRedraw();
}

function queueRedraw(): void {
    window.requestAnimationFrame(function (time: number) {
        drawModel();
    });
}

function drawModel(time?: number): void {
    if (!time)
        time = window.performance.now();
    context.drawImage(img, 0, 0, 1354, 850);

    for (var i = 0; i < model.allRegions.length; i++) {
        drawRegion(context, model.allRegions[i]);
        if (model.allRegions[i].unitCoords != null) {
            context.beginPath();
            context.arc(model.allRegions[i].unitCoords.x, model.allRegions[i].unitCoords.y, 5, 0, 2 * Math.PI);
            context.stroke();
        }
    }
    if (model.activeDrawRegion != null) {
        context.strokeStyle = 'green';
        context.lineWidth = 3;
        model.activeDrawRegion.draw(context);
        context.stroke();
    }
    if (model.currentMousePoint != null && model.activeDrawRegion != null) {
        context.strokeStyle = 'purple';
        context.lineWidth = 3;
        context.beginPath();
        var lastPt = model.activeDrawRegion.pts[model.activeDrawRegion.pts.length - 1];
        context.moveTo(lastPt.x, lastPt.y);
        context.lineTo(model.currentMousePoint.x, model.currentMousePoint.y);
        context.stroke();
    }
}

function drawRegion(ctx: CanvasRenderingContext2D, r: Region) {
    ctx.strokeStyle = 'red';
    context.lineWidth = 3;
    if (r == model.hoverRegion) {
        context.fillStyle = 'red';
    }
    r.coords.draw(ctx);
    if (r == model.hoverRegion) {
        context.globalAlpha = 0.3;
        context.fill();
        context.globalAlpha = 1;
    }
    ctx.stroke();
}

function convertCoords(c: HTMLCanvasElement, x: number, y: number): Point {
    var bbox = c.getBoundingClientRect();
    return new Point(
        x - bbox.left * (c.width / bbox.width),
        y - bbox.top * (c.height / bbox.height));
}