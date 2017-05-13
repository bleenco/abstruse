import { Injectable, Provider } from '@angular/core';
import { Http, Response, URLSearchParams, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ApiService {
  url: string;

  constructor(private http: Http) {
    let loc: Location = window.location;
    let port: string = loc.port === '8000' ? ':6500' : `:${loc.port}`; // dev mode
    this.url = `${loc.protocol}//${loc.hostname}${port}/api`;
  }

  getRepositories(userId: string): Observable<any> {
    const params = new URLSearchParams();
    params.append('userId', userId);
    return this.get(`${this.url}/repositories`, params);
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

  initializeDatabase(): Observable<any> {
    return this.post(`${this.url}/setup/db/init`, {});
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
