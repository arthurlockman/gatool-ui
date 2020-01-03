export class AlliancesResponse {
    Alliances: Alliance[];
}

export class Alliance {
    number: number;
    name: string;
    captain: number;
    round1: number;
    round2: number;
    round3: number;
    backup: number;
    backupReplaced: number;
}