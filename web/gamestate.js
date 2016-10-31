// TODO : move all the relevant gamestate out of mpgame and into here
var gamestate;
(function (gamestate) {
    function newPlayer(userName, color) {
        return {
            userName: userName,
            captured: false,
            color: color,
            hand: [],
            order: -1
        };
    }
    gamestate.newPlayer = newPlayer;
    function newCard(regionName, s) {
        return {
            regionName: regionName,
            stars: s
        };
    }
    gamestate.newCard = newCard;
})(gamestate || (gamestate = {}));
//# sourceMappingURL=gamestate.js.map