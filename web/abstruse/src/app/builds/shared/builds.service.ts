import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { getAPIURL } from 'src/app/core/shared/shared-functions';
import { Build, generateBuildModel } from './build.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BuildsService {

  constructor(public http: HttpClient) { }

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

  triggerBuild(repoID: number): Observable<JSONResponse> {
    const url = `${getAPIURL()}/builds/trigger`;
    return this.http.post<JSONResponse>(url, { id: String(repoID) });
  }
}
