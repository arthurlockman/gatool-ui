import {InjectionToken} from '@angular/core';

export interface AuthOptions {
  clientID: string;
  domain: string;
  redirectUri: string;
  audience: string;
}

export let AUTH0_OPTIONS_TOKEN = new InjectionToken<AuthOptions>('forRoot() Auth configuration.');
