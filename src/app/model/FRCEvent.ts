import {Match} from './match';

export class EventSchedule {
  Schedule: Match[];
}

export class EventType {
  eventCode: string;
  type: string;
}

export class EventAvatars {
  teams: TeamAvatar[];
  teamCountTotal: number;
  teamCountPage: number;
  pageCurrent: number;
  pageTotal: number;
}

export class TeamAvatar {
  teamNumber: number;
  encodedAvatar: string;
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
  webcasts: string[];
  timezone: string;
  dateStart: string;
  dateEnd: string;
}

export class EventResponse {
  Events: FRCEvent[];
}
