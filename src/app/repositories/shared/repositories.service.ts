import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JSONResponse } from '../../core/shared/shared.model';
import { getAPIURL, handleError } from '../../core/shared/shared-functions';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DataService } from '../../shared/providers/data.service';

@Injectable({
  providedIn: 'root'
})
export class RepositoriesService {

  constructor(public http: HttpClient, public dataService: DataService) { }

  fetchRepositories(): Observable<JSONResponse> {
    const url = getAPIURL() + '/repositories';

    return this.http.get<JSONResponse>(url)
      .pipe(
        catchError(handleError<JSONResponse>('repositories'))
      );
  }

  fetchRepository(id: number): Observable<JSONResponse> {
    const url = getAPIURL() + '/repositories/' + String(id);

    return this.http.get<JSONResponse>(url)
      .pipe(
        catchError(handleError<JSONResponse>('repositories/' + String(id)))
      );
  }

  fetchRepositoryBuilds(id: number, limit: number, offset: number): Observable<JSONResponse> {
    const url = getAPIURL() + '/repositories/' + String(id) + '/builds';
    let params = new HttpParams();
    params = params.append('limit', String(limit));
    params = params.append('offset', String(offset));

    return this.http.get<JSONResponse>(url, { params })
      .pipe(
        catchError(handleError<JSONResponse>('repositories/' + String(id) + '/builds'))
      );
  }

  fetchAccessTokens(): Observable<JSONResponse> {
    const url = getAPIURL() + '/access-token';
    return this.http.get<JSONResponse>(url)
      .pipe(
        catchError(handleError<JSONResponse>('access-token'))
      );
  }
}
