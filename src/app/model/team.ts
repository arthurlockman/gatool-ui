// These classes support calls to the Schedule APIs.

export class TeamResponse {
  teams: TeamData[];
}

export class Team {
  teamNumber: number;
  station: string;
  surrogate: boolean;
  dq: boolean;
  nameShort: string;
  nameFull: string;
}

// This class supports the locally stored team record. It contains both
// FIRST-supplied and calculated data about the team, and it is used
// throughtout the application.

export class TeamData {
  teamNumber: number;
  nameFull: string;
  nameShort: string;
  schoolName: string;
  city: string;
  stateProv: string;
  country: string;
  website: string;
  rookieYear: number;
  robotName: string;
  districtCode: string;
  homeCMP: string;
  cityState: string;
  cityStateSort: string;
  organization: string;
  sponsors: string;
  topSponsors: string;
  awards: string;
  alliance: number;
  allianceName: string;
  allianceChoice: string;
  rank: number;
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
  nameShortLocal: string;
  cityStateLocal: string;
  topSponsorsLocal: string;
  sponsorsLocal: string;
  organizationLocal: string;
  robotNameLocal: string;
  awardsLocal: string;
  teamMottoLocal: string;
  teamNotesLocal: string;
  avatar: string;
  lastVisit: string;
  teamYearsNoCompeteLocal: number;
  awardsNoFormatting: string;
}
