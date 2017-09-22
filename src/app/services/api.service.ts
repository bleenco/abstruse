import { Injectable, Provider } from '@angular/core';
import { Http, Response, URLSearchParams, RequestOptions, Headers } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { IAccessToken } from '../components/app-settings';

@Injectable()
export class ApiService {
  url: string;
  loc: Location;
  port: string;

  constructor(private http: Http, private router: Router) {
    this.loc = window.location;
    this.port = this.loc.port === '8000' ? ':6500' : `:${this.loc.port}`; // dev mode
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
    const params = new URLSearchParams();
    params.append('keyword', keyword);
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

  getRepositoryBuilds(id: string, limit: number, offset: number): Observable<any> {
    return this.get(`${this.url}/repositories/${id}/builds/${limit}/${offset}`, null, true);
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

  loginRequired(): Observable<any> {
    return this.get(`${this.url}/setup/login-required`);
  }

  getAllTokens(): Observable<any> {
    return this.get(`${this.url}/tokens`, null, true);
  }

  addToken(data: IAccessToken): Observable<any> {
    return this.post(`${this.url}/user/add-token`, data, true);
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

  imagesList(): Observable<any> {
    return this.get(`${this.url}/images`, null, true);
  }

  checkRepositoryConfiguration(id: number): Observable<any> {
    return this.get(`${this.url}/repositories/check/${id}`, null, true);
  }

  triggerTestBuild(id: number): Observable<any> {
    return this.get(`${this.url}/repositories/trigger-test-build/${id}`, null, true);
  }

  private get(url: string, searchParams: URLSearchParams = null, auth = false): Observable<any> {
    let headers = new Headers();
    if (auth) {
      headers.append('abstruse-ci-token', localStorage.getItem('abs-token'));
    }

    return this.http.get(url, { search: searchParams, headers: headers })
      .map(this.extractData)
      .catch(this.handleError);
  }

  private post(url: string, data: any, auth = false): Observable<any> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    if (auth) {
      headers.append('abstruse-ci-token', localStorage.getItem('abs-token'));
    }
    let options = new RequestOptions({ headers: headers });

    return this.http.post(url, data, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private extractData(res: Response) {
    if (res.status !== 200) {
      localStorage.removeItem('abs-token');
      this.router.navigate(['/login']);
    } else {
      let body = res.json();
      return body && typeof body.data !== 'undefined' ? body.data : {};
    }
  }

  private handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }

    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}

export let ApiServiceProvider: Provider = {
  provide: ApiService, useClass: ApiService
};
