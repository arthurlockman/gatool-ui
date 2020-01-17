import {Component, OnInit} from '@angular/core';
import {AuthService} from './auth.service';
import {StateService} from './state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'gatool-ui';

  constructor(private auth: AuthService, public stateService: StateService) {
  }

  ngOnInit() {
  }
}
