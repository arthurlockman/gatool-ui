import {Component, OnInit} from '@angular/core';
import {AuthService} from './auth.service';
import {StateService} from './state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public loading = false;
  public offlineMessage = '';

  constructor(private auth: AuthService, public stateService: StateService) {
  }

  ngOnInit() {
    this.stateService.httpOperationsInProgress().subscribe(loading => this.loading = loading);
    this.stateService.getOfflineStatus().subscribe(offline => {
      if (offline) {
        this.offlineMessage = 'You are in offline mode';
      } else {
        this.offlineMessage = '';
      }
    });
  }
}
