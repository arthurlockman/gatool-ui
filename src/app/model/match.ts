import {Team} from './team';
import {EventType} from './FRCEvent';

// These classes support calls to multiple APIs that return Match data.

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
