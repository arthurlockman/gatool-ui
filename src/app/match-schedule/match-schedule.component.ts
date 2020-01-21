import { Component, OnInit } from '@angular/core';
import { GaToolBackendService } from '../gatool-backend.service';
import { StateService } from '../state.service';
import { Match } from '../model/match';
import {MomentModule} from 'ngx-moment';

@Component({
  selector: 'app-match-schedule',
  templateUrl: './match-schedule.component.html',
  styleUrls: ['./match-schedule.component.scss']
})
export class MatchScheduleComponent implements OnInit {
  public selectedSeason: string;
  public selectedEvent: string;
  public qualSchedule: Match[];
  public playoffSchedule: Match[];
  public errorMessage = '';

  constructor(public service: GaToolBackendService, public stateManager: StateService) { }

  ngOnInit() {
    this.selectedSeason = this.stateManager.getSelectedSeason();
    this.selectedEvent = this.stateManager.getSelectedEvent();
    if (!!this.selectedEvent && !!this.selectedSeason) {
      this.stateManager.startHttpOperation();
      if (!!this.selectedEvent && !!this.selectedSeason) {
        this.service.getSchedule(this.selectedSeason, this.selectedEvent, 'qual').subscribe(qualSchedule => {
          this.stateManager.finishHttpOperation();
          this.qualSchedule = qualSchedule;
        }, err => {
          this.stateManager.finishHttpOperation();
          console.error(err);
          this.errorMessage = err;
        });
        this.stateManager.startHttpOperation();
        this.service.getSchedule(this.selectedSeason, this.selectedEvent, 'playoff').subscribe(playoffSchedule => {
          this.stateManager.finishHttpOperation();
          this.playoffSchedule = playoffSchedule;
        }, err => {
          this.stateManager.finishHttpOperation();
          console.error(err);
          this.errorMessage = err;
        });
      }
    }
  }
}
