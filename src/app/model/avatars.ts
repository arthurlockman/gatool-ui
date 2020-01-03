// These classes support calls to the Avatars API. Responses
// contain an array of Avatars and pagination information.

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
