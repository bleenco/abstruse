import { Injectable, Provider } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, map } from 'rxjs/operators';
import { IAccessToken } from '../components/app-user';

@Injectable()
export class ApiService {
  url: string;
  loc: Location;
  port: string;

  constructor(private http: HttpClient, private router: Router) {
    this.loc = window.location;
    this.port = this.loc.port === '4200' ? ':6500' : `:${this.loc.port}`; // dev mode
    this.url = `${this.loc.protocol}//${this.loc.hostname}${this.port}/api`;
  }

  getBadge(id: number): Observable<any> {
    return this.http.get(`${this.loc.protocol}//${this.loc.hostname}${this.port}/badge/${id}`);
  }

  getLogs(limit: number, offset: number, type: string): Observable<any> {
    return this.get(`${this.url}/logs/${limit}/${offset}/${type}`, null, true);
  }

  getBuilds(limit: number, offset: number, buildTypes: string, userId?: string): Observable<any> {
    if (userId) {
      return this.get(
        `${this.url}/builds/limit/${limit}/offset/${offset}/${buildTypes}/${userId}`, null, true);
    } else {
      return this.get(
        `${this.url}/builds/limit/${limit}/offset/${offset}/${buildTypes}`, null, true);
    }
  }

  getBuild(id: string, userId?: string | null): Observable<any> {
    if (userId) {
      return this.get(`${this.url}/builds/${id}/${userId}`, null, true);
    } else {
      return this.get(`${this.url}/builds/${id}`, null, true);
    }
  }

  getJob(id: number, userId?: string): Observable<any> {
    if (userId) {
      return this.get(`${this.url}/jobs/${id}/${userId}`, null, true);
    } else {
      return this.get(`${this.url}/jobs/${id}`, null, true);
    }
  }

  getRepositories(keyword: string, userId?: string): Observable<any> {
    const params = new HttpParams();
    params.set('keyword', keyword);
    if (userId) {
      return this.get(`${this.url}/repositories/${userId}`, params, true);
    }
    return this.get(`${this.url}/repositories`, params, true);
  }

  getRepository(id: string, userId?: string): Observable<any> {
    if (userId) {
      return this.get(`${this.url}/repositories/id/${id}/${userId}`, null, true);
    }

    return this.get(`${this.url}/repositories/id/${id}`, null, true);
  }

  getRepositoryBuilds(id: string, limit: number, offset: number, userId: string): Observable<any> {
    if (userId) {
      return this.get(`${this.url}/repositories/${id}/builds/${limit}/${offset}/${userId}`, null, true);
    } else {
      return this.get(`${this.url}/repositories/${id}/builds/${limit}/${offset}`, null, true);
    }
  }

  addRepository(data: any): Observable<any> {
    return this.post(`${this.url}/repositories/add`, data, true);
  }

  saveRepositorySettings(data: any): Observable<any> {
    return this.post(`${this.url}/repositories/save`, data, true);
  }

  isAppReady(): Observable<any> {
    return this.get(`${this.url}/setup/ready`);
  }

  getServerStatus(): Observable<any> {
    return this.get(`${this.url}/setup/status`);
  }

  getDatabaseStatus(): Observable<any> {
    return this.get(`${this.url}/setup/db`);
  }

  dockerImageExists(): Observable<any> {
    return this.get(`${this.url}/setup/docker-image`);
  }

  initializeDatabase(): Observable<any> {
    return this.post(`${this.url}/setup/db/init`, {});
  }

  buildAbstruseBaseImage(): Observable<any> {
    return this.post(`${this.url}/images/build-base`, {});
  }

  loginRequired(): Observable<any> {
    return this.get(`${this.url}/setup/login-required`);
  }

  configDemo(): Observable<any> {
    return this.get(`${this.url}/config/demo`, null, true);
  }

  getAllTokens(): Observable<any> {
    return this.get(`${this.url}/tokens`, null, true);
  }

  addToken(data: IAccessToken): Observable<any> {
    return this.post(`${this.url}/user/add-token`, data, true);
  }

  removeToken(id: number): Observable<any> {
    return this.get(`${this.url}/user/remove-token/${id}`, null, true);
  }

  getUsers(): Observable<any> {
    return this.get(`${this.url}/user`, null, true);
  }

  getUser(id: number): Observable<any> {
    return this.get(`${this.url}/user/${id}`, null, true);
  }

