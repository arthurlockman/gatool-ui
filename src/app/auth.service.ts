import {WebAuth} from 'auth0-js';
import {Inject, Injectable} from '@angular/core';
import {AUTH0_OPTIONS_TOKEN, AuthOptions} from './auth-options';
import {Location} from '@angular/common';
import {BehaviorSubject} from 'rxjs';
import {AuthData, AuthProfile} from './auth-data';

const AUTHDATA_LS_KEY = 'authData';
const DESIREDPATH_LS_KEY = 'desired_path';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private data: AuthData;
  private auth0: WebAuth;
  private authDataObservable: BehaviorSubject<AuthData>;

  constructor(
    private location: Location,
    @Inject(AUTH0_OPTIONS_TOKEN) options: AuthOptions) {

    this.loadAuthData();
    this.authDataObservable = new BehaviorSubject<AuthData>(this.data);

    this.auth0 = new WebAuth({
      clientID: options.clientID,
      redirectUri: options.redirectUri,
      domain: options.domain,
      audience: options.audience,
      responseType: 'token id_token',
      scope: 'openid email profile'
    });
  }

  public get token(): string {
    return this.data && this.data.idToken;
  }

  public get profile(): AuthProfile {
    return this.data && this.data.profile;
  }

  public get authData(): BehaviorSubject<AuthData> {
    return this.authDataObservable;
  }

  public login(): void {
    this.storeDesiredPath();
    this.auth0.authorize();
  }

  public logout(): void {
    localStorage.removeItem(AUTHDATA_LS_KEY);
    this.auth0.logout({
      returnTo: window.location.origin
    });
  }

  public handleAuthentication(): Promise<string> {
    return new Promise((res, reject) => {
      this.auth0.parseHash((err, authResult) => {
        if (authResult && authResult.accessToken && authResult.idToken) {
          this.auth0.client.userInfo(authResult.accessToken, (infoErr, profile) => {
            this.localLogin(authResult, profile);
            res(this.loadDesiredPath());
          });
        } else {
          reject({err, authResult});
        }
      });
    });
  }

  public isAuthenticated(): boolean {
    return this.data &&
      this.data.authToken &&
      Date.now() < this.data.expiresAt;
  }

  private storeDesiredPath(): void {
    localStorage.setItem(DESIREDPATH_LS_KEY, this.location.path());
  }

  private loadDesiredPath(): string {
    return localStorage.getItem(DESIREDPATH_LS_KEY) || '/';
  }

  private loadAuthData(): void {
    const data = localStorage.getItem(AUTHDATA_LS_KEY);
    if (data && data !== '') {
      this.data = JSON.parse(data);
    }
  }

  private localLogin(authResult, profile = null): void {
    this.data = {
      idToken: authResult.idToken,
      authToken: authResult.accessToken,
      expiresAt: (authResult.expiresIn * 1000) + Date.now(),
      profile: profile || this.profile
    };

    localStorage.setItem(AUTHDATA_LS_KEY, JSON.stringify(this.data));
    this.authDataObservable.next(this.data);
  }
}
