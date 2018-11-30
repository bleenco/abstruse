import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { getAPIURL } from 'src/app/core/shared/shared-functions';

@Injectable({
  providedIn: 'root'
})
export class ReposService {

  constructor(
    public http: HttpClient
  ) { }

  fetchRepositories(): Observable<JSONResponse> {
    const url = getAPIURL() + `/repositories`;
    return this.http.get<JSONResponse>(url);
  }
}
