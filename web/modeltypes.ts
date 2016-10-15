interface IGame {
    name:string;
    hasStarted?:string;
    players: IPlayer[];
    regions: IRegionTeamOwnership[];
}

interface IPlayer {
    team?: string;
    hand?: ICard[];
}

interface ICard {
    regionName?: string;
    stars?: number;
}

interface IRegionTeamOwnership {
    name: string;
    team: string;
}
