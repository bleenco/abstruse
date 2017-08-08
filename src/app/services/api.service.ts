import { Injectable, Provider } from '@angular/core';
import { Http, Response, URLSearchParams, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ApiService {
  url: string;
  loc: Location;
  port: string;

  constructor(private http: Http) {
    this.loc = window.location;
    this.port = this.loc.port === '8000' ? ':6500' : `:${this.loc.port}`; // dev mode
    this.url = `${this.loc.protocol}//${this.loc.hostname}${this.port}/api`;
  }

  getBadge(id: number): Observable<any> {
    return this.http.get(`${this.loc.protocol}//${this.loc.hostname}${this.port}/badge/${id}`);
  }

  getBuilds(limit: number, offset: number): Observable<any> {
    return this.get(`${this.url}/builds/limit/${limit}/offset/${offset}`);
  }

  getBuild(id: string): Observable<any> {
    return this.get(`${this.url}/builds/${id}`);
  }

  getJob(id: number): Observable<any> {
    return this.get(`${this.url}/jobs/${id}`);
  }

  getRepositories(userId: string, keyword: string): Observable<any> {
    const params = new URLSearchParams();
    params.append('userId', userId);
    params.append('keyword', keyword);
    return this.get(`${this.url}/repositories`, params);
  }

  getRepository(id: string): Observable<any> {
    return this.get(`${this.url}/repositories/${id}`);
  }

  addRepository(data: any): Observable<any> {
    return this.post(`${this.url}/repositories/add`, data);
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

  getUsers(): Observable<any> {
    return this.get(`${this.url}/user`);
  }

  getUser(id: number): Observable<any> {
    return this.get(`${this.url}/user/${id}`);
  }

  updateUser(data: any): Observable<any> {
    return this.post(`${this.url}/user/save`, data);
  }

  updatePassword(data: any): Observable<any> {
    return this.post(`${this.url}/user/update-password`, data);
  }

  createUser(data: any): Observable<any> {
    return this.post(`${this.url}/user/create`, data);
  }

  login(data: any): Observable<any> {
    return this.post(`${this.url}/user/login`, data);
  }

  private get(url: string, searchParams: URLSearchParams = null): Observable<any> {
    return this.http.get(url, { search: searchParams })
      .map(this.extractData)
      .catch(this.handleError);
  }

  private post(url: string, data: any): Observable<any> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(url, data, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private extractData(res: Response) {
    let body = res.json();
    return body && typeof body.data !== 'undefined' ? body.data : {};
  }

  private handleError (error: Response | any) {
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
