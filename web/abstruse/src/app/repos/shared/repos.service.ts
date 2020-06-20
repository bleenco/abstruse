import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { getAPIURL } from 'src/app/core/shared/shared-functions';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { Observable } from 'rxjs';
import { Repo, generateRepoModel } from './repo.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReposService {
  constructor(private http: HttpClient) {}

  list(order = 'updated_at desc'): Observable<Repo[]> {
    const params = new HttpParams().append('order', order);
    const url = `${getAPIURL()}/repos`;
    return this.http
      .get<JSONResponse>(url, { params })
      .pipe(
        map(resp => (resp.data && resp.data.length ? resp.data : [])),
        map(data => data.map((d: any) => generateRepoModel(d)))
      );
  }

  find(repoId: number): Observable<Repo> {
    const url = `${getAPIURL()}/repos/${repoId}`;
    return this.http.get<JSONResponse>(url).pipe(map(resp => generateRepoModel(resp.data)));
  }

  search(keyword: string): Observable<Repo[]> {
    const url = `${getAPIURL()}/repos/search`;
    return this.http
      .post<JSONResponse>(url, { keyword })
      .pipe(
        map(resp => (resp.data && resp.data.length ? resp.data : [])),
        map(data => data.map(generateRepoModel))
      );
  }
}
