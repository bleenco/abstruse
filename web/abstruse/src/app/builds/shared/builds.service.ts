import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Build, generateBuildModel } from './build.model';
import { map, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DataService } from '../../shared/providers/data.service';
import { SocketEvent } from 'src/app/shared/models/socket.model';

const buildsSubEvent = '/subs/builds';
const buildsSubJobEvent = '/subs/jobs/';
const buildsSubJobLogEvent = '/subs/logs/';

@Injectable({ providedIn: 'root' })
export class BuildsService {
  constructor(private http: HttpClient, private dataService: DataService) {}

  find(limit: number = 5, offset: number = 0): Observable<Build[]> {
    let params = new HttpParams();
    params.append('limit', String(limit));
    params.append('offset', String(offset));
    return this.http
      .get<Build[]>('/builds', { params })
      .pipe(map(data => (data && data.length ? data.map(generateBuildModel) : [])));
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

  subscribeToJobEvents(builds: number[]): void {
    builds.forEach(buildID => this.dataService.subscribeToEvent(`${buildsSubJobEvent}${buildID}`));
  }

  subscribeToJobLogEvents(jobID: number): void {
    this.dataService.subscribeToEvent(`${buildsSubJobLogEvent}${jobID}`);
  }
}
