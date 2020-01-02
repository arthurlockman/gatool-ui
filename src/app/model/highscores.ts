import { EventType } from './FRCEvent';
import { Match } from './match';

export class HighScoresResponse {
    HighScores: HighScore[];
}

export class HighScore {
    yearType: string;
    year: string;
    type: string;
    level: string;
    matchData: MatchData;
}

export class MatchData {
    event: EventType;
    highScoreAlliance: string;
    match: Match;
}
