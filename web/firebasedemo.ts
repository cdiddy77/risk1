/// <reference path="../node_modules/firebase/firebase.d.ts" />

namespace firebasedemo {
    var fpapp: firebase.app.App;
    var fpdbRef: firebase.database.Reference;
    var gameRef: firebase.database.Reference;

    $(() => {
        var config = {
            apiKey: "AIzaSyAjDEqyzo_pnwJ3ltcvRIgr-heZBQvOp5c",
            authDomain: "risk1-e6871.firebaseapp.com",
            databaseURL: "https://risk1-e6871.firebaseio.com",
            storageBucket: "risk1-e6871.appspot.com",
            messagingSenderId: "376485457722"
        };
        fpapp = firebase.initializeApp(config);
        fpdbRef = fpapp.database().ref();
        fpdbRef.child('games').orderByChild('hasStarted').equalTo("no").on('value', snapshot => {
            console.log('gamesQuery', snapshot.val());

            $('#existingGameDropdown').removeClass('hidden');
            $('#existingGameMenu').text('');
            snapshot.forEach((childSnap): boolean => {
                $('#existingGameMenu').append(
                    "<li><a class='gameMenuItem' fbkey='"
                    + childSnap.key
                    + "'>"
                    + childSnap.val().name
                    + '</a></li>');
                return true;
            });
            $('.gameMenuItem').click(ev => {
                selectGame(ev.target.getAttribute('fbkey'));
            });
        });
        $('#createGameBtn').click(ev => {
            var gameName = $('#gameName').val();
            if (gameName == "") {
                $("#gameNameFormGroup").addClass('has-error');
                $("#errorMsg").addClass('alert alert-danger').text('must provide game name');
            } else {
                $("#errorMsg").removeClass('alert alert-danger').text('');
                createGame(gameName);
            }
        });
    });

    function createGame(gameName: string) {
        var game: IGame = {
            name: gameName,
            maxPlayers: 4,
            hasStarted: "no",
            status: 'starting up.',
            players: [
                { userName: 'red', color: 'red', hand: [] },
                { userName: 'green', color: 'green', hand: [] },
            ],
            regions: [{
                region: 'Eastern United States',
                team: 'green',
                unitCount: 0
            }, {
                region: 'Western United States',
                team: 'red',
                unitCount: 0
            }]
        };
        var gameKey = fpdbRef.child('games').push(game, (err) => {
            console.log(err);
        }).key;

        selectGame(gameKey);
    }

    function selectGame(gameKey: string) {
        gameRef = fpdbRef.child('games').child(gameKey);

        $('#game-key').text(gameKey);
        $('#existingGameDropdown').hide();
        $('#gameNameFormGroup').hide();
        $('#createGameBtn').hide();

        gameRef.on('value', snapshot => {
            console.log(snapshot.val());
            $('#game-name').text(snapshot.val().name);
        });
    }
}