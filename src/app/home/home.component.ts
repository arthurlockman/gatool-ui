import {Component, OnInit} from '@angular/core';
import {GaToolBackendService} from '../gatool-backend.service';
import { EventList } from '../model/FRCEvent';
import { Team } from '../model/team';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public events: EventList;
  public teams: Team[];

  constructor(public service: GaToolBackendService) {
  }

  ngOnInit() {
    this.reload();
  }

  public reload() {
    this.service.getEvents('2019').subscribe(events => {
      this.events = events;
    });
  }

  public onChange(eventCode: any) {
    this.service.getEventTeams('2019', eventCode).subscribe(teams => {
      this.teams = teams;
    });
  }
}
