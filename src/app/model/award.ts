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
