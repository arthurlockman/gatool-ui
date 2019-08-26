import {Component, OnInit} from '@angular/core';
import {GaToolBackendService} from '../gatool-backend.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  data = '';

  constructor(public service: GaToolBackendService) {
  }

  ngOnInit() {
    this.service.getEvents('2019').subscribe(events => {
      this.data = JSON.stringify(events);
    });
  }
}
