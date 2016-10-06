/// <reference path="../node_modules/@types/jquery/index.d.ts" />
var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
var context: CanvasRenderingContext2D = canvas.getContext('2d');
var img: HTMLImageElement;

class GameModel {
    allRegions: GameRegion[] = [];
    activeDrawRegion: Polyline = null;
    currentMousePoint: Point = null;
    hoverRegion: GameRegion = null;
}

class GameRegion {
    constructor(p: Polyline, n: string, a: string[], u: number, c: Point) {
        this.coords = p;
        this.name = n;
        this.adjacent = a;
        this.startingUnits = u;
        this.unitCoords = c;
        this.currentUnits = u;
    }
    coords: Polyline;
    name: string;
    unitCoords: Point;
    adjacent: string[] = ["placeholder"];
    startingUnits: number = 1;
    team: string;
    continentColor: string;
    currentUnits: number = 0;
    static getRegion(name: string, all: GameRegion[]): GameRegion {
        for (let i = 0; i < all.length; i++) {
            if (all[i].name == name)
                return all[i];
        }
        return null;
    }

}

interface IContinent {
    name: string;
    territories: string[];
    ownershipPoints: number;
    color: string;
}

class Card {
    region: GameRegion;
    stars: number;
    constructor(r: GameRegion, s: number) {
        this.region = r;
        this.stars = s;
    }

}
class Player {
    team: string;
}
class Continent {
    constructor(n: string, r: GameRegion[], p: number) {
        this.name = n;
        this.regions = r;
        this.points = p;
    }
    name: string = "";
    regions: GameRegion[] = [];
    points: number = 0;
}

var players: Player[] = [];
var numPlayers: number = 0;
var currentPlayer: Player;
var model: GameModel = new GameModel();

$(() => {
    console.log('we were here');
    img = <HTMLImageElement>document.getElementById('riskmap');
    context.font = "bold 16px Arial";
    context.fillText('loading...', canvas.width / 2, canvas.height / 2);
    setTimeout(() => {
        queueRedraw();
    }, 1000);

    canvas.onmousemove = function (ev: MouseEvent) {
        var pt = Point.parse(ev);
        if (model.activeDrawRegion != null) {
            model.currentMousePoint = pt;
            queueRedraw();
        } else {
            doHittest(pt);
        }
    };

    $('#threePlayers').click(function (ev) {
        numPlayers = 3;
        for (var i = 0; i < 3; i++) {
            players[i] = new Player;
        }
        players[0].team = "red";
        players[1].team = "cornflowerblue";
        players[2].team = "green";
        setup();
    });

    $('#fourPlayers').click(function (ev) {
        numPlayers = 4;
        for (var i = 0; i < 4; i++) {
            players[i] = new Player;
        }
        players[0].team = "red";
        players[1].team = "cornflowerblue";
        players[2].team = "green";
        players[3].team = "yellow";
        setup();
    });
    $('#fivePlayers').click(function (ev) {
        numPlayers = 5;
        for (var i = 0; i < 5; i++) {
            players[i] = new Player;
        }
        players[0].team = "red";
        players[1].team = "cornflowerblue";
        players[2].team = "green";
        players[3].team = "yellow";
        players[4].team = "black";
        setup();
    });
    //how do i make a comment??
});
$.getJSON('map.json', function (data) {
    loadRegions(data);

});

var continents: IContinent[];
$.getJSON('continents.json', function (data) {
    continents = data;

});

function setup() {
    currentPlayer = players[0];
    var deck: Card[] = [];
    for (var i = 0; i < model.allRegions.length; i++) {
        deck[i] = new Card(model.allRegions[i], model.allRegions[i].startingUnits)
    }
    var temp: Card;
    for (var i = deck.length - 1; i > 0; i--) {
        var index = Math.floor(Math.random() * i);
        temp = deck[i];
        deck[i] = deck[index];
        deck[index] = temp;
    }
    for (var i = 0; i < deck.length; i++) {
        deck[i].region.team = players[i % numPlayers].team;
    }
    
}

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
            context.fillStyle = model.allRegions[i].team;
            context.fillText(model.allRegions[i].name + ' ' + model.allRegions[i].currentUnits.toString,
                             model.allRegions[i].unitCoords.x,
                             model.allRegions[i].unitCoords.y);
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

function loadRegions(data: any) {
    for (var i = 0; i < data.length; i++) {

        var points: Point[] = [];
        var shapes: Polyline[] = [];
        for (var j = 0; j < data[i].coords.pts.length; j++) {
            points[j] = new Point(data[i].coords.pts[j].x, data[i].coords.pts[j].y);
        }
        shapes[i] = new Polyline(points);
        for (var j = 0; j < data[i].adjacent[j]; j++) {
            model.allRegions[i].adjacent[j] = data[i].adjacent[j];
            model.allRegions[i].adjacent[j] = data[i].adjacent[j];
        }
        var unitC = new Point(data[i].unitCoords.x, data[i].unitCoords.y)
        model.allRegions[i] = new GameRegion(shapes[i], data[i].name, data[i].adjacent, data[i].startingUnits, unitC);
    }
    console.log(model.allRegions);
}
function drawRegion(ctx: CanvasRenderingContext2D, r: GameRegion) {
    var saveState = ctx.save();
    ctx.strokeStyle = 'red';
    context.lineWidth = 3;
    if (r == model.hoverRegion) {
        context.fillStyle = 'black';
    }
    r.coords.draw(ctx);
    if (r == model.hoverRegion) {
        for (let i = 0; i < continents.length; i++){
            if (continents[i].territories.indexOf(r.name) >= 0) {
                context.fillStyle = continents[i].color;
            }
        context.globalAlpha = 0.5;
        context.fill();
        context.globalAlpha = 1;
    } else if (model.hoverRegion != null) {
        // is it adjacent?
        if (model.hoverRegion.adjacent.indexOf(r.name) >= 0) {
            for (let i = 0; i < continents.length; i++){
            if (continents[i].territories.indexOf(r.name) >= 0) {
                context.fillStyle = continents[i].color;
            }
            context.globalAlpha = 0.3;
            context.fill();
            context.globalAlpha = 1;
        }
    }
    ctx.stroke();
    ctx.restore();
}


function convertCoords(c: HTMLCanvasElement, x: number, y: number): Point {
    var bbox = c.getBoundingClientRect();
    return new Point(
        x - bbox.left * (c.width / bbox.width),
        y - bbox.top * (c.height / bbox.height));
}
