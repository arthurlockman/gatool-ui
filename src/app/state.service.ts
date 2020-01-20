import {Injectable} from '@angular/core';
import {fromEvent, Observable, ReplaySubject} from 'rxjs';
import { TeamData } from './model/team';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Local storage keys
  static seasonStorageKey = 'selectedSeason';
  static eventStorageKey = 'selectedEventCode';
  static offlineModeStorageKey = 'offlineModeEnabled';

  // Default values
  static defaultSeason = '2020';

  // Number of active operations on the page
  private operationsInProgress = 0;
  private operationIsInProgress = new ReplaySubject<boolean>(1);

  // Are we in offline mode?
  private offlineMode = new ReplaySubject<boolean>(1);
  private networkStatus = new ReplaySubject<boolean>(1);

  // Automated offline mode handling
  private offlineEvent: Observable<Event>;
  private onlineEvent: Observable<Event>;
  private forcedOffline = false;

  private teamList: Observable<TeamData[]>;

  constructor() {
    this.operationIsInProgress.next(false);
    this.offlineMode.next(localStorage.getItem(StateService.offlineModeStorageKey) === 'true');

    // Subscribe to automatic window offline/online events
    this.offlineEvent = fromEvent(window, 'offline');
    this.onlineEvent = fromEvent(window, 'online');
    this.offlineEvent.subscribe(() => {
      this.networkStatus.next(false);
      this.setOfflineStatus(true, true);
    });
    this.onlineEvent.subscribe(() => {
      this.networkStatus.next(true);
      if (this.forcedOffline) {
        this.setOfflineStatus(false, false);
      }
    });
  }

  /**
   * Set the currently selected season
   * @param season The season to set
   */
  public setSelectedSeason(season: string): void {
    localStorage.setItem(StateService.seasonStorageKey, season);
  }

  /**
   * Get the currently selected season. Returns the default if no selection is made.
   */
  public getSelectedSeason(): string {
    const value = localStorage.getItem(StateService.seasonStorageKey);
    return value === null ? StateService.defaultSeason : value;
  }

  /**
   * Set the currently selected event
   * @param eventCode The event to set
   */
  public setSelectedEvent(eventCode: string): void {
    localStorage.setItem(StateService.eventStorageKey, eventCode);
  }

  /**
   * Get the currently selected event. Returns null if no selection.
   */
  public getSelectedEvent(): string {
    return localStorage.getItem(StateService.eventStorageKey);
  }

  public startHttpOperation(): void {
    this.operationsInProgress++;
    this.operationIsInProgress.next(this.operationsInProgress > 0);
  }

  public finishHttpOperation(): void {
    if (this.operationsInProgress > 0) { this.operationsInProgress--; }
    this.operationIsInProgress.next(this.operationsInProgress > 0);
  }

  public httpOperationsInProgress(): Observable<boolean> {
    return this.operationIsInProgress;
  }

  public getOfflineStatus(): Observable<boolean> {
    return this.offlineMode;
  }

  public getNetworkStatus(): Observable<boolean> {
    return this.networkStatus;
  }

  public setOfflineStatus(offline: boolean, forced: boolean = false): void {
    this.offlineMode.next(offline);
    this.forcedOffline = forced;
    localStorage.setItem(StateService.offlineModeStorageKey, `${offline}`);
  }
}