  updateUser(data: any): Observable<any> {
    return this.post(`${this.url}/user/save`, data, true);
  }

  updatePassword(data: any): Observable<any> {
    return this.post(`${this.url}/user/update-password`, data, true);
  }

  createUser(data: any): Observable<any> {
    return this.post(`${this.url}/user/create`, data, true);
  }

  login(data: any): Observable<any> {
    return this.post(`${this.url}/user/login`, data);
  }

  updateRepositoryPermission(data: any): Observable<any> {
    return this.post(`${this.url}/repositories/permission`, data, true);
  }

  getUserRepositoryPermission(repoId: string, userId?: number): Observable<any> {
    if (userId) {
      return this.get(`${this.url}/permissions/repository/${repoId}/user/${userId}`, null, true);
    }
    return this.get(`${this.url}/permissions/repository/${repoId}/user`, null, true);
  }

  getUserBuildPermission(buildId: string, userId?: number): Observable<any> {
    if (userId) {
      return this.get(`${this.url}/permissions/build/${buildId}/user/${userId}`, null, true);
    }
    return this.get(`${this.url}/permissions/build/${buildId}/user`, null, true);
  }

  getUserJobPermission(jobId: string, userId?: number): Observable<any> {
    if (userId) {
      return this.get(`${this.url}/permissions/job/${jobId}/user/${userId}`, null, true);
    }
    return this.get(`${this.url}/permissions/job/${jobId}/user`, null, true);
  }

  getGithubUserData(username: string): Observable<any> {
    return this.http.get(`https://api.github.com/users/${username}`);
  }

  addNewEnvironmentVariable(data: any): Observable<any> {
    return this.post(`${this.url}/variables/add`, data, true);
  }

  removeNewEnvironmentVariable(id: number): Observable<any> {
    return this.get(`${this.url}/variables/remove/${id}`, null, true);
  }

  statsJobRuns(): Observable<any> {
    return this.get(`${this.url}/stats/job-runs`, null, true);
  }

  statsJobRunsBetween(dateFrom: string, dateTo: string): Observable<any> {
    return this.get(`${this.url}/stats/job-runs/${dateFrom}/${dateTo}`, null, true);
  }

  imagesList(): Observable<any> {
    return this.get(`${this.url}/images`, null, true);
  }

  checkRepositoryConfiguration(id: number): Observable<any> {
    return this.get(`${this.url}/repositories/check/${id}`, null, true);
  }

  triggerTestBuild(id: number): Observable<any> {
    return this.get(`${this.url}/repositories/trigger-test-build/${id}`, null, true);
  }

  getRepositoryConfigRawFile(id: number): Observable<any> {
    return this.get(`${this.url}/repositories/get-config-file/${id}`, null, true);
  }

  runRepositoryBuildFromConfig(data: any): Observable<any> {
    return this.post(`${this.url}/repositories/run-build-config`, data, true);
  }

  fetchCacheForRepository(id: number): Observable<any> {
    return this.get(`${this.url}/repositories/get-cache/${id}`, null, true);
  }

  deleteCacheForRepository(id: number): Observable<any> {
    return this.get(`${this.url}/repositories/delete-cache/${id}`, null, true);
  }

  customGet(url: string, searchParams: any = null): Observable<any> {
    const params = new HttpParams();
    Object.keys(searchParams).forEach(key => {
      params.set(key, searchParams[key]);
    });

    return this.http.get(url, { params: params })
      .pipe(
        map((x: any) => x.data),
        catchError(this.handleError)
      );
  }

  private get(url: string, searchParams: HttpParams = null, auth = false): Observable<any> {
    const headers = new HttpHeaders();
    if (auth) {
      headers['abstruse-ci-token'] = localStorage.getItem('abs-token');
    }

    return this.http.get(url, { params: searchParams, headers: headers })
      .pipe(
        map((x: any) => x.data),
        catchError(this.handleError)
      );
  }

  private post(url: string, data: any, auth = false): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (auth) {
      headers['abstruse-ci-token'] = localStorage.getItem('abs-token');
    }
    const options = { headers: headers };

    return this.http.post(url, data, options)
      .pipe(
        map((x: any) => x.data),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return new ErrorObservable('Something bad happened; please try again later.');
  }
}

export let ApiServiceProvider: Provider = {
  provide: ApiService, useClass: ApiService
};
