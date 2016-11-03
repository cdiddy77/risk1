var gamestate;
(function (gamestate) {
    function newPlayer(userName) {
        return {
            userName: userName,
            captured: false,
            color: null,
            hand: null,
            order: -1,
            totalRegions: 0
        };
    }
    gamestate.newPlayer = newPlayer;
    function initializePlayer(player, userName, color, order) {
        if (userName)
            player.userName = userName;
        if (color)
            player.color = color;
        if (order)
            player.order = order;
        else
            player.order = -1;
        player.captured = false;
        player.hand = [];
    }
    gamestate.initializePlayer = initializePlayer;
    ;
    function newCard(regionName, s) {
        return {
            regionName: regionName,
            stars: s
        };
    }
    gamestate.newCard = newCard;
})(gamestate || (gamestate = {}));
//# sourceMappingURL=gamestate.js.map