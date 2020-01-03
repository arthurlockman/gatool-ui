// These classes support calls to the teams API, which
// reports on which teams are registered for a specific
// event or season.

export class TeamList {
    teamList: TeamDetail[];
}

export class TeamDetail {
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
}
