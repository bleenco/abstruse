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

  constructor(
    private http: HttpClient
  ) { }

  list(order = 'updated_at desc'): Observable<Repo[]> {
    const params = new HttpParams().append('order', order);
    const url = `${getAPIURL()}/repos`;
    return this.http.get<JSONResponse>(url, { params })
      .pipe(
        map(resp => resp.data && resp.data.length ? resp.data : []),
        map(data => data.map((d: any) => generateRepoModel(d)))
      );
  }
}
