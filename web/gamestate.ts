
interface Game {
    name: string;
    status: 'not-started' | 'waiting-setup' | 'started' | 'complete';
    textStatus: string;
    maxPlayers: number;
    players: Player[];
    regions: RegionTeamOwnershipMap;
    deck: Card[];
    currentPlayerIndex: number;
    currentPhase: number;
    unitPool: number;
    classic: boolean;
}
interface Player {
    userName: string;
    captured: boolean;
    color: string;
    hand: Card[];
    order: number;
    totalRegions:number;
}

interface Card {
    regionName: string;
    stars: number;
}

interface RegionTeamOwnership {
    userName: string;
    currentUnits: number;
}
interface RegionTeamOwnershipMap {
    [key: string]: RegionTeamOwnership;
}


namespace gamestate {
    export function newPlayer(userName: string): Player {
        return {
            userName: userName,
            captured: false,
            color: null,
            hand: null,
            order: -1,
            totalRegions:0
        };
    }
    export function initializePlayer(
        player: Player,
        userName?: string,
        color?: string,
        order?: number): void {

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
    };

    export function newCard(regionName: string, s: number) {
        return {
            regionName: regionName,
            stars: s
        };
    }
}