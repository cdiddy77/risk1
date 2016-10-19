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
function beginQueryAvailableGames() {
    fpdbRef = firebase.database().ref();
    fpdbRef.child('games').orderByChild('hasStarted').equalTo("no").on('value', function (snapshot) {
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
            newRow.append("<td><a href='#' fbkey='" + key + "' class='joinCmd'>Join</a></td>");
            tbody.append(newRow);
            return false;
        });
        $('.joinCmd').click(function (ev) {
            selectGame(ev.target.getAttribute('fbkey'));
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
function selectGame(gameKey) {
    console.log('selectGame', gameKey);
}
//# sourceMappingURL=lobby.js.map