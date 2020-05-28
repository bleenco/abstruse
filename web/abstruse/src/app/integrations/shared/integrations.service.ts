import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { Observable } from 'rxjs';
import { getAPIURL } from 'src/app/core/shared/shared-functions';

@Injectable({
  providedIn: 'root'
})
export class IntegrationsService {

  constructor(public http: HttpClient) { }

  find(): Observable<JSONResponse> {
    const url = getAPIURL() + '/integrations';
    return this.http.get<JSONResponse>(url);
  }
}
