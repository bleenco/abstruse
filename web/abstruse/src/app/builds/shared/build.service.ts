import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { getAPIURL } from 'src/app/core/shared/shared-functions';

@Injectable({
  providedIn: 'root'
})
export class BuildService {

  constructor(public http: HttpClient) { }

  triggerBuild(): Observable<JSONResponse> {
    const url = getAPIURL() + '/builds/trigger';
    return this.http.post<JSONResponse>(url, {});
  }
}
