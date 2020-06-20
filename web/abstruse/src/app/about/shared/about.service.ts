import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSONResponse } from '../../core/shared/shared.model';
import { getAPIURL } from '../../core/shared/shared-functions';

@Injectable({
  providedIn: 'root'
})
export class AboutService {
  constructor(public http: HttpClient) {}

  fetchVersion(): Observable<JSONResponse> {
    const url = getAPIURL() + '/version';
    return this.http.get<JSONResponse>(url);
  }
}
