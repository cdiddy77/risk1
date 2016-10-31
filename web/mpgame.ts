/// <reference path="../node_modules/@types/jquery/index.d.ts" />
/// <reference path="../node_modules/firebase/firebase.d.ts" />

namespace mpgame {

    var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
    var context: CanvasRenderingContext2D = canvas.getContext('2d');
    var img: HTMLImageElement;


    // firebase stuffs
    var fpapp: firebase.app.App;
    var fbGameRef: firebase.database.Reference;

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
        }
        coords: Polyline;
        name: string;
        unitCoords: Point;
        adjacent: string[] = ["placeholder"];
        startingUnits: number = 1;
        continentColor: string;

        static getRegion(name: string, all: GameRegion[]): GameRegion {
            for (let i = 0; i < all.length; i++) {
                if (all[i].name == name)
                    return all[i];
            }
            return null;
        }
        static take(from: RegionTeamOwnership) {
            if (from.currentUnits > 1) {
                from.currentUnits--;
                heldUnits++;
            } else $('#battleBox').text('not enough units to take!');

        }
        static isAdjacent(region1: GameRegion, region2: GameRegion) {
            if (region2.adjacent.indexOf(region1.name) >= 0) {
                return true;
            } else return false;
        }
    }

    interface IContinent {
        name: string;
        territories: string[];
        ownershipPoints: number;
        color: string;
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
    $('#hand').html("<button id='hand' type='button' class='btn btn-primary'>my hand: </button>");
    $('#warning').addClass('hidden');
    $('#attackButton').addClass('hidden');
    $('#undo').click(function (ev) {
        if (actions.length > 0) {
            gk.changeCurrentUnits(actions[actions.length - 1], -1);
            unitPool++;
            actions.splice(actions.length - 1, 1);
            $('#battleBox').text(currentPlayer().userName + ', you have ' + unitPool + ' units to spend');
            queueRedraw();
        } else $('#battleBox').text('you havent done anything');
    })
    var turn: number = 1;
    canvas.onmousedown = function (ev: MouseEvent) {
        if (currentPhase == 0) {

            if (round == 1) {
                if (model.hoverRegion == null || gk.getCurrentTeam(model.hoverRegion) != null) {
                    $('#warning').removeClass('hidden');
                }
                else if (model.hoverRegion != null) {
                    $('#warning').addClass('hidden');
                    gk.setCurrentTeam(model.hoverRegion, currentPlayer().userName);
                    gk.changeCurrentUnits(model.hoverRegion, 1);
                }
            }
            else {
                if (model.hoverRegion == null) {
                    $('#warning').removeClass('hidden');
                }
                if (gk.getCurrentTeam(model.hoverRegion) != currentPlayer().userName) {
                    $('#warning').removeClass('hidden');
                }
                if (gk.getCurrentTeam(model.hoverRegion) == currentPlayer().userName) {
                    $('#warning').addClass('hidden');
                    gk.changeCurrentUnits(model.hoverRegion, 1);
                }

            }
            if (currentPlayer().order == players.length - 1 && turn != 1) {
                unitPool--;
            }
            if (currentPlayerIndex == players.length - 1) {
                if (turn == 42) {
                    round++;
                }
            }
            if (model.hoverRegion != null && $('#warning').hasClass('hidden')) {
                turn += 1;
                nextPlayer();
            }

            if (unitPool == 0) {
                currentPhase = 1;
            }

        }
        else if (currentPhase == 1) {
            if (unitPool == 0) { $('#battleBox').text('nothing left to place'); }
            else if (model.hoverRegion == null) {
                $('#warning').removeClass('hidden');
            }
            else if (gk.getCurrentTeam(model.hoverRegion) != currentPlayer().userName) {
                $('#warning').removeClass('hidden');
            }
            else if (gk.getCurrentTeam(model.hoverRegion) == currentPlayer().userName) {
                unitPool--;
                gk.changeCurrentUnits(model.hoverRegion, 1);
                actions[actions.length] = model.hoverRegion;
                $('#warning').addClass('hidden');
            }

            if (currentPhase == 1) {
                $('#battleBox').text(currentPlayer().userName + ', you have ' + unitPool + ' units to spend');
            }
        }
        else if (currentPhase == 2) {
            if (model.hoverRegion != null) {
                if (gk.getCurrentTeam(model.hoverRegion) != currentPlayer().userName && selectedRegion == null) {
                    $('#warning').removeClass('hidden');

                }
                if (selectedRegion != null || gk.getCurrentTeam(model.hoverRegion) == currentPlayer().userName) {
                    $('#warning').addClass('hidden');
                    attackClick(model.hoverRegion.adjacent, model.hoverRegion);
                }

            }
        }
        else if (currentPhase == 3) {
            moveClick();
        }
        queueRedraw();
    }
    $('#tradein').addClass('hidden');
    $('#tradein').click(function (ev) {
        if (currentPhase == 1) {
            cardPoints = 0;
            for (let i = 0; i < tradeIns.length; i++) {
                cardPoints += tradeIns[i].stars;
            }

            if (cardPoints > 1) {
                $('#hand').html("<button id='hand' type='button' class='btn btn-primary'>my hand: </button>");
                for (let i = 0; i < currentPlayer().hand.length; i++) {
                    if (tradeIns.indexOf(currentPlayer().hand[i]) >= 0) {
                        currentPlayer().hand.splice(i, tradeIns.length);
                    } else {
                        $('#hand').append('<button id="' + currentPlayer().hand[i].regionName + '" class="btn btn-primary" onclick="'
                            + (init(currentPlayer().hand[i])) + '">' + currentPlayer().hand[i].regionName + '</button>');
                    }

                }
                if (cardPoints == 2) {
                    unitPool += 2;
                }
                if (cardPoints == 3) {
                    unitPool += 4;
                }
                if (cardPoints == 4) {
                    unitPool += 7;
                }
                if (cardPoints == 5) {
                    unitPool += 10;
                }
                if (cardPoints == 6) {
                    unitPool += 13;
                }
                if (cardPoints == 7) {
                    unitPool += 17;
                }
                if (cardPoints == 8) {
                    unitPool += 21;
                }
                if (cardPoints == 9) {
                    unitPool += 25;
                }
                if (cardPoints >= 10) {
                    unitPool += 30;
                }
                tradeIns.splice(0, tradeIns.length);
                $('#tradein').text('trade in: ');
                for (let i = 0; i < tradeIns.length; i++) {
                    $('#tradein').append(tradeIns[i].regionName + ', ');
                }
            }
        }
        $('#battleBox').text(currentPlayer().userName + ', you have ' + unitPool + ' units to spend');
    })

    $('#tradein').mouseover(function (ev) {

        $('#tradein').text('trade in: ');
        for (let i = 0; i < tradeIns.length; i++) {
            $('#tradein').append(tradeIns[i].regionName + ', ');
        }
        if (currentPhase == 1) {
            cardPoints = 0;
            for (let i = 0; i < tradeIns.length; i++) {
                cardPoints += tradeIns[i].stars;
            }
            if (cardPoints == 1) {
                $('#tradein').append(' (0 points)');
            }
            if (cardPoints == 2) {
                $('#tradein').append(' (2 points)');
            }
            if (cardPoints == 3) {
                $('#tradein').append(' (4 points)');
            }
            if (cardPoints == 4) {
                $('#tradein').append(' (7 points)');
            }
            if (cardPoints == 5) {
                $('#tradein').append(' (10 points)');
            }
            if (cardPoints == 6) {
                $('#tradein').append(' (13 points)');
            }
            if (cardPoints == 7) {
                $('#tradein').append(' (17 points)');
            }
            if (cardPoints == 8) {
                $('#tradein').append(' (21 points)');
            }
            if (cardPoints == 9) {
                $('#tradein').append(' (25 points)');
            }
            if (cardPoints >= 10) {
                $('#tradein').append(' (30 points)');
            }
        }
    })

    function moveClick() {
        if (selectedRegion == null) {
            if (gk.getCurrentTeam(model.hoverRegion) == currentPlayer().userName) {
                selectedRegion = model.hoverRegion;
                $('#warning').addClass('hidden');
                GameRegion.take(gk.getOwnership(selectedRegion));
            }
            if (gk.getCurrentTeam(model.hoverRegion) != currentPlayer().userName) {
                $('#warning').removeClass('hidden');
            }
        }
        else if (selectedRegion != null) {
            if (model.hoverRegion == selectedRegion) {
                GameRegion.take(gk.getOwnership(selectedRegion));

            }
            else if (gk.getCurrentTeam(model.hoverRegion) == currentPlayer().userName) {
                if (GameRegion.isAdjacent(model.hoverRegion, selectedRegion)) {
                    gk.changeCurrentUnits(model.hoverRegion, heldUnits);
                    heldUnits = 0;
                    selectedRegion = null;
                } else {
                    $('#warning').removeClass('hidden');
                    selectedRegion = null;
                }
            } else {
                $('#warning').removeClass('hidden');
                selectedRegion = null;
            }
        }
    }
    var selectedRegion: GameRegion = null;
    function attackClick(adjacent: string[], startRegion: GameRegion) {

        if (selectedRegion == null) {

            if (gk.getCurrentUnits(model.hoverRegion) > 1) {
                $('#battleBox').text(startRegion.name + ' is attacking with ' + (gk.getCurrentUnits(startRegion) - 1) + ' unit(s)');
                selectedRegion = startRegion;
                attackUnits = gk.getCurrentUnits(selectedRegion) - 1;
            }
            else { $('#battleBox').text('not enough units to attack!'); selectedRegion = null; }
        }
        else if (selectedRegion != null) {
            if (model.hoverRegion == selectedRegion) {
                if (attackUnits == gk.getCurrentUnits(selectedRegion) - 1) {
                    attackUnits = 1;
                } else attackUnits++;
                $('#battleBox').text(startRegion.name + ' is attacking with ' + (attackUnits) + ' unit(s)');
            }
            else if (selectedRegion.adjacent.indexOf(model.hoverRegion.name) >= 0
                && gk.getCurrentTeam(model.hoverRegion) != gk.getCurrentTeam(selectedRegion)) {

                $('#battleBox').text(selectedRegion.name + ' is attacking ' + model.hoverRegion.name +
                    ' with ' + (gk.getCurrentUnits(selectedRegion) - 1) + ' unit(s)');
                if (attackUnits >= 3) {
                    attackDice = 3;
                } else attackDice = attackUnits;
                if (gk.getCurrentUnits(model.hoverRegion) >= 2) {
                    defenseDice = 2;
                } else defenseDice = gk.getCurrentUnits(model.hoverRegion);
                attackRegion = selectedRegion;
                defenseRegion = model.hoverRegion;
                $('#attackButton').removeClass('hidden');
            }
            else { $('#battleBox').text('can\'t attack there!'); selectedRegion = null; }
        }
    }

    function currentPlayer(): Player {
        if (currentPlayerIndex == -1)
            return null;
        else
            return players[currentPlayerIndex];
    }
    var attackRegion: GameRegion;
    var defenseRegion: GameRegion;
    $('#nextTurn').click(function (ev) {
        nextPlayer();
        $('#warning').addClass('hidden');
    })
    $('#attackButton').click(function (ev) {

        var temp: number = 0;
        for (let i = 0; i < defenseDice; i++) {
            defenseRoll[i] = Math.floor(Math.random() * ((6 - 1) + 1) + 1);
        }
        for (let i = 0; i < attackDice; i++) {
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
                gk.changeCurrentUnits(defenseRegion, -1);
            } else gk.changeCurrentUnits(attackRegion, -1);
            if (attackRoll[1] > defenseRoll[1]) {
                gk.changeCurrentUnits(defenseRegion, -1);
            } else gk.changeCurrentUnits(attackRegion, -1);
        }
        else {
            if (attackRoll[0] > defenseRoll[0]) {
                gk.changeCurrentUnits(defenseRegion, -1);
            } else gk.changeCurrentUnits(attackRegion, -1);
        }
        if (gk.getCurrentUnits(attackRegion) >= 3) {
            attackDice = 3;
        } else attackDice = gk.getCurrentUnits(attackRegion) - 1;
        if (gk.getCurrentUnits(defenseRegion) >= 2) {
            defenseDice = 2;
        } else defenseDice = gk.getCurrentUnits(defenseRegion);
        $('#battleBox').text(attackRegion.name + ' rolls ' + attackRoll + ' and '
            + defenseRegion.name + ' rolls ' + defenseRoll);

        if (gk.getCurrentUnits(attackRegion) < 2) {
            $('#attackButton').addClass('hidden');
            $('#battleBox').text('not enought units to continue attacking!');
            selectedRegion = null;
        }
        if (gk.getCurrentUnits(defenseRegion) == 0) {
            gk.setCurrentTeam(defenseRegion, currentPlayer().userName);
            gk.setCurrentUnits(defenseRegion, gk.getCurrentUnits(attackRegion) - 1);
            gk.setCurrentUnits(attackRegion, 1);
            $('#attackButton').addClass('hidden');
            $('#battleBox').text('huzzah! ' + currentPlayer().userName + ' takes ' + defenseRegion.name);
            currentPlayer().captured = true;
            selectedRegion = null;
        }
        queueRedraw();
    });
    function init(card: Card): string {

        $('#tradein').removeClass('hidden');
        var clickString: string = "";
        clickString = "\
    spliced = false;\
    for (let i = 0; i < model.allRegions.length; i++){\
    if(model.allRegions[i].name == $(this).attr('id')){\
    index = i;\
    }\
    }\
    for (let i = 0; i < tradeIns.length; i++) { \
    if (tradeIns[i].region.name == $(this).attr('id')) {\
    \
    tradeIns.splice(i, 1);\
    spliced = true;\
    $('#tradein').text('trade in: ');\
    for (let i = 0; i < tradeIns.length; i++) {\
    $('#tradein').append(tradeIns[i].region.name + ', ');\
    }\
    }\
    }\
    if (currentPhase != 1 && $('#battleBox').text() != 'already trading this in\!'){\
    $('#battleBox').text('no trade-ins during this phase');\
    }\
    else if (model.allRegions[index].team != currentPlayer.team){\
    $('#battleBox').text('this region doesnt belong to you\!');\
    }\
    else{ \
    if (spliced == false){\
    $('#tradein').append($(this).attr('id')+', ');\
    for (let i = 0; i < currentPlayer.hand.length; i++){\
    if (currentPlayer.hand[i].region.name == $(this).attr('id')){\
    index = i;\
    }\
    }\
    tradeIns[tradeIns.length] = currentPlayer.hand[index]; \
    $('#tradein').text('trade in: ');\
    for (let i = 0; i < tradeIns.length; i++) {\
    $('#tradein').append(tradeIns[i].region.name + ', ');\
    }\
    }\
    }"
        return (clickString);
    }

    // this class is a convenient place to put functionality
    class GameKeeper {
        game: Game;

        changeCurrentUnits(r: GameRegion, delta: number): void {
            this.game.regions[r.name].currentUnits += delta;
        }
        getCurrentUnits(r: GameRegion): number {
            return this.game.regions[r.name].currentUnits;
        }
        setCurrentUnits(r: GameRegion, units: number) {
            this.game.regions[r.name].currentUnits = units;
        }
        setCurrentTeam(r: GameRegion, userName: string): void {
            this.game.regions[r.name].userName = userName;
        }
        getCurrentTeam(r: GameRegion): string {
            return this.game.regions[r.name].userName;
        }
        getOwnership(r: GameRegion): RegionTeamOwnership {
            return this.game.regions[r.name];
        }

        getPlayer(userName: string): Player {
            for (var i = 0; i < this.game.players.length; i++) {
                if (this.game.players[i].userName == userName)
                    return this.game.players[i];
            }
            return null;
        }

        getPlayerOfRegion(r: GameRegion): Player {
            return this.getPlayer(this.game.regions[r.name].userName);
        }
    }


    var gk: GameKeeper = new GameKeeper();


    //$('#battleBox').text;
    var spliced: boolean;
    var index: number;
    var hasCard: boolean = false;
    var tradeIns: Card[] = [];
    var players: Player[] = [];
    var currentPlayerIndex: number = -1;
    var model: GameModel = new GameModel();
    var heldUnits: number = 0;
    var attackDice: number = 0;
    var defenseDice: number = 0;
    var attackRoll: number[] = [0, 0, 0];
    var defenseRoll: number[] = [0, 0];
    var currentPhase: number = -1;
    var attackUnits: number = 0;
    var classic: boolean = false;
    var round: number = 1;
    var unitPool: number = 0;
    var hasInit: boolean = false;
    var hasAll: boolean = true;
    var index1: number;
    var cardPoints: number = 0;
    var actions: GameRegion[] = [];

    $(() => {

        var config = {
            apiKey: "AIzaSyAjDEqyzo_pnwJ3ltcvRIgr-heZBQvOp5c",
            authDomain: "risk1-e6871.firebaseapp.com",
            databaseURL: "https://risk1-e6871.firebaseio.com",
            storageBucket: "risk1-e6871.appspot.com",
            messagingSenderId: "376485457722"
        };
        fpapp = firebase.initializeApp(config);
        firebase.auth().onAuthStateChanged((authData) => {
            console.log("onAuth:" + JSON.stringify(authData));
            if (authData) {
                determineWhichGame();
            } else {
                window.location.href = 'lobby.html';
            }
        });

        img = <HTMLImageElement>document.getElementById('riskmap');
        context.font = "bold 16px Arial";
        context.fillText('loading...', canvas.width / 2, canvas.height / 2);
        setTimeout(() => {
            queueRedraw();
        }, 1000);


        // load up the current game


        canvas.onmousemove = function (ev: MouseEvent) {

            var pt = Point.parse(ev);
            if (model.activeDrawRegion != null) {
                model.currentMousePoint = pt;
                queueRedraw();
            } else {
                doHittest(pt);
            }
        };

        // TODO : move this ordering code to lobby.html so by the time we get in here, the game is set up and ready to go
        $('#threePlayers').click(function (ev) {
            players.length = 3;
            for (var i = 0; i < 3; i++) {
                players[i] = gamestate.newPlayer();
            }
            players[0].userName = "red";
            players[1].userName = "cornflowerblue";
            players[2].userName = "green";
            players[0].order = 0;
            players[1].order = 1;
            players[2].order = 2;
            queueRedraw();
            setup();

        });

        $('#fourPlayers').click(function (ev) {
            players.length = 4;
            for (var i = 0; i < 4; i++) {
                players[i] = gamestate.newPlayer();
            }
            players[0].userName = "red";
            players[1].userName = "cornflowerblue";
            players[2].userName = "green";
            players[3].userName = "yellow";
            players[0].order = 0;
            players[1].order = 1;
            players[2].order = 2;
            players[3].order = 3;
            queueRedraw();
            setup();

        });
        $('#fivePlayers').click(function (ev) {
            players.length = 5;
            for (var i = 0; i < 5; i++) {
                players[i] = gamestate.newPlayer();
            }
            players[0].userName = "red";
            players[1].userName = "cornflowerblue";
            players[2].userName = "green";
            players[3].userName = "yellow";
            players[4].userName = "black";
            players[0].order = 0;
            players[1].order = 1;
            players[2].order = 2;
            players[3].order = 3;
            players[4].order = 4;
            queueRedraw();
            setup();
        });
        //how do i make a comment??
    });
    $.getJSON('map.json', function (data) {
        loadRegions(data);

    });

    var gameKey: string;
    function determineWhichGame() {
        gameKey = localStorage['currentGame'];
        if (!gameKey)
            window.location.href = 'lobby.html';
        console.log('determineWhichGame=', gameKey);
        fbGameRef = firebase.database().ref().child("games/" + gameKey);
        fbGameRef.once('value', snap => {
            var game: Game = snap.val();
            $('#gameNameGoesHere').text(game.name);
            setupAllGameData(game);
        });
    }

    function setupAllGameData(game: Game) {
        // TODO : this gets called when we actually have the entire game for the first time on page load
    }

    var continents: IContinent[];
    $.getJSON('continents.json', function (data) {
        continents = data;

    });

    /// This routine gets called to really configure everything
    // TODO : move this to lobby.ts ?
    function setup() {
        // TODO : need to make sure we update the firebase with changes we make in this routine
        var foo = document.getElementById('classic');
        $('#span').addClass('hidden');
        classic = false;
        console.log($('#classic').is(':checked'));
        if ($('#classic').is(':checked') == true) {
            classic = true;
        }
        console.log(classic);
        $('#hand').addClass('hidden');
        $('#attackButton').addClass('hidden');
        $('#controls').addClass('hidden');
        $('#threePlayers').addClass('hidden');
        $('#fourPlayers').addClass('hidden');
        $('#fivePlayers').addClass('hidden');

        for (var i = 0; i < model.allRegions.length; i++) {
            gk.game.deck[i] = gamestate.newCard(model.allRegions[i].name, model.allRegions[i].startingUnits)
        }
        if (classic == true) {
            for (let i = 0; i < model.allRegions.length; i++) {
                model.allRegions[i].startingUnits = 0;
                gk.setCurrentUnits(model.allRegions[i], 0);
            }
            currentPhase = 0;
            currentPlayerIndex = 0;
            if (players.length == 3) {
                unitPool = 35;
            }
            if (players.length == 4) {
                unitPool = 30;
            }
            if (players.length == 5) {
                unitPool = 25;
            }
            $('#battleBox').text('select your regions');
        }
        if (classic == false) {
            var temp: Card;
            for (var i = gk.game.deck.length - 1; i > 0; i--) {
                var index = Math.floor(Math.random() * i);
                temp = gk.game.deck[i];
                gk.game.deck[i] = gk.game.deck[index];
                gk.game.deck[index] = temp;
            }
            for (var i = 0; i < gk.game.deck.length; i++) {
                gk.game.deck[i].regionName = players[i % players.length].userName;
            }
            for (var i = gk.game.deck.length - 1; i > 0; i--) {
                var index = Math.floor(Math.random() * i);
                temp = gk.game.deck[i];
                gk.game.deck[i] = gk.game.deck[index];
                gk.game.deck[index] = temp;
            }
            nextPlayer();
        }

    }

    function nextPlayer() {
        // TODO : need to make sure we update the firebase at the end of this routine
        console.log('check');
        console.log(currentPhase);
        $('#tradein').text('trade in: ');
        if (currentPlayerIndex == -1) {
            currentPlayerIndex = 0;
        }
        if (currentPhase == -1) { currentPhase = 0; unitPool == 0; currentPlayerIndex = players.length - 1; }
        if (currentPhase == 0) {
            if (currentPlayerIndex == players.length - 1) {
                currentPlayerIndex = 0;
            } else
                currentPlayerIndex = currentPlayer().order + 1;
            if (unitPool == 0) {
                currentPhase = 1;
            }
        }
        else if (currentPhase == 3) {

            if (currentPlayer().captured) {
                giveCard(currentPlayer());
                currentPlayer().captured = false;
            }

            currentPhase = 1;

            if (currentPlayerIndex == players.length - 1) {
                currentPlayerIndex = 0;
            } else currentPlayerIndex = currentPlayer().order + 1;
        } else currentPhase++;
        hasInit = false;
        $('#hand').html("<button id='hand' type='button' class='btn btn-primary'>my hand: </button>");
        $('#hand').addClass('hidden');
        if (currentPhase == 1) {
            for (let i = 0; i < currentPlayer().hand.length; i++) {
                $('#hand').append('<button id="' + currentPlayer().hand[i].regionName + '" class="btn btn-primary" onclick="'
                    + (init(gk.game.deck[gk.game.deck.length - 1])) + '">' + currentPlayer().hand[i].regionName + '</button>');
            }
        }
        if (currentPhase == 1) {
            if (currentPlayer().hand.length < 1) {
                $('#hand').addClass('hidden');
            } else $('#hand').removeClass('hidden');
            actions.splice(0, actions.length);
            $('#undo').removeClass('hidden');
            if (hasInit == false) {
                unitPool = 3;
                var totalRegions: number;
                totalRegions = 0;
                for (let i = 0; i < model.allRegions.length; i++) {
                    if (gk.getCurrentTeam(model.allRegions[i]) == currentPlayer().userName) {
                        totalRegions++;
                    }

                }

                hasAll = true;
                for (let i = 0; i < continents.length; i++) {
                    hasAll = true;
                    for (let j = 0; j < continents[i].territories.length; j++) {
                        for (let k = 0; k < model.allRegions.length; k++) {
                            if (model.allRegions[k].name == continents[i].territories[j]) {
                                index = k;

                            }
                        }
                        if (gk.getCurrentTeam(model.allRegions[index]) != currentPlayer().userName) {
                            hasAll = false;

                        }

                    }
                    if (hasAll == true) {
                        unitPool += continents[i].ownershipPoints;

                    }
                }
                if (totalRegions >= 12 && totalRegions <= 14) {
                    unitPool += 1;
                }
                if (totalRegions >= 15 && totalRegions <= 17) {
                    unitPool += 2;
                }
                if (totalRegions >= 18 && totalRegions <= 20) {
                    unitPool += 3;
                }
                if (totalRegions >= 21 && totalRegions <= 23) {
                    unitPool += 4;
                }
                if (totalRegions >= 24 && totalRegions <= 26) {
                    unitPool += 5;
                }
                if (totalRegions >= 27 && totalRegions <= 29) {
                    unitPool += 6;
                }
                if (totalRegions >= 30 && totalRegions <= 32) {
                    unitPool += 7;
                }
                if (totalRegions >= 33 && totalRegions <= 35) {
                    unitPool += 8;
                }
                if (totalRegions >= 36 && totalRegions <= 39) {
                    unitPool += 9;
                }
                if (totalRegions >= 40 && totalRegions <= 42) {
                    unitPool += 10;
                }
                hasInit = true;
            }
            $('#battleBox').text(currentPlayer().userName + ', you have ' + unitPool + ' units to spend');
        }
        if (currentPhase == 3) {
            $('#undo').addClass('hidden');
            $('#battleBox').text(currentPlayer().userName + ', move your units');
        }

        if (currentPhase == 2 && selectedRegion == null) {
            $('#battleBox').text(currentPlayer().userName + ' is on the attack!');
            $('#undo').addClass('hidden');
        }

    }

    function giveCard(to: Player) {
        // TODO : need to make sure we update the firebase
        to.hand[to.hand.length] = gk.game.deck[gk.game.deck.length - 1];
        var newButtonId: string = gk.game.deck[gk.game.deck.length - 1].regionName;
        $('#hand').append('<button id="' + newButtonId + '" class="btn btn-primary" onclick="'
            + (init(gk.game.deck[gk.game.deck.length - 1])) + '">' + gk.game.deck[gk.game.deck.length - 1].regionName + '</button>');
        gk.game.deck.splice(gk.game.deck.length - 1, 1);

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
                context.fillStyle = gk.getPlayerOfRegion(model.allRegions[i]).color;
                context.fillText(model.allRegions[i].name 
                    + ' ' + gk.getCurrentUnits(model.allRegions[i]),
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
}