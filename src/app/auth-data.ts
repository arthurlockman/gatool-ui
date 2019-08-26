export interface AuthData {
  idToken: string;
  authToken: string;
  expiresAt: number;
  profile: AuthProfile;
}

export interface AuthProfile {
  sub: string;
  name: string;
  picture: string;
}
