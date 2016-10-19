interface IGame {
    name:string;
    status:string;
    maxPlayers:number;
    hasStarted:string;
    players: IPlayer[];
    regions: IRegionTeamOwnership[];
}

interface IPlayer {
    userName: string;
    color:string;
    hand: ICard[];
}

interface ICard {
    regionName: string;
    stars: number;
}

interface IRegionTeamOwnership {
    region: string;
    team: string;
    unitCount:number;
}
