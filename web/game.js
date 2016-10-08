/// <reference path="../node_modules/@types/jquery/index.d.ts" />
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var img;
var GameModel = (function () {
    function GameModel() {
        this.allRegions = [];
        this.activeDrawRegion = null;
        this.currentMousePoint = null;
        this.hoverRegion = null;
    }
    return GameModel;
}());
var GameRegion = (function () {
    function GameRegion(p, n, a, u, c) {
        this.adjacent = ["placeholder"];
        this.startingUnits = 1;
        this.currentUnits = 0;
        this.coords = p;
        this.name = n;
        this.adjacent = a;
        this.startingUnits = u;
        this.unitCoords = c;
        this.currentUnits = u;
    }
    GameRegion.getRegion = function (name, all) {
        for (var i = 0; i < all.length; i++) {
            if (all[i].name == name)
                return all[i];
        }
        return null;
    };
    GameRegion.take = function (from) {
        from.currentUnits--;
        heldUnits++;
    };
    return GameRegion;
}());
var Card = (function () {
    function Card(r, s) {
        this.region = r;
        this.stars = s;
    }
    return Card;
}());
var Player = (function () {
    function Player() {
    }
    return Player;
}());
var Continent = (function () {
    function Continent(n, r, p) {
        this.name = "";
        this.regions = [];
        this.points = 0;
        this.name = n;
        this.regions = r;
        this.points = p;
    }
    return Continent;
}());
$('#warning').addClass('hidden');
$('#attackButton').addClass('hidden');
canvas.onmousedown = function (ev) {
    if (model.hoverRegion != null) {
        if (model.hoverRegion.team != currentPlayer.team && selectedRegion == null) {
            $('#warning').removeClass('hidden');
            console.log('not yours');
        }
        if (selectedRegion != null || model.hoverRegion.team == currentPlayer.team) {
            $('#warning').addClass('hidden');
            nextClick(model.hoverRegion.adjacent, model.hoverRegion);
        }
    }
};
var selectedRegion = null;
function nextClick(adjacent, startRegion) {
    console.log('check2');
    if (selectedRegion == null) {
        console.log('check3');
        if (model.hoverRegion.currentUnits > 1) {
            $('#battleBox').text(startRegion.name + ' is attacking with ' + (startRegion.currentUnits - 1) + ' unit(s)');
            selectedRegion = startRegion;
        }
        else {
            $('#battleBox').text('not enough units to attack!');
            selectedRegion = null;
        }
    }
    else if (selectedRegion != null) {
        if (selectedRegion.adjacent.indexOf(model.hoverRegion.name) >= 0 && model.hoverRegion.team != selectedRegion.team) {
            console.log('check4');
            $('#battleBox').text(selectedRegion.name + ' is attacking ' + model.hoverRegion.name +
                ' with ' + (selectedRegion.currentUnits - 1) + ' unit(s)');
            if (selectedRegion.currentUnits >= 3) {
                attackDice = 3;
            }
            else
                attackDice = selectedRegion.currentUnits - 1;
            if (model.hoverRegion.currentUnits >= 2) {
                defenseDice = 2;
            }
            else
                defenseDice = model.hoverRegion.currentUnits;
            attackRegion = selectedRegion;
            defenseRegion = model.hoverRegion;
            $('#attackButton').removeClass('hidden');
        }
        else {
            $('#battleBox').text('can\'t attack there!');
            selectedRegion = null;
        }
    }
}
var attackRegion;
var defenseRegion;
$('#nextTurn').click(function (ev) {
    console.log('check6');
    if (currentPlayer.order == numPlayers - 1) {
        currentPlayer = players[0];
    }
    else
        currentPlayer = players[currentPlayer.order + 1];
});
$('#attackButton').click(function (ev) {
    console.log('check5');
    var temp = 0;
    for (var i = 0; i < defenseDice; i++) {
        defenseRoll[i] = Math.floor(Math.random() * ((6 - 1) + 1) + 1);
    }
    for (var i = 0; i < attackDice; i++) {
        attackRoll[i] = Math.floor(Math.random() * ((6 - 1) + 1) + 1);
    }
    if (attackRoll.length == 3) {
        if (attackRoll[2] > attackRoll[0]) {
            temp = attackRoll[2];
            attackRoll[2] = attackRoll[0];
            attackRoll[0] = temp;
        }
        if (attackRoll[2] > attackRoll[1]) {
            temp = attackRoll[2];
            attackRoll[2] = attackRoll[1];
            attackRoll[1] = temp;
        }
    }
    if (defenseRoll[1] > defenseRoll[0]) {
        temp = defenseRoll[1];
        defenseRoll[1] = defenseRoll[0];
        defenseRoll[0] = temp;
    }
    if (attackDice > 1 && defenseDice > 1) {
        if (attackRoll[0] > defenseRoll[0]) {
            defenseRegion.currentUnits--;
        }
        else
            attackRegion.currentUnits--;
        if (attackRoll[1] > defenseRoll[1]) {
            defenseRegion.currentUnits--;
        }
        else
            attackRegion.currentUnits--;
    }
    else {
        if (attackRoll[0] > defenseRoll[0]) {
            defenseRegion.currentUnits--;
        }
        else
            attackRegion.currentUnits--;
    }
    if (attackRegion.currentUnits < 2) {
        $('#attackButton').addClass('hidden');
        $('#battleBox').text('not enought units to continue attacking!');
        selectedRegion = null;
    }
    if (defenseRegion.currentUnits == 0) {
        defenseRegion.team = currentPlayer.team;
        defenseRegion.currentUnits = attackRegion.currentUnits - 1;
        attackRegion.currentUnits = 1;
        $('#attackButton').addClass('hidden');
        $('#battleBox').text('huzzah! ' + currentPlayer.team + ' takes ' + defenseRegion.name);
        selectedRegion = null;
    }
});
var players = [];
var numPlayers = 0;
var currentPlayer;
var model = new GameModel();
var heldUnits = 0;
var attackDice = 0;
var defenseDice = 0;
var attackRoll = [0, 0, 0];
var defenseRoll = [0, 0];
$(function () {
    console.log('we were here');
    img = document.getElementById('riskmap');
    context.font = "bold 16px Arial";
    context.fillText('loading...', canvas.width / 2, canvas.height / 2);
    setTimeout(function () {
        queueRedraw();
    }, 1000);
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
var continents;
$.getJSON('continents.json', function (data) {
    continents = data;
});
function setup() {
    $('#attackButton').addClass('hidden');
    console.log("check1");
    currentPlayer = players[0];
    var deck = [];
    for (var i = 0; i < model.allRegions.length; i++) {
        deck[i] = new Card(model.allRegions[i], model.allRegions[i].startingUnits);
    }
    var temp;
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
            context.fillStyle = model.allRegions[i].team;
            context.fillText(model.allRegions[i].name + ' ' + model.allRegions[i].currentUnits, model.allRegions[i].unitCoords.x, model.allRegions[i].unitCoords.y);
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
        model.allRegions[i] = new GameRegion(shapes[i], data[i].name, data[i].adjacent, data[i].startingUnits, unitC);
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
        for (var i = 0; i < continents.length; i++) {
            if (continents[i].territories.indexOf(r.name) >= 0) {
                context.fillStyle = continents[i].color;
            }
        }
        context.globalAlpha = 0.6;
        context.fill();
        context.globalAlpha = 1.0;
    }
    else if (model.hoverRegion != null) {
        // is it adjacent?
        if (model.hoverRegion.adjacent.indexOf(r.name) >= 0) {
            for (var i = 0; i < continents.length; i++) {
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
function convertCoords(c, x, y) {
    var bbox = c.getBoundingClientRect();
    return new Point(x - bbox.left * (c.width / bbox.width), y - bbox.top * (c.height / bbox.height));
}
//# sourceMappingURL=game.js.map