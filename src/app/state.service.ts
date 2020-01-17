import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Local storage keys
  static seasonStorageKey = 'selectedSeason';
  static eventStorageKey = 'selectedEventCode';

  // Default values
  static defaultSeason = '2020';

  // Temporary (non-persisted) settings
  private teamDataBold = false;

  // Number of active operations on the page
  private operationsInProgress = 0;

  constructor() { }

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

  public setTeamDataBold(bold: boolean): void {
    this.teamDataBold = bold;
  }

  public getTeamDataBold(): boolean {
    return this.teamDataBold;
  }

  public startHttpOperation(): void {
    this.operationsInProgress++;
  }

  public finishHttpOperation(): void {
    if (this.operationsInProgress > 0) { this.operationsInProgress--; }
  }

  public httpOperationsInProgress(): boolean {
    return this.operationsInProgress > 0;
  }
}
