import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError, of} from 'rxjs';
import {environment} from '../environments/environment';
import {catchError, map} from 'rxjs/operators';
import {FRCEvent, EventResponse} from './model/FRCEvent';
import {AuthService} from './auth.service';
import {Team, TeamResponse} from './model/team';
import {Award, AwardResponse} from './model/award';

@Injectable({
  providedIn: 'root'
})
export class GaToolBackendService {

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  /**
   * Correctly handles the error returned from an http call.
   * @param error the error to be handled
   */
  private static handleError(error: HttpErrorResponse): Observable<any> {
    console.error(error);
    return throwError({error});
  }

  /**
   * Get a list of events for a particular year.
   * @param year The year to fetch events for.
   */
  public getEvents(year: string): Observable<FRCEvent[]> {
    return this.get(`${year}/events`).pipe(map(evt => {
      return (evt as EventResponse).Events;
    }));
  }

  /**
   * Retrieve teams for a particular event and year
   * @param year The year to fetch teams for
   * @param event The event to fetch teams for
   */
  public getEventTeams(year: string, event: string): Observable<Team[]> {
    return this.get(`${year}/teams?eventCode=${event}`).pipe(map(evt => {
      return (evt as TeamResponse).teams;
    }));
  }

  /**
   * Retrieve team awards for a particular year
   * @param year The year to fetch awards for
   * @param teamNumber The team to fetch awards for
   */
  public getTeamAwards(year: string, teamNumber: number): Observable<Award[]> {
    return this.get(`${year}/awards/${teamNumber}`).pipe(map(evt => {
      return (evt as AwardResponse).Awards;
    }));
  }

  /**
   * Get data from the service and return the data cast as the correct type.
   * @param resource The resource on the API to get data from.
   */
  private get<T>(resource: string): Observable<T> {
    return this.http.get<T>(environment.serviceUrl + resource, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.auth.token}`,
      }
    })
      .pipe(catchError(e => GaToolBackendService.handleError(e)));
  }

  /**
   * Post data to the service and return the data cast as the correct type.
   * @param resource The resource on the API to post data to.
   * @param body The body to POST to the service
   */
  private post<T>(resource: string, body: any): Observable<T> {
    return this.http.post<T>(environment.serviceUrl + resource, body, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.auth.token}`,
      }
    })
      .pipe(catchError(e => GaToolBackendService.handleError(e)));
  }

  /**
   * Patch a resource on the service.
   * @param resource the resource to patch
   * @param body The data to patch the resource with
   */
  private patch<T>(resource: string, body: any): Observable<T> {
    return this.http.patch<T>(environment.serviceUrl + resource, body, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.auth.token}`,
      }
    })
      .pipe(catchError(e => GaToolBackendService.handleError(e)));
  }

  /**
   * Delete a resource on the service.
   * @param resource the resource to delete
   */
  private deleteResource<T>(resource: string): Observable<T> {
    return this.http.delete<T>(environment.serviceUrl + resource, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.auth.token}`,
      }
    })
      .pipe(catchError(e => GaToolBackendService.handleError(e)));
  }
}
