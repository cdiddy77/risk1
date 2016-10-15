/// <reference path="../node_modules/@types/es6-promise/index.d.ts" />
/// <reference path="../node_modules/@types/firebase/index.d.ts" />
var fpdb;
var gameRef;
$(function () {
    fpdb = new Firebase('https://risk1-e6871.firebaseio.com/');
    fpdb.child('games').orderByChild('hasStarted').equalTo("no").on('value', function (snapshot) {
        console.log('gamesQuery', snapshot.val());
        $('#existingGameDropdown').removeClass('hidden');
        $('#existingGameMenu').text('');
        snapshot.forEach(function (childSnap) {
            $('#existingGameMenu').append("<li><a class='gameMenuItem' fbkey='"
                + childSnap.key()
                + "'>"
                + childSnap.val().name
                + '</a></li>');
        });
        $('.gameMenuItem').click(function (ev) {
            selectGame(ev.target.getAttribute('fbkey'));
        });
    });
    $('#createGameBtn').click(function (ev) {
        var gameName = $('#gameName').val();
        if (gameName == "") {
            $("#gameNameFormGroup").addClass('has-error');
            $("#errorMsg").addClass('alert alert-danger').text('must provide game name');
        }
        else {
            $("#errorMsg").removeClass('alert alert-danger').text('');
            createGame(gameName);
        }
    });
});
function createGame(gameName) {
    var game = {
        name: gameName,
        hasStarted: "no",
        players: [
            { team: 'red' },
            { team: 'green' },
        ],
        regions: [{
                name: 'Eastern United States',
                team: 'green'
            }, {
                name: 'Western United States',
                team: 'red'
            }]
    };
    var gameKey = fpdb.child('games').push(game, function (err) {
        console.log(err);
    }).key();
    selectGame(gameKey);
}
function selectGame(gameKey) {
    gameRef = fpdb.child('games').child(gameKey);
    $('#game-key').text(gameKey);
    $('#existingGameDropdown').hide();
    $('#gameNameFormGroup').hide();
    $('#createGameBtn').hide();
    gameRef.on('value', function (snapshot) {
        console.log(snapshot.val());
        $('#game-name').text(snapshot.val().name);
    });
}
//# sourceMappingURL=firebasedemo.js.map