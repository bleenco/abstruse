import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Worker, generateWorker } from './worker.model';
import { map } from 'rxjs/operators';

export const workerSubAddEvent = '/subs/workers_add';
export const workerSubDeleteEvent = '/subs/workers_delete';
export const workerSubUsageEvent = '/subs/workers_usage';

@Injectable({ providedIn: 'root' })
export class WorkersService {
  constructor(private http: HttpClient) {}

  find(): Observable<Worker[]> {
    return this.http.get<Worker[]>(`/workers`).pipe(
      map(resp => (resp && resp.length ? resp : [])),
      map(data => data.map(generateWorker))
    );
  }
}
