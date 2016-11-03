/// <reference path="../node_modules/firebase/firebase.d.ts" />

namespace lobby {

    var fpapp: firebase.app.App;

    $(() => {

        $('#loginForm').submit(ev => {
            ev.preventDefault();
            if ($('#inputUserID').val() == '' || $('#inputPassword').val() == '') {
                $('#placeForAlert').addClass('alert alert-danger').text('need input, FOOL!');
            } else {
                console.log('authing....');
                fpapp.auth().signInWithEmailAndPassword(
                    $('#inputUserID').val() + '@risk1game.com',
                    $('#inputPassword').val()
                ).then(resolveArg => {
                    console.log('resolved', resolveArg);
                    $('#loginModal').modal('hide');
                    showHideAuthButtons();
                }, rejectArg => {
                    console.log('rejected', rejectArg);
                    $('#placeForAlert')
                        .addClass('alert alert-danger')
                        .text(rejectArg.message);
                    showHideAuthButtons();
                });
            }
        });
        $('#registerForm').submit(ev => {
            ev.preventDefault();
            if ($('#regPassword').val() == '' || $('#regUserID').val() == '') {
                $('#placeForRegisterAlert')
                    .addClass('alert alert-danger')
                    .text('neither username nor password may be blank');
            } else if ($('#regPassword').val() != $('#regRepeatPassword').val()) {
                $('#placeForRegisterAlert')
                    .addClass('alert alert-danger')
                    .text('passwords do not match');
            } else {
                console.log('registering..');
                fpapp.auth().createUserWithEmailAndPassword(
                    $('#regUserID').val() + '@risk1game.com',
                    $('#regPassword').val()).then(resolveArg => {
                        console.log('resolved', resolveArg);
                        $('#signupmodal').modal('hide');
                        showHideAuthButtons();
                    }, rejectArg => {
                        console.log('rejected', rejectArg);
                        $('#placeForRegisterAlert')
                            .addClass('alert alert-danger')
                            .text(rejectArg.message);
                        showHideAuthButtons();
                    });

            }
        });

        $('#logoutLink').click(ev => {
            fpapp.auth().signOut().then(resolveArg => {
                console.log('logout successful', resolveArg);
                showHideAuthButtons();
            }, rejectArg => {
                console.log('logout failed', rejectArg);
                showHideAuthButtons();
            });
        });

        $('#createUserBtn').click(ev => {
            $('#loginModal').modal('hide');
            $('#signupmodal').modal('show');

        });

        $('#createGameBtn').click(ev => {
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
        firebase.auth().onAuthStateChanged((authData) => {
            console.log("onAuth:" + JSON.stringify(authData));
            if (authData) {
                beginQueryAvailableGames();
            } else {
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
        } else {
            $('#loginLink').removeClass('hidden');
            $('#signupLink').removeClass('hidden');
            $('#logoutLink').addClass('hidden');
            $('#usernameSpan').addClass('hidden').text('');
        }
    }

    function currentUserDisplayName(): string {
        let currentUser = firebase.auth().currentUser;
        if (currentUser) {
            let indexOfAt: number = currentUser.email.indexOf('@');
            return currentUser.email.substr(0, indexOfAt);
        } else {
            return 'no-user';
        }
    }

    var fpdbRef: firebase.database.Reference;

    function beginQueryAvailableGames() {

        if (localStorage['currentGame'])
            window.location.href = 'mpgame.html';

        fpdbRef = firebase.database().ref();
        fpdbRef.child('games').orderByChild('status').equalTo("not-started").on('value', snapshot => {
            console.log('gamesQuery', snapshot.val());

            let tbody = $('#whereGameRowsGo');
            tbody.text('');
            snapshot.forEach((childSnap): boolean => {
                let key = childSnap.key;
                let val: Game = childSnap.val();
                let newRow = $("<tr class='success'></tr");
                newRow.append("<td>" + val.name + "</td>");
                newRow.append("<td>" + val.maxPlayers + "</td>");
                newRow.append("<td>" + val.players.map(v => v.userName).join(', ') + "</td>");

                if (val.players.some((v) => {
                    return v.userName == currentUserDisplayName();
                })) {
                    if (val.players[0].userName == currentUserDisplayName()) {
                        newRow.append("<td><nobr>\
                    <a href='#' fbkey='" + key + "' class='abandonCmd'>Abandon</a>" +
                            "|<a href='#' fbkey='" + key + "' class='leaveCmd'>Leave</a>" +
                            "|<a href='#' fbkey='" + key + "' class='startCmd'>Start</a></nobr></td>");
                    } else {
                        newRow.append("<td><a href='#' fbkey='" + key + "' class='leaveCmd'>Leave</a></td>");
                    }
                } else {
                    newRow.append("<td><a href='#' fbkey='" + key + "' class='joinCmd'>Join</a></td>");
                }
                tbody.append(newRow);
                return false;
            });
            $('.joinCmd').click(ev => {
                joinGame(ev.target.getAttribute('fbkey'));
            });
            $('.leaveCmd').click(ev => {
                leaveGame(ev.target.getAttribute('fbkey'));
            });
            $('.abandonCmd').click(ev => {
                abandonGame(ev.target.getAttribute('fbkey'));
            });
            $('.startCmd').click(ev => {
                startGame(ev.target.getAttribute('fbkey'), 'normal');
            });
            $('.startClassicCmd').click(ev => {
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
        } else {
            $("#errorMsg").removeClass('alert alert-danger').text('');
            createGame(gameName);
        }
    }
    function joinGame(gameKey: string) {
        fpdbRef.child("games/" + gameKey + "/players").once('value', snapshot => {
            let players: Player[] = snapshot.val();
            if (players.some((v, i, arr) => {
                return v.userName == currentUserDisplayName();
            })) {
                console.log('selectGame : already has player');
            } else {
                console.log('selectGame: adding player');
                players.push(gamestate.newPlayer(currentUserDisplayName()));
                snapshot.ref.set(players);
            }
        });

        fpdbRef.child("games/" + gameKey + "/status").on('value', snapshot => {
            if (snapshot.val() == 'started') {
                localStorage['currentGame'] = gameKey;
                window.location.href = 'mpgame.html';
            }
        });
    }

    function leaveGame(gameKey: string) {
        console.log('leaveGame');
        fpdbRef.child("games/" + gameKey + "/players").once('value', snapshot => {
            let players: Player[] = snapshot.val();
            let thisPlayer = players.filter((v, i, arr) => {
                return v.userName == currentUserDisplayName();
            });
            if (thisPlayer.length > 0) {
                console.log('selectGame :  has player');
                let index: number = players.indexOf(thisPlayer[0]);
                if (index >= 0) {
                    players.splice(index, 1);
                    snapshot.ref.set(players, (err) => {
                        console.log('removeplayer completion', err);
                    });
                }
            } else {
                console.log('selectGame: doesnt have player');
            }
        });
    }

    function abandonGame(gameKey: string) {
        console.log('abandonGame');
        fpdbRef.child("games/" + gameKey).remove((err) => {
            console.log('remove completion', err);
        });
    }

    interface PartialGameRegion {
        name: string;
        startingUnits: number;
    }

    function startGame(gameKey: string, gameType: 'normal' | 'classic') {
        // TODO : if there are fewer than 3 players or more than 5 players, 
        // just put a message
        fpdbRef.child("games/" + gameKey).once('value', snapshot => {
            let game: Game = snapshot.val();
            if (game.players.length < 3 || game.players.length > 5) {
                game.textStatus = game.players.length < 3
                    ? "too few players"
                    : "too many players";

                fpdbRef.child("games/" + gameKey).set(game);
                return;
            }
            gamestate.initializePlayer(game.players[0],
                game.players[0].userName,
                'red', 0);
            gamestate.initializePlayer(game.players[1],
                game.players[1].userName,
                'cornflowerblue', 1);
            gamestate.initializePlayer(game.players[2],
                game.players[2].userName,
                'green', 2);
            if (game.players.length >= 4) {
                gamestate.initializePlayer(game.players[3],
                    game.players[3].userName,
                    'yellow', 3);
            }
            if (game.players.length >= 5) {
                gamestate.initializePlayer(game.players[4],
                    game.players[4].userName,
                    'black', 4);
            }
            $.getJSON('map.json', function (data) {
                let allRegions: PartialGameRegion[] = data;
                setup(game, allRegions, gameType);

            });

            console.log('startGame');
            fpdbRef.child("games/" + gameKey).update(game, (err) => {
                console.log('really start game', err);

            });
        });
    }

    /// This routine gets called to really configure everything
    // TODO : move this to lobby.ts ?
    function setup(game: Game, allRegions: PartialGameRegion[], gameType: 'normal' | 'classic') {
        for (var i = 0; i < allRegions.length; i++) {
            game.deck[i] = gamestate.newCard(allRegions[i].name, allRegions[i].startingUnits);
        }
        game.classic = gameType == 'classic';
        if (game.classic == true) {
            for (let i_1 = 0; i_1 < allRegions.length; i_1++) {
                let region = allRegions[i_1];
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
        } else {
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
                let card = game.deck[i];
                let player = game.players[i % game.players.length];
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

    function createGame(gameName: string) {
        var game: Game = {
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
        var gameKey = fpdbRef.child('games').push(game, (err) => {
            console.log(err);
        }).key;

        joinGame(gameKey);
    }

}