import { Component, OnInit } from '@angular/core';
import { GaToolBackendService } from '../gatool-backend.service';
import { StateService } from '../state.service';
import { FRCEvent } from '../model/FRCEvent';
import { CacheService } from '../cache.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
  public availableSeasonEvents: FRCEvent[];
  public offlineMode = false;
  public networkOnline = true;
  public loading = false;
  public errorMessage = '';

  constructor(public service: GaToolBackendService, public stateManager: StateService,
    private cacheService: CacheService) { }

  ngOnInit() {
    this.stateManager.httpOperationsInProgress().subscribe(loading => this.loading = loading);
    const selectedSeason = this.stateManager.getSelectedSeason();
    if (!!selectedSeason) {
      this.seasonSelectionChange(selectedSeason);
    }
    this.stateManager.getOfflineStatus().subscribe(offline => this.offlineMode = offline);
    this.stateManager.getNetworkStatus().subscribe(networkOnline => this.networkOnline = networkOnline);
  }



  public seasonSelectionChange(newSeason: string) {
    this.stateManager.setSelectedSeason(newSeason);
    this.availableSeasonEvents = null;
    this.stateManager.startHttpOperation();
    this.service.getEvents(newSeason).subscribe(events => {
      
      events.sort(compareValues('type'));
      events.sort(compareValues('districtCode'));
      events.sort(compareValues('name'));

      this.availableSeasonEvents = events;
      this.stateManager.finishHttpOperation();
      this.errorMessage = '';
    }, err => {
      console.error(err);
      this.errorMessage = err;
      this.stateManager.finishHttpOperation();
    });

    function compareValues(key, order = 'asc') {
      return function innerSort(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
          // property doesn't exist on either object
          return 0;
        }

        const varA = (typeof a[key] === 'string')
          ? a[key].toUpperCase() : a[key];
        const varB = (typeof b[key] === 'string')
          ? b[key].toUpperCase() : b[key];

        let comparison = 0;
        if (varA > varB) {
          comparison = 1;
        } else if (varA < varB) {
          comparison = -1;
        }
        return (
          (order === 'desc') ? (comparison * -1) : comparison
        );
      };
    }
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
