import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { getAPIURL } from 'src/app/core/shared/shared-functions';
import { DataService } from 'src/app/shared/providers/data.service';
import { SocketEvent } from 'src/app/shared/models/socket.model';
import { filter, map } from 'rxjs/operators';
import { generateBuildModel, Build } from './build.model';

@Injectable({
  providedIn: 'root'
})
export class BuildService {

  constructor(
    public http: HttpClient,
    public dataService: DataService
  ) { }

  fetchRepoInfo(id: number): Observable<JSONResponse> {
    const url = getAPIURL() + `/repositories/${id}`;
    return this.http.get<JSONResponse>(url);
  }

  fetchBuildInfo(id: number): Observable<JSONResponse> {
    const url = getAPIURL() + `/builds/info/${id}`;
    return this.http.get<JSONResponse>(url);
  }

  fetchJobInfo(id: number): Observable<JSONResponse> {
    const url = getAPIURL() + `/builds/job/${id}`;
    return this.http.get<JSONResponse>(url);
  }

  fetchCurrentBuildByRepoID(repoID: number): Observable<JSONResponse> {
    const url = getAPIURL() + `/builds/current/${repoID}`;
    return this.http.get<JSONResponse>(url);
  }

  fetchBuildsByRepoID(repoID: number, limit = 5, offset = 0): Observable<JSONResponse> {
    const url = getAPIURL() + `/builds/repo/${repoID}/${limit}/${offset}`;
    return this.http.get<JSONResponse>(url);
  }

  triggerBuild(): Observable<JSONResponse> {
    const url = getAPIURL() + '/builds/trigger';
    return this.http.post<JSONResponse>(url, {});
  }

  jobEvents(): Observable<SocketEvent> {
    return this.dataService.socketOutput.pipe(filter(ev => ev.type === 'job_events'));
  }

  buildEvents(): Observable<Build> {
    return this.dataService.socketOutput
      .pipe(
        filter(ev => ev.type === 'build_events'),
        map(ev => generateBuildModel(ev.data.build))
      );
  }

  subscribeToJobEvents(data: { job_id?: number, build_id?: number }): void {
    this.dataService.socketInput.emit({ type: 'subscribe', data: { event: 'job_events', data } });
  }

  unsubscribeFromJobEvents(data: { job_id?: number, build_id?: number }): void {
    this.dataService.socketInput.emit({ type: 'unsubscribe', data: { event: 'job_events', data } });
  }

  subscribeToBuildEvents(): void {
    this.dataService.socketInput.emit({ type: 'subscribe', data: { event: 'build_events' } });
  }

  unsubscribeFromBuildEvents(): void {
    this.dataService.socketInput.emit({ type: 'subscribe', data: { event: 'build_events' } });
  }
}
