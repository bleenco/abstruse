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

  updateIntegration(integrationID: number): Observable<JSONResponse> {
    const url = getAPIURL() + `/integrations/update/${String(integrationID)}`;
    return this.http.get<JSONResponse>(url);
  }

  checkIntegrationValidity(provider: 'github' | 'gitlab' | 'bitbucket' | 'gogs', data: any): Observable<JSONResponse> {
    let url: string;
    if (provider === 'github') {
      url = getAPIURL() + '/integrations/github/add';
    }

    return this.http.post<JSONResponse>(url, data);
  }
}
