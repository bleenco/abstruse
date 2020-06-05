import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { getAPIURL } from 'src/app/core/shared/shared-functions';
import { Build, generateBuildModel, Job, generateJobModel } from './build.model';
import { map, filter } from 'rxjs/operators';
import { DataService } from 'src/app/shared/providers/data.service';
import { SocketEvent } from 'src/app/shared/models/socket.model';

const buildsSubEvent = '/subs/builds';
const buildsSubJobEvent = '/subs/jobs/';

@Injectable({
  providedIn: 'root'
})
export class BuildsService {

  constructor(public http: HttpClient, public dataService: DataService) { }

  findBuilds(limit = 5, offset = 0): Observable<Build[]> {
    const url = `${getAPIURL()}/builds/all/${limit}/${offset}`;
    return this.http.get<JSONResponse>(url)
      .pipe(
        map((resp: JSONResponse) => resp.data.map(generateBuildModel))
      );
  }

  find(buildID: number): Observable<Build> {
    const url = `${getAPIURL()}/builds/info/${buildID}`;
    return this.http.get<JSONResponse>(url)
      .pipe(
        map((resp: any) => generateBuildModel(resp.data))
      );
  }

  findAll(buildID: number): Observable<Build> {
    const url = `${getAPIURL()}/builds/info/${buildID}/all`;
    return this.http.get<JSONResponse>(url)
      .pipe(
        map((resp: JSONResponse) => generateBuildModel(resp.data))
      );
  }

  findByRepoID(repoID: number, limit = 5, offset = 0): Observable<Build[]> {
    const url = `${getAPIURL()}/builds/repo/${repoID}/${limit}/${offset}`;
    return this.http.get<JSONResponse>(url)
      .pipe(
        map((resp: JSONResponse) => resp.data.map(generateBuildModel))
      );
  }

  findJob(jobID: number): Observable<Job> {
    const url = `${getAPIURL()}/builds/jobs/${jobID}`;
    return this.http.get<JSONResponse>(url)
      .pipe(
        map((resp: JSONResponse) => generateJobModel(resp.data))
      );
  }

  triggerBuild(repoID: number): Observable<JSONResponse> {
    const url = `${getAPIURL()}/builds/trigger`;
    return this.http.post<JSONResponse>(url, { id: String(repoID) });
  }

  buildsEvents(repoID?: number): Observable<Build> {
    return this.dataService.socketOutput
      .pipe(
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
    return this.dataService.socketOutput
      .pipe(filter(ev => ev.type.startsWith(buildsSubJobEvent)));
  }

  subscribeToBuildsEvents(): void {
    this.dataService.subscribeToEvent(buildsSubEvent);
  }

  subscribeToJobEvents(builds: number[]): void {
    builds.forEach(buildID => this.dataService.subscribeToEvent(`${buildsSubJobEvent}${buildID}`));
  }
}
