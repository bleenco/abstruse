import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Repo, generateRepoModel } from './repo.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReposService {
  constructor(private http: HttpClient) {}

  find(limit: number = 10, offset: number = 0): Observable<{ count: number; data: Repo[] }> {
    let params = new HttpParams();
    params = params.append('limit', String(limit));
    params = params.append('offset', String(offset));
    return this.http
      .get<{ count: number; data: Repo[] }>('/repos', { params })
      .pipe(map(resp => ({ count: resp.count, data: resp.data.map(generateRepoModel) })));
  }

  setActive(id: number, status: boolean): Observable<void> {
    return this.http.put<void>('/repos/active', { id: id, active: status });
  }
}
