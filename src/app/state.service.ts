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
}
