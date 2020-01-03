// These classes support calls to the rankings API. The response
// is an array of Ranks, which we use to populate TeamData and
// to draw the rankings component.

export class RankingsResponse {
    Rankings: Rank[];
}

export class Rank {
    rank: number;
    teamNumber: number;
    sortOrder1: number;
    sortOrder2: number;
    sortOrder3: number;
    sortOrder4: number;
    sortOrder5: number;
    sortOrder6: number;
    wins: number;
    losses: number;
    ties: number;
    qualAverage: number;
    dq: number;
    matchesPlayed: number;
}
