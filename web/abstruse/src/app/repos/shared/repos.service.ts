import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Repo, generateRepoModel } from './repo.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReposService {
  constructor(private http: HttpClient) {}

  find(): Observable<Repo[]> {
    return this.http.get<Repo[]>('/repos').pipe(map(data => data.map(generateRepoModel)));
  }

  setActive(id: number, status: boolean): Observable<void> {
    return this.http.put<void>('/repos/active', { id: id, active: status });
  }
}
