/// <reference path="../node_modules/@types/jquery/index.d.ts" />
var drawpoly;
(function (drawpoly) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var img;
    var Model = (function () {
        function Model() {
            this.allRegions = [];
            this.activeDrawRegion = null;
            this.currentMousePoint = null;
            this.hoverRegion = null;
        }
        return Model;
    }());
    var Region = (function () {
        function Region(p, n, a, u, c) {
            this.adjacent = ["placeholder"];
            this.startingUnits = 1;
            this.coords = p;
            this.name = n;
            this.adjacent = a;
            this.startingUnits = u;
            this.unitCoords = c;
        }
        return Region;
    }());
    var model = new Model();
    $(function () {
        console.log('we were here');
        img = document.getElementById('riskmap');
        context.font = "bold 16px Arial";
        context.fillText('loading...', canvas.width / 2, canvas.height / 2);
        setTimeout(function () {
            queueRedraw();
        }, 1000);
        canvas.onmousedown = function (ev) {
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
                }
                else {
                    model.activeDrawRegion.addPoint(pt);
                }
            }
            queueRedraw();
        };
        canvas.onmousemove = function (ev) {
            var pt = Point.parse(ev);
            if (model.activeDrawRegion != null) {
                model.currentMousePoint = pt;
                queueRedraw();
            }
            else {
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
        //'red'
    });
    $.getJSON('map.json', function (data) {
        loadRegions(data);
        console.log("check1");
    });
    function doHittest(pt) {
        var originalHoverRegion = model.hoverRegion;
        model.hoverRegion = null;
        for (var i = 0; i < model.allRegions.length; i++) {
            if (model.allRegions[i].coords.isPointInside(pt)) {
                model.hoverRegion = model.allRegions[i];
            }
        }
        if (model.hoverRegion != originalHoverRegion)
            queueRedraw();
    }
    function queueRedraw() {
        window.requestAnimationFrame(function (time) {
            drawModel();
        });
    }
    function drawModel(time) {
        if (!time)
            time = window.performance.now();
        context.drawImage(img, 0, 0, 1354, 850);
        for (var i = 0; i < model.allRegions.length; i++) {
            drawRegion(context, model.allRegions[i]);
            if (model.allRegions[i].unitCoords != null) {
                context.fillText(model.allRegions[i].name, model.allRegions[i].unitCoords.x, model.allRegions[i].unitCoords.y);
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
    function loadRegions(data) {
        for (var i = 0; i < data.length; i++) {
            var points = [];
            var shapes = [];
            for (var j = 0; j < data[i].coords.pts.length; j++) {
                points[j] = new Point(data[i].coords.pts[j].x, data[i].coords.pts[j].y);
            }
            shapes[i] = new Polyline(points);
            for (var j = 0; j < data[i].adjacent[j]; j++) {
                model.allRegions[i].adjacent[j] = data[i].adjacent[j];
                model.allRegions[i].adjacent[j] = data[i].adjacent[j];
            }
            var unitC = new Point(data[i].unitCoords.x, data[i].unitCoords.y);
            model.allRegions[i] = new Region(shapes[i], data[i].name, data[i].adjacent, data[i].startingUnits, unitC);
        }
        console.log(model.allRegions);
    }
    function drawRegion(ctx, r) {
        var saveState = ctx.save();
        ctx.strokeStyle = 'red';
        context.lineWidth = 3;
        if (r == model.hoverRegion) {
            context.fillStyle = 'black';
        }
        r.coords.draw(ctx);
        if (r == model.hoverRegion) {
            context.globalAlpha = 0.3;
            context.fill();
            context.globalAlpha = 1;
        }
        else if (model.hoverRegion != null) {
            // is it adjacent?
            if (model.hoverRegion.adjacent.indexOf(r.name) >= 0) {
                context.fillStyle = 'green';
                context.globalAlpha = 0.6;
                context.fill();
                context.globalAlpha = 1;
            }
        }
        ctx.stroke();
        ctx.restore();
    }
    function convertCoords(c, x, y) {
        var bbox = c.getBoundingClientRect();
        return new Point(x - bbox.left * (c.width / bbox.width), y - bbox.top * (c.height / bbox.height));
    }
})(drawpoly || (drawpoly = {}));
//# sourceMappingURL=drawpoly.js.map