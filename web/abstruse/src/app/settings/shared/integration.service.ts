import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { getAPIURL } from 'src/app/core/shared/shared-functions';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntegrationService {
  integrationDialogOpened: boolean;

  constructor(public http: HttpClient) { }

  openIntegrationDialog(): void {
    this.integrationDialogOpened = true;
  }

  closeIntegrationDialog(): void {
    this.integrationDialogOpened = false;
  }

  fetchIntegrations(): Observable<JSONResponse> {
    const url = getAPIURL() + '/integrations';
    return this.http.get<JSONResponse>(url);
  }

  fetchIntegration(id: number): Observable<JSONResponse> {
    const url = getAPIURL() + `/integrations/${String(id)}`;
    return this.http.get<JSONResponse>(url);
  }

  fetchIntegrationRepos(id: number): Observable<JSONResponse> {
    const url = getAPIURL() + `/integrations/${String(id)}/repos`;
    return this.http.get<JSONResponse>(url);
  }

  updateIntegration(id: number): Observable<JSONResponse> {
    const url = getAPIURL() + `/integrations/${String(id)}/update`;
    return this.http.get<JSONResponse>(url);
  }

  checkIntegrationValidity(provider: 'github' | 'gitlab' | 'bitbucket' | 'gitea', data: any): Observable<JSONResponse> {
    let url: string;
    if (provider === 'github') {
      url = getAPIURL() + '/integrations/github/add';
    }

    return this.http.post<JSONResponse>(url, data);
  }

  importRepository(provider: string, data: any, integrationID: number): Observable<JSONResponse> {
    let url;
    switch (provider) {
      case 'github': url = getAPIURL() + `/integrations/github/import/${integrationID}`; break;
    }

    return this.http.post<JSONResponse>(url, data);
  }

  fetchRepositories(): Observable<JSONResponse> {
    const url = getAPIURL() + `/repositories`;
    return this.http.get<JSONResponse>(url);
  }
}
