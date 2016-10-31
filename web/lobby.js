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
                startGame(ev.target.getAttribute('fbkey'));
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
        fpdbRef.child("games/" + gameKey + "/hasStarted").on('value', function (snapshot) {
            if (snapshot.val() == 'yes') {
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
    function startGame(gameKey) {
        console.log('startGame');
        fpdbRef.child("games/" + gameKey).update({ status: 'started game', hasStarted: 'yes' }, function (err) {
            console.log('start game', err);
        });
    }
    function createGame(gameName) {
        var game = {
            name: gameName,
            maxPlayers: 4,
            status: 'not-started',
            textStatus: 'looking for players.',
            players: [gamestate.newPlayer(currentUserDisplayName(), 'red')],
            regions: {},
            deck: []
        };
        var gameKey = fpdbRef.child('games').push(game, function (err) {
            console.log(err);
        }).key;
        joinGame(gameKey);
    }
})(lobby || (lobby = {}));
//# sourceMappingURL=lobby.js.map