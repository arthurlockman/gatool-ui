export class AwardResponse {
  Awards: Award[];
}

export class Award {
  awardId: number;
  teamId: number;
  eventId: number;
  eventDivisionId: string;
  eventCode: string;
  name: string;
  series: number;
  teamNumber: number;
  schoolName: string;
  fullTeamName: string;
  person: string;
}

export class AllTeamAwards {
  chairmans = 0;
  chairmansyears: string[];
  champsFinalist: number;
  champsFinalistyears: string[];
  champsSubdivisionWinner: number;
  champsSubdivisionWinneryears: string[];
  woodieflowers: number;
  woodieflowersyears: string[];
  deansList: number;
  deansListyears: string[];
  voy: number;
  voyyears: string[];
}
