import {CanActivate, CanActivateChild} from '@angular/router';
import {AuthService} from './auth.service';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private auth: AuthService) {
  }

  async canActivate(): Promise<boolean> {
    if (!this.auth.isAuthenticated()) {
      await this.auth.login();
      return false;
    }

    return true;
  }

  async canActivateChild() {
    if (!this.auth.isAuthenticated()) {
      await this.auth.login();
      return false;
    }
    return true;
  }
}
