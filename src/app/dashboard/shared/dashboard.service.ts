import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSONResponse } from '../../core/shared/shared.model';
import { getAPIURL, handleError } from '../../core/shared/shared-functions';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  updateJobRunsChart: EventEmitter<any>;
  updateCpuPercentage: EventEmitter<any>;
  updateCpuCores: EventEmitter<any>;
  updateContainerStats: EventEmitter<any>;

  constructor(public http: HttpClient) {
    this.updateJobRunsChart = new EventEmitter<any>();
    this.updateCpuPercentage = new EventEmitter<any>();
    this.updateCpuCores = new EventEmitter<any>();
    this.updateContainerStats = new EventEmitter<any>();
  }

  fetchJobRunsData(dateFrom: Date, dateTo: Date): Observable<JSONResponse> {
    const url = getAPIURL() + `/stats/job-runs/${dateFrom}/${dateTo}`;
    return this.http.get<JSONResponse>(url)
      .pipe(catchError(handleError<JSONResponse>('stats/job-runs')));
  }
}
