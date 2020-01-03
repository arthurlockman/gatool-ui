import { EventType } from './FRCEvent';
import { Match } from './match';

// These classes support calls to the high scores API. We report
// on event and global high scores, which we use to populate
// the stats component.

export class HighScoresResponse {
    HighScores: HighScore[];
}

export class HighScore {
    yearType: string;
    year: string;
    type: string;
    level: string;
    matchData: MatchWithHighScoreDetails;
}

export class MatchWithHighScoreDetails {
    event: EventType;
    match: Match;
    // Either 'red' or 'blue'
    highScoreAlliance: string;
  }
