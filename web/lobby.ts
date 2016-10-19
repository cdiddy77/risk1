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
    fpdbRef = firebase.database().ref();
    fpdbRef.child('games').orderByChild('hasStarted').equalTo("no").on('value', snapshot => {
        console.log('gamesQuery', snapshot.val());

        let tbody = $('#whereGameRowsGo');
        tbody.text('');
        snapshot.forEach((childSnap): boolean => {
            let key = childSnap.key;
            let val: IGame = childSnap.val();
            let newRow = $("<tr class='success'></tr");
            newRow.append("<td>" + val.name + "</td>");
            newRow.append("<td>" + val.maxPlayers + "</td>");
            newRow.append("<td>" + val.players.map(v => v.userName).join(', ') + "</td>");

            if (val.players.some((v) => {
                return v.userName == currentUserDisplayName();
            })) {
                if (val.players[0].userName == currentUserDisplayName()) {
                    newRow.append("<td><nobr>\
                    <a href='#' fbkey='" + key + "' class='abandonCmd'>Abandon</a>"+
                    "|<a href='#' fbkey='" + key + "' class='leaveCmd'>Leave</a>"+
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
    } else {
        $("#errorMsg").removeClass('alert alert-danger').text('');
        createGame(gameName);
    }
}
function joinGame(gameKey: string) {
    fpdbRef.child("games/" + gameKey + "/players").once('value', snapshot => {
        let players: IPlayer[] = snapshot.val();
        if (players.some((v, i, arr) => {
            return v.userName == currentUserDisplayName();
        })) {
            console.log('selectGame : already has player');
        } else {
            console.log('selectGame: adding player');
            players.push({
                userName: currentUserDisplayName()
            });
            snapshot.ref.set(players);
        }
    });

    fpdbRef.child("games/" + gameKey + "/hasStarted").on('value', snapshot => {
        if (snapshot.val() == 'yes') {
            localStorage['currentGame'] = gameKey;
            window.location.href = 'mpgame.html';
        }
    });
}

function leaveGame(gameKey: string) {
    console.log('leaveGame');
    fpdbRef.child("games/" + gameKey + "/players").once('value', snapshot => {
        let players: IPlayer[] = snapshot.val();
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

function startGame(gameKey: string) {
    console.log('startGame');
    fpdbRef.child("games/" + gameKey).update({ status: 'started game', hasStarted: 'yes' }, (err) => {
        console.log('start game', err);
    });
}

function createGame(gameName: string) {
    var game: IGame = {
        name: gameName,
        maxPlayers: 4,
        hasStarted: "no",
        status: 'looking for players.',
        players: [
            { userName: currentUserDisplayName(), color: 'red', hand: [] },
        ],
        regions: []
    };
    var gameKey = fpdbRef.child('games').push(game, (err) => {
        console.log(err);
    }).key;

    joinGame(gameKey);
}