import { Component, OnInit } from '@angular/core';
import { GaToolBackendService } from '../gatool-backend.service';
import {StateService} from '../state.service';
import {FRCEvent} from '../model/FRCEvent';
import {CacheService} from '../cache.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
  public availableSeasonEvents: FRCEvent[];
  public offlineMode = false;
  public loading = false;

  constructor(public service: GaToolBackendService, public stateManager: StateService,
              private cacheService: CacheService) { }

  ngOnInit() {
    this.stateManager.httpOperationsInProgress().subscribe(loading => this.loading = loading);
    const selectedSeason = this.stateManager.getSelectedSeason();
    if (!!selectedSeason) {
      this.seasonSelectionChange(selectedSeason);
    }
    this.stateManager.getOfflineStatus().subscribe(offline => this.offlineMode = offline);
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

  public offlineModeSwitchChange() {
    this.stateManager.setOfflineStatus(this.offlineMode);
  }

  public clearCache() {
    const r = window.confirm('Are you sure you want to clear your cache');
    if (r === true) {
      this.stateManager.startHttpOperation();
      this.cacheService.clear().subscribe(() => {
        this.stateManager.finishHttpOperation();
      }, () => {
        this.stateManager.finishHttpOperation();
      });
    }
  }
}
