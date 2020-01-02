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
