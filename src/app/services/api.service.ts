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

  getBuilds(limit: number, offset: number, userId?: string): Observable<any> {
    if (userId) {
      return this.get(`${this.url}/builds/limit/${limit}/offset/${offset}/${userId}`, null, true);
    }
    return this.get(`${this.url}/builds/limit/${limit}/offset/${offset}`, null, true);
  }

  getLastBuild(userId?: string): Observable<any> {
    if (userId) {
      return this.get(`${this.url}/builds/last/${userId}`, null, true);
    }
    return this.get(`${this.url}/builds/last`, null, true);
  }

  getBuild(id: string, userId?: string): Observable<any> {
    if (userId) {
      return this.get(`${this.url}/builds/${id}/${userId}`, null, true);
    }
    return this.get(`${this.url}/builds/${id}`, null, true);
  }

  getJob(id: number, userId?: string): Observable<any> {
    if (userId) {
      return this.get(`${this.url}/jobs/${id}/${userId}`, null, true);
    }
    return this.get(`${this.url}/jobs/${id}`, null, true);
  }

  getRepositories(userId: string, keyword: string): Observable<any> {
    const params = new URLSearchParams();
    params.append('keyword', keyword);
    if (userId) {
      return this.get(`${this.url}/repositories/${userId}`, params, true);
    }
    return this.get(`${this.url}/repositories`, params, true);
  }

  getRepository(id: string): Observable<any> {
    return this.get(`${this.url}/repositories/${id}`, null, true);
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
