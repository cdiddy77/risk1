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
    static take(from: GameRegion) {
        from.currentUnits--;
        heldUnits++;
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
    order: number;
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

$('#warning').addClass('hidden');
canvas.onmousedown = function (ev: MouseEvent) {
    if (model.hoverRegion != null) {
        if (model.hoverRegion.team != currentPlayer.team && selectedCountry == null) {
            $('#warning').removeClass('hidden');
            console.log('not yours');
        }
        if (selectedCountry != null || model.hoverRegion.team == currentPlayer.team) {
            $('#warning').addClass('hidden');
            nextClick(model.hoverRegion.adjacent, model.hoverRegion);
        }

    }
}
var selectedCountry: GameRegion = null;
function nextClick(adjacent: string[], startRegion: GameRegion) {
    console.log('check2');

    if (selectedCountry == null) {
        console.log('check3');
        if (model.hoverRegion.currentUnits > 1) {
            $('#battleBox').text(startRegion.name + ' is attacking with ' + (startRegion.currentUnits - 1) + ' unit(s)');
            selectedCountry = startRegion;
        }
        else {$('#battleBox').text('not enough units to attack!');selectedCountry = null;}
    }
    else if (selectedCountry != null) {
        if (selectedCountry.adjacent.indexOf(model.hoverRegion.name) >= 0 && model.hoverRegion.team != selectedCountry.team) {
            console.log('check4');
            $('#battleBox').text(selectedCountry.name + ' is attacking ' + model.hoverRegion.name +
                ' with ' + (selectedCountry.currentUnits - 1) + ' unit(s)');
        }
        else {$('#battleBox').text('can\'t attack there!'); selectedCountry = null;}
    }

}

var players: Player[] = [];
var numPlayers: number = 0;
var currentPlayer: Player;
var model: GameModel = new GameModel();
var heldUnits: number = 0;
var attackDice: number = 0;
var defenseDice: number = 0;
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
        players[0].order = 0;
        players[1].order = 1;
        players[2].order = 2;
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
        players[0].order = 0;
        players[1].order = 1;
        players[2].order = 2;
        players[3].order = 3;
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
        players[0].order = 0;
        players[1].order = 1;
        players[2].order = 2;
        players[3].order = 3;
        players[4].order = 4;
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
    console.log("check1");
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
            context.fillText(model.allRegions[i].name + ' ' + model.allRegions[i].currentUnits,
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
        for (let i = 0; i < continents.length; i++) {
            if (continents[i].territories.indexOf(r.name) >= 0) {
                context.fillStyle = continents[i].color;
            }
        }
        context.globalAlpha = 0.6;
        context.fill();
        context.globalAlpha = 1.0;
    } else if (model.hoverRegion != null) {
        // is it adjacent?
        if (model.hoverRegion.adjacent.indexOf(r.name) >= 0) {

            for (let i = 0; i < continents.length; i++) {

                if (continents[i].territories.indexOf(r.name) >= 0) {

                    context.fillStyle = continents[i].color;
                    context.globalAlpha = 0.3;
                    context.fill();
                    context.globalAlpha = 1.0;
                }

            }
        }


    }
}

function convertCoords(c: HTMLCanvasElement, x: number, y: number): Point {
    var bbox = c.getBoundingClientRect();
    return new Point(
        x - bbox.left * (c.width / bbox.width),
        y - bbox.top * (c.height / bbox.height));
}
