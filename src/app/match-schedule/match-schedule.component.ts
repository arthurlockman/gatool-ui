import { Component, OnInit } from '@angular/core';
import {GaToolBackendService} from '../gatool-backend.service';
import {StateService} from '../state.service';

@Component({
  selector: 'app-match-schedule',
  templateUrl: './match-schedule.component.html',
  styleUrls: ['./match-schedule.component.scss']
})
export class MatchScheduleComponent implements OnInit {
  public selectedSeason: string;
  public selectedEvent: string;

  constructor(public service: GaToolBackendService, public stateManager: StateService) { }

  ngOnInit() {
    this.selectedSeason = this.stateManager.getSelectedSeason();
    this.selectedEvent = this.stateManager.getSelectedEvent();
    if (!!this.selectedEvent && !!this.selectedSeason) {
      // TODO: get data for season here
    }
  }

}
