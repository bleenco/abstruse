import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { getAPIURL } from 'src/app/core/shared/shared-functions';

@Injectable({
  providedIn: 'root'
})
export class ReposService {
  configurationDialogOpened: boolean;

  constructor(
    public http: HttpClient
  ) { }

  openConfigurationDialog(): void {
    this.configurationDialogOpened = true;
  }

  closeConfigurationDialog(): void {
    this.configurationDialogOpened = false;
  }

  fetchRepositories(order = 'updated_at desc'): Observable<JSONResponse> {
    const params = new HttpParams().append('order', order);
    const url = getAPIURL() + `/repositories`;
    return this.http.get<JSONResponse>(url, { params });
  }

  fetchRepository(id: number): Observable<JSONResponse> {
    const url = getAPIURL() + `/repositories/${id}`;
    return this.http.get<JSONResponse>(url);
  }

  // fetchRepositoryWebhooks(id: number): Observable<JSONResponse> {
  //   const url = getAPIURL() + `/repositories/${id}/hooks`;
  //   return this.http.get<JSONResponse>(url);
  // }

  // addRepositoryWebhook(id: number, data: Hook): Observable<JSONResponse> {
  //   const url = getAPIURL() + `/repositories/${id}/hooks`;
  //   return this.http.post<JSONResponse>(url, data);
  // }
}
