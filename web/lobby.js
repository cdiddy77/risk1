/// <reference path="../node_modules/firebase/firebase.d.ts" />
var lobby;
(function (lobby) {
    var fpapp;
    $(function () {
        $('#loginForm').submit(function (ev) {
            ev.preventDefault();
            if ($('#inputUserID').val() == '' || $('#inputPassword').val() == '') {
                $('#placeForAlert').addClass('alert alert-danger').text('need input, FOOL!');
            }
            else {
                console.log('authing....');
                fpapp.auth().signInWithEmailAndPassword($('#inputUserID').val() + '@risk1game.com', $('#inputPassword').val()).then(function (resolveArg) {
                    console.log('resolved', resolveArg);
                    $('#loginModal').modal('hide');
                    showHideAuthButtons();
                }, function (rejectArg) {
                    console.log('rejected', rejectArg);
                    $('#placeForAlert')
                        .addClass('alert alert-danger')
                        .text(rejectArg.message);
                    showHideAuthButtons();
                });
            }
        });
        $('#registerForm').submit(function (ev) {
            ev.preventDefault();
            if ($('#regPassword').val() == '' || $('#regUserID').val() == '') {
                $('#placeForRegisterAlert')
                    .addClass('alert alert-danger')
                    .text('neither username nor password may be blank');
            }
            else if ($('#regPassword').val() != $('#regRepeatPassword').val()) {
                $('#placeForRegisterAlert')
                    .addClass('alert alert-danger')
                    .text('passwords do not match');
            }
            else {
                console.log('registering..');
                fpapp.auth().createUserWithEmailAndPassword($('#regUserID').val() + '@risk1game.com', $('#regPassword').val()).then(function (resolveArg) {
                    console.log('resolved', resolveArg);
                    $('#signupmodal').modal('hide');
                    showHideAuthButtons();
                }, function (rejectArg) {
                    console.log('rejected', rejectArg);
                    $('#placeForRegisterAlert')
                        .addClass('alert alert-danger')
                        .text(rejectArg.message);
                    showHideAuthButtons();
                });
            }
        });
        $('#logoutLink').click(function (ev) {
            fpapp.auth().signOut().then(function (resolveArg) {
                console.log('logout successful', resolveArg);
                showHideAuthButtons();
            }, function (rejectArg) {
                console.log('logout failed', rejectArg);
                showHideAuthButtons();
            });
        });
        $('#createUserBtn').click(function (ev) {
            $('#loginModal').modal('hide');
            $('#signupmodal').modal('show');
        });
        $('#createGameBtn').click(function (ev) {
            console.log('time to create a new game');
            handleCreateGame();
        });
        var config = {
            apiKey: "AIzaSyAjDEqyzo_pnwJ3ltcvRIgr-heZBQvOp5c",
            authDomain: "risk1-e6871.firebaseapp.com",
            databaseURL: "https://risk1-e6871.firebaseio.com",
            storageBucket: "risk1-e6871.appspot.com",
            messagingSenderId: "376485457722"
        };
        fpapp = firebase.initializeApp(config);
        firebase.auth().onAuthStateChanged(function (authData) {
            console.log("onAuth:" + JSON.stringify(authData));
            if (authData) {
                beginQueryAvailableGames();
            }
            else {
                $('#loginModal').modal('show');
            }
            showHideAuthButtons();
        });
        showHideAuthButtons();
    });
    function showHideAuthButtons() {
        if (firebase.auth().currentUser != null) {
            $('#loginLink').addClass('hidden');
            $('#signupLink').addClass('hidden');
            $('#logoutLink').removeClass('hidden');
            $('#usernameSpan').removeClass('hidden').text("Hi, user named " + currentUserDisplayName() + "!");
        }
        else {
            $('#loginLink').removeClass('hidden');
            $('#signupLink').removeClass('hidden');
            $('#logoutLink').addClass('hidden');
            $('#usernameSpan').addClass('hidden').text('');
        }
    }
    function currentUserDisplayName() {
        var currentUser = firebase.auth().currentUser;
        if (currentUser) {
            var indexOfAt = currentUser.email.indexOf('@');
            return currentUser.email.substr(0, indexOfAt);
        }
        else {
            return 'no-user';
        }
    }
    var fpdbRef;
    function beginQueryAvailableGames() {
        if (localStorage['currentGame'])
            window.location.href = 'mpgame.html';
        fpdbRef = firebase.database().ref();
        fpdbRef.child('games').orderByChild('status').equalTo("not-started").on('value', function (snapshot) {
            console.log('gamesQuery', snapshot.val());
            var tbody = $('#whereGameRowsGo');
            tbody.text('');
            snapshot.forEach(function (childSnap) {
                var key = childSnap.key;
                var val = childSnap.val();
                var newRow = $("<tr class='success'></tr");
                newRow.append("<td>" + val.name + "</td>");
                newRow.append("<td>" + val.maxPlayers + "</td>");
                newRow.append("<td>" + val.players.map(function (v) { return v.userName; }).join(', ') + "</td>");
                if (val.players.some(function (v) {
                    return v.userName == currentUserDisplayName();
                })) {
                    if (val.players[0].userName == currentUserDisplayName()) {
                        newRow.append("<td><nobr>\
                    <a href='#' fbkey='" + key + "' class='abandonCmd'>Abandon</a>" +
                            "|<a href='#' fbkey='" + key + "' class='leaveCmd'>Leave</a>" +
                            "|<a href='#' fbkey='" + key + "' class='startCmd'>Start</a></nobr></td>");
                    }
                    else {
                        newRow.append("<td><a href='#' fbkey='" + key + "' class='leaveCmd'>Leave</a></td>");
                    }
                }
                else {
                    newRow.append("<td><a href='#' fbkey='" + key + "' class='joinCmd'>Join</a></td>");
                }
                tbody.append(newRow);
                return false;
            });
            $('.joinCmd').click(function (ev) {
                joinGame(ev.target.getAttribute('fbkey'));
            });
            $('.leaveCmd').click(function (ev) {
                leaveGame(ev.target.getAttribute('fbkey'));
            });
            $('.abandonCmd').click(function (ev) {
                abandonGame(ev.target.getAttribute('fbkey'));
            });
            $('.startCmd').click(function (ev) {
                startGame(ev.target.getAttribute('fbkey'), 'normal');
            });
            $('.startClassicCmd').click(function (ev) {
                startGame(ev.target.getAttribute('fbkey'), 'classic');
            });
        });
    }
    function handleCreateGame() {
        if (!firebase.auth().currentUser) {
            $("#gameNameFormGroup").addClass('has-error');
            $("#errorMsg").addClass('alert alert-danger').text('must be logged in to create a game');
            return;
        }
        var gameName = $('#gameName').val();
        if (gameName == "") {
            $("#gameNameFormGroup").addClass('has-error');
            $("#errorMsg").addClass('alert alert-danger').text('must provide game name');
        }
        else {
            $("#errorMsg").removeClass('alert alert-danger').text('');
            createGame(gameName);
        }
    }
    function joinGame(gameKey) {
        fpdbRef.child("games/" + gameKey + "/players").once('value', function (snapshot) {
            var players = snapshot.val();
            if (players.some(function (v, i, arr) {
                return v.userName == currentUserDisplayName();
            })) {
                console.log('selectGame : already has player');
            }
            else {
                console.log('selectGame: adding player');
                players.push(gamestate.newPlayer(currentUserDisplayName()));
                snapshot.ref.set(players);
            }
        });
        fpdbRef.child("games/" + gameKey + "/status").on('value', function (snapshot) {
            if (snapshot.val() == 'started') {
                localStorage['currentGame'] = gameKey;
                window.location.href = 'mpgame.html';
            }
        });
    }
    function leaveGame(gameKey) {
        console.log('leaveGame');
        fpdbRef.child("games/" + gameKey + "/players").once('value', function (snapshot) {
            var players = snapshot.val();
            var thisPlayer = players.filter(function (v, i, arr) {
                return v.userName == currentUserDisplayName();
            });
            if (thisPlayer.length > 0) {
                console.log('selectGame :  has player');
                var index = players.indexOf(thisPlayer[0]);
                if (index >= 0) {
                    players.splice(index, 1);
                    snapshot.ref.set(players, function (err) {
                        console.log('removeplayer completion', err);
                    });
                }
            }
            else {
                console.log('selectGame: doesnt have player');
            }
        });
    }
    function abandonGame(gameKey) {
        console.log('abandonGame');
        fpdbRef.child("games/" + gameKey).remove(function (err) {
            console.log('remove completion', err);
        });
    }
    function startGame(gameKey, gameType) {
        // TODO : if there are fewer than 3 players or more than 5 players, 
        // just put a message
        fpdbRef.child("games/" + gameKey).once('value', function (snapshot) {
            var game = snapshot.val();
            if (game.players.length < 3 || game.players.length > 5) {
                game.textStatus = game.players.length < 3
                    ? "too few players"
                    : "too many players";
                fpdbRef.child("games/" + gameKey).set(game);
                return;
            }
            gamestate.initializePlayer(game.players[0], game.players[0].userName, 'red', 0);
            gamestate.initializePlayer(game.players[1], game.players[1].userName, 'cornflowerblue', 1);
            gamestate.initializePlayer(game.players[2], game.players[2].userName, 'green', 2);
            if (game.players.length >= 4) {
                gamestate.initializePlayer(game.players[3], game.players[3].userName, 'yellow', 3);
            }
            if (game.players.length >= 5) {
                gamestate.initializePlayer(game.players[4], game.players[4].userName, 'black', 4);
            }
            $.getJSON('map.json', function (data) {
                var allRegions = data;
                setup(game, allRegions, gameType);
            });
            console.log('startGame');
            fpdbRef.child("games/" + gameKey).update(game, function (err) {
                console.log('really start game', err);
            });
        });
    }
    /// This routine gets called to really configure everything
    // TODO : move this to lobby.ts ?
    function setup(game, allRegions, gameType) {
        for (var i = 0; i < allRegions.length; i++) {
            game.deck[i] = gamestate.newCard(allRegions[i].name, allRegions[i].startingUnits);
        }
        game.classic = gameType == 'classic';
        if (game.classic == true) {
            for (var i_1 = 0; i_1 < allRegions.length; i_1++) {
                var region = allRegions[i_1];
                game.regions[region.name].currentUnits = 0;
            }
            game.currentPhase = 0;
            game.currentPlayerIndex = 0;
            if (game.players.length == 3) {
                game.unitPool = 35;
            }
            if (game.players.length == 4) {
                game.unitPool = 30;
            }
            if (game.players.length == 5) {
                game.unitPool = 25;
            }
        }
        else {
            game.currentPhase = -1;
            game.currentPlayerIndex = -1;
            game.unitPool = 0;
            var temp;
            for (var i = game.deck.length - 1; i > 0; i--) {
                var index = Math.floor(Math.random() * i);
                temp = game.deck[i];
                game.deck[i] = game.deck[index];
                game.deck[index] = temp;
            }
            for (var i = 0; i < game.deck.length; i++) {
                var card = game.deck[i];
                var player = game.players[i % game.players.length];
                game.regions[card.regionName].userName = player.userName;
                player.totalRegions++;
            }
            for (var i = game.deck.length - 1; i > 0; i--) {
                var index = Math.floor(Math.random() * i);
                temp = game.deck[i];
                game.deck[i] = game.deck[index];
                game.deck[index] = temp;
            }
            game.currentPlayerIndex = 0;
            currentPhase = 0;
            unitPool == 0;
            currentPlayerIndex = 0;
            currentPhase = 1;
            hasInit = false;
            unitPool = 3;
            var totalRegions;
            totalRegions = 0;
            for (var i_2 = 0; i_2 < model.allRegions.length; i_2++) {
                if (gk.getCurrentTeam(model.allRegions[i_2]) == currentPlayer().userName) {
                    totalRegions++;
                }
            }
            hasAll = true;
            for (var i_3 = 0; i_3 < continents.length; i_3++) {
                hasAll = true;
                for (var j = 0; j < continents[i_3].territories.length; j++) {
                    for (var k = 0; k < model.allRegions.length; k++) {
                        if (model.allRegions[k].name == continents[i_3].territories[j]) {
                            index = k;
                        }
                    }
                    if (gk.getCurrentTeam(model.allRegions[index]) != currentPlayer().userName) {
                        hasAll = false;
                    }
                }
                if (hasAll == true) {
                    unitPool += continents[i_3].ownershipPoints;
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
            if (currentPhase == 3) {
                $('#undo').addClass('hidden');
                $('#battleBox').text(currentPlayer().userName + ', move your units');
            }
            if (currentPhase == 2 && selectedRegion == null) {
                $('#battleBox').text(currentPlayer().userName + ' is on the attack!');
                $('#undo').addClass('hidden');
            }
        }
    }
    function createGame(gameName) {
        var game = {
            name: gameName,
            maxPlayers: 5,
            status: 'not-started',
            textStatus: 'looking for players.',
            players: [gamestate.newPlayer(currentUserDisplayName())],
            regions: {},
            deck: [],
            currentPhase: -1,
            currentPlayerIndex: -1,
            unitPool: 0,
            classic: false
        };
        var gameKey = fpdbRef.child('games').push(game, function (err) {
            console.log(err);
        }).key;
        joinGame(gameKey);
    }
})(lobby || (lobby = {}));
//# sourceMappingURL=lobby.js.map