import { Component, OnInit } from '@angular/core';
import { GaToolBackendService } from '../gatool-backend.service';
import {StateService} from '../state.service';
import {FRCEvent} from '../model/FRCEvent';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
  public availableSeasonEvents: FRCEvent[];
  public teamDataBold = false;

  constructor(public service: GaToolBackendService, public stateManager: StateService) { }

  ngOnInit() {
    const selectedSeason = this.stateManager.getSelectedSeason();
    if (!!selectedSeason) {
      this.seasonSelectionChange(selectedSeason);
    }
    this.teamDataBold = this.stateManager.getTeamDataBold();
  }

  public seasonSelectionChange(newSeason: string) {
    this.stateManager.setSelectedSeason(newSeason);
    this.availableSeasonEvents = null;
    this.stateManager.startHttpOperation();
    this.service.getEvents(newSeason).subscribe(events => {
      this.availableSeasonEvents = events;
      this.stateManager.finishHttpOperation();
    }, err => {
      console.error(err);
      this.stateManager.finishHttpOperation();
    });
  }

  public eventSelectionChange(eventCode: string) {
    this.stateManager.setSelectedEvent(eventCode);
  }

  public teamDataBoldSwitchChange() {
    this.stateManager.setTeamDataBold(this.teamDataBold);
  }
}
