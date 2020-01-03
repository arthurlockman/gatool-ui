import { Match } from './match';

// This class supports calls to the Schedule API. It returns
// an array of Matches, which contain results of each match and
// also team data for each station.

export class ScheduleResponse {
    Schedule: Match[];
}
