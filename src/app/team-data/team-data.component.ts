import { Component, OnInit } from '@angular/core';
import {GaToolBackendService} from '../gatool-backend.service';
import {StateService} from '../state.service';
import {Team} from '../model/team';

@Component({
  selector: 'app-team-data',
  templateUrl: './team-data.component.html',
  styleUrls: ['./team-data.component.scss']
})
export class TeamDataComponent implements OnInit {
  public selectedSeason: string;
  public selectedEvent: string;
  public fetchInProgress = false;
  public teams: Team[];

  constructor(public service: GaToolBackendService, public stateManager: StateService) { }

  ngOnInit() {
    this.selectedSeason = this.stateManager.getSelectedSeason();
    this.selectedEvent = this.stateManager.getSelectedEvent();
    if (!!this.selectedEvent && !!this.selectedSeason) {
      this.fetchInProgress = true;
      this.service.getEventTeams(this.selectedSeason, this.selectedEvent).subscribe(teams => {
        this.fetchInProgress = false;
        this.teams = teams;
      }, err => {
        console.error(err);
        this.fetchInProgress = false;
      });
    }
  }

}
