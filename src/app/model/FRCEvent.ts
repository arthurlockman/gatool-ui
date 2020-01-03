import { Match } from './match';

// These classes support calls to the events API. Responses
// contain arrays of matches as well as event details.

export class EventSchedule {
  Schedule: Match[];
}

export class EventType {
  eventCode: string;
  type: string;
}

export class EventResponse {
  Events: FRCEvent[];
}
export class FRCEvent {
  code: string;
  divisionCode: string;
  name: string;
  type: string;
  districtCode: string;
  venue: string;
  address: string;
  city: string;
  stateprov: string;
  country: string;
  website: string;
  webcasts: Webcast[];
  timezone: string;
  dateStart: string;
  dateEnd: string;
}

export class Webcast {
  channel: string;
  date: string;
  type: string;
}
