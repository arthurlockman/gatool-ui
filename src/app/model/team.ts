export class TeamResponse {
  teams: Team[];
}

export class Team {
  teamNumber: number;
  station: string;
  surrogate: boolean;
  dq: boolean;
  teamName: string;
}

export class TeamData {
  nameShort: string;
  nameFull: string;
  cityState: string;
  cityStateSort: string;
  rookieYear: number;
  robotName: string;
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
