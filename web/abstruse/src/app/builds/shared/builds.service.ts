import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { getAPIURL } from 'src/app/core/shared/shared-functions';

@Injectable({
  providedIn: 'root'
})
export class BuildsService {

  constructor(public http: HttpClient) { }

  startJob(): Observable<JSONResponse> {
    const url = getAPIURL() + '/build/start';
    return this.http.post<JSONResponse>(url, {});
  }
}
