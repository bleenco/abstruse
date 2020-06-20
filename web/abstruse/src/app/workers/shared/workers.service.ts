import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSONResponse } from '../../core/shared/shared.model';
import { getAPIURL } from '../../core/shared/shared-functions';
import { Worker, generateWorker } from './worker.class';
import { map } from 'rxjs/operators';

export const workerSubAddEvent = '/subs/workers_add';
export const workerSubDeleteEvent = '/subs/workers_delete';
export const workerSubUsageEvent = '/subs/workers_usage';

@Injectable({
  providedIn: 'root'
})
export class WorkersService {
  constructor(public http: HttpClient) {}

  fetchWorkers(): Observable<Worker[]> {
    const url = getAPIURL() + '/workers';
    return this.http.get<JSONResponse>(url).pipe(
      map(resp => (resp.data && resp.data.length ? resp.data : [])),
      map(data => data.map(generateWorker))
    );
  }
}
