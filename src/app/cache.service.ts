import {Injectable} from '@angular/core';
import {from, Observable, of, Subject, throwError} from 'rxjs';
import {catchError, flatMap, map, tap} from 'rxjs/operators';
import {StateService} from './state.service';
import { get, set, keys, del, clear } from 'idb-keyval';

interface CacheContent {
  expiry: number;
  value: any;
}

/**
 * Cache Service is an observables based in-memory cache implementation
 * Keeps track of in-flight observables and sets a default expiry for cached values
 * Original source is here: https://github.com/ashwin-sureshkumar/angular-cache-service-blog/blob/master/src/app/cache.service.ts
 */
@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private inFlightObservables: Map<string, Subject<any>> = new Map<string, Subject<any>>();
  readonly DEFAULT_MAX_AGE: number = 60; // seconds
  private offline = false;

  constructor(private stateService: StateService) {
    this.stateService.getOfflineStatus().subscribe(offline => this.offline = offline);
  }

  /**
   * Gets the value from cache if the key is provided.
   * If no value exists in cache, then check if the same call exists
   * in flight, if so return the subject. If not create a new
   * Subject inFlightObservable and return the source observable.
   */
  get(key: string, fallback?: Observable<any>, maxAge?: number, forceReload: boolean = false): Observable<any> | Subject<any> {
    return this.hasValidCachedValue(key).pipe(flatMap(cachedValue => {
      if (cachedValue != null && !forceReload) {
        console.log(`%cGetting from cache ${key}`, 'color: green');
        return of(cachedValue.value);
      } else if (this.offline) {
        return throwError(`No cached value found for route ${key}`);
      }

      if (!maxAge) {
        maxAge = this.DEFAULT_MAX_AGE;
      }

      if (this.inFlightObservables.has(key)) {
        return this.inFlightObservables.get(key);
      } else if (fallback && fallback instanceof Observable) {
        this.inFlightObservables.set(key, new Subject());
        console.log(`%c Calling api for ${key}`, 'color: purple');
        return fallback.pipe(tap((value) => { this.set(key, value, maxAge); }),
          catchError((e: any) => { // `fallback` are crashed
            // crashed flight is terrible it's better to clean it up...
            this.inFlightObservables.delete(key);
            // and when we have done our job, it's good idea to let the others know this event.
            // maybe they have their stuffs need to be done too.
            return throwError(e);
          }));
      } else {
        return throwError('Requested key is not available in Cache');
      }
    }));
  }

  /**
   * Sets the value with key in the cache
   * Notifies all observers of the new value
   */
  set(key: string, value: any, maxAge: number = this.DEFAULT_MAX_AGE): void {
    const content: CacheContent = { value, expiry: Date.now() + (maxAge * 1000) };
    set(key, content).then(() =>
      this.notifyInFlightObservers(key, value)
    ).catch(err => console.error(err));
  }

  /**
   * Checks if the a key exists in cache
   */
  has(key: string): Observable<boolean> {
    return from(keys()).pipe(map(k => {
      return k.includes(key);
    }));
  }

  /**
   * Clear the cache
   */
  clear(): Observable<void> {
    return from(clear());
  }

  /**
   * Publishes the value to all observers of the given
   * in progress observables if observers exist.
   */
  private notifyInFlightObservers(key: string, value: any): void {
    if (this.inFlightObservables.has(key)) {
      const inFlight = this.inFlightObservables.get(key);
      const observersCount = inFlight.observers.length;
      if (observersCount) {
        console.log(`%cNotifying ${inFlight.observers.length} flight subscribers for ${key}`, 'color: blue');
        inFlight.next(value);
      }
      inFlight.complete();
      this.inFlightObservables.delete(key);
    }
  }

  /**
   * Checks if the key exists and   has not expired.
   */
  private hasValidCachedValue(key: string): Observable<CacheContent | null> {
    return from(get<CacheContent>(key)).pipe(flatMap(value => {
      if (!!value && value.expiry < Date.now() && !this.offline) {
        return from(del(key)).pipe(map(() => null));
      } else {
        return of(value);
      }
    }));
  }
}
