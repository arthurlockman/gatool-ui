import {Team} from './team';
import {EventType} from './event';

export class Match {
  description: string;
  tournamentLevel: string;
  matchNumber: number;
  startTime: string;
  actualStartTime: string;
  postResultTime: string;
  scoreRedFinal: number;
  scoreRedFoul: number;
  scoreRedAuto: number;
  scoreBlueFinal: number;
  scoreBlueFoul: number;
  scoreBlueAuto: number;
  teams: Team[];
}

export class MatchWithEventDetails {
  event: EventType;
  match: Match;
}

export class MatchWithHighScoreDetails {
  event: EventType;
  match: Match;
  // Either 'red' or 'blue'
  highScoreAlliance: string;
}
