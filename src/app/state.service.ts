import {Injectable} from '@angular/core';
import {Observable, ReplaySubject, Subject} from 'rxjs';

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

  constructor() {
    this.operationIsInProgress.next(false);
    this.offlineMode.next(localStorage.getItem(StateService.offlineModeStorageKey) === 'true');
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

  public setOfflineStatus(offline: boolean): void {
    this.offlineMode.next(offline);
    localStorage.setItem(StateService.offlineModeStorageKey, `${offline}`);
  }
}
