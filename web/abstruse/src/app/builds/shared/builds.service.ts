import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Build, generateBuildModel, Job, generateJobModel } from './build.model';
import { map, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DataService } from '../../shared/providers/data.service';
import { SocketEvent } from 'src/app/shared/models/socket.model';

const buildsSubEvent = '/subs/builds';
const buildsSubJobEvent = '/subs/jobs';
const buildsSubJobLogEvent = '/subs/logs/';

export interface BuildsFindParams {
  type: 'latest' | 'commits' | 'branches' | 'pull-requests';
  limit: number;
  offset: number;
  repoID?: number;
}

@Injectable({ providedIn: 'root' })
export class BuildsService {
  constructor(private http: HttpClient, private dataService: DataService) {}

  find(data: BuildsFindParams): Observable<Build[]> {
    let params = new HttpParams();
    params = params.append('type', data.type || 'latest');
    params = params.append('limit', String(data.limit));
    params = params.append('offset', String(data.offset));
    if (data.repoID) {
      params = params.append('repoID', String(data.repoID));
    }
    return this.http
      .get<Build[]>('/builds', { params })
      .pipe(map(data => (data && data.length ? data.map(generateBuildModel) : [])));
  }

  findBuild(id: number): Observable<Build> {
    return this.http.get<Build>(`/builds/${id}`).pipe(map(generateBuildModel));
  }

  triggerBuild(id: number): Observable<void> {
    return this.http.put<void>('/builds/trigger', { id });
  }

  restartBuild(id: number): Observable<void> {
    return this.http.put<void>('/builds/restart', { id });
  }

  stopBuild(id: number): Observable<void> {
    return this.http.put<void>('/builds/stop', { id });
  }

  findJob(id: number): Observable<Job> {
    return this.http.get<Job>(`/builds/job/${id}`).pipe(map(generateJobModel));
  }

  restartJob(id: number): Observable<void> {
    return this.http.put<void>('/builds/job/restart', { id });
  }

  stopJob(id: number): Observable<void> {
    return this.http.put<void>('/builds/job/stop', { id });
  }

  buildsEvents(repoID?: number): Observable<Build> {
    return this.dataService.socketOutput.pipe(
      filter(ev => {
        if (repoID) {
          return ev.type === buildsSubEvent && ev.data.build.repository_id === repoID;
        }
        return ev.type === buildsSubEvent;
      }),
      map(ev => generateBuildModel(ev.data.build))
    );
  }

  jobEvents(): Observable<SocketEvent> {
    return this.dataService.socketOutput.pipe(filter(ev => ev.type.startsWith(buildsSubJobEvent)));
  }

  jobLogEvents(): Observable<SocketEvent> {
    return this.dataService.socketOutput.pipe(filter(ev => ev.type.startsWith(buildsSubJobLogEvent)));
  }

  subscribeToBuildsEvents(): void {
    this.dataService.subscribeToEvent(buildsSubEvent);
  }

  subscribeToJobEvents(): void {
    this.dataService.subscribeToEvent(buildsSubJobEvent);
  }

  subscribeToJobLogEvents(jobID: number): void {
    this.dataService.subscribeToEvent(`${buildsSubJobLogEvent}${jobID}`);
  }
}
