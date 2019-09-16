import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {CallbackComponent} from './callback/callback.component';
import {HomeComponent} from './home/home.component';
import {AuthService} from './auth.service';
import {AUTH0_OPTIONS_TOKEN} from './auth-options';
import {environment} from '../environments/environment';
import {HttpClientModule} from '@angular/common/http';
import { SetupComponent } from './setup/setup.component';

@NgModule({
  declarations: [
    AppComponent,
    CallbackComponent,
    HomeComponent,
    SetupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    AuthService,
    {
      provide: AUTH0_OPTIONS_TOKEN,
      useValue: {
        clientID: 'afsE1dlAGS609U32NjmvNMaYSQmtO3NT',
        domain: 'gatool.auth0.com',
        redirectUri: `${environment.redirectUri}`,
        audience: 'https://gatool.auth0.com/userinfo',
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
