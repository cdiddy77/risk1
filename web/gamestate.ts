// TODO : move all the relevant gamestate out of mpgame and into here

interface Game {
    name: string;
    status: 'not-started' | 'waiting-setup' | 'started' | 'complete';
    textStatus: string;
    maxPlayers: number;
    players: Player[];
    regions: RegionTeamOwnershipMap;
    deck: Card[];
}
interface Player {
    userName: string;
    captured: boolean;
    color: string;
    hand: Card[];
    order: number;
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
    export function newPlayer(userName?:string,color?:string): Player {
        return {
            userName: userName,
            captured: false,
            color: color,
            hand:[],
            order: -1
        };
    }

    export function newCard(regionName:string,s:number){
        return {
            regionName:regionName,
            stars:s
        };
    }
}