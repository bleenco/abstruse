import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { getAPIURL } from 'src/app/core/shared/shared-functions';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntegrationService {

  constructor(public http: HttpClient) { }

  checkIntegrationValidity(provider: 'github' | 'gitlab' | 'bitbucket' | 'gogs', data: any): Observable<JSONResponse> {
    let url: string;
    if (provider === 'github') {
      url = getAPIURL() + '/integration/github/add';
    }

    return this.http.post<JSONResponse>(url, data);
  }
}
