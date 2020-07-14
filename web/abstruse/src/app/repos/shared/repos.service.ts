import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, generate } from 'rxjs';
import { Repo, generateRepoModel } from './repo.model';
import { map, finalize, take, switchMap, share } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Hook, generateHook } from './hook.model';

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class ReposService {
  repoSubject: Subject<Repo> = new Subject<Repo>();
  repo = this.repoSubject.asObservable().pipe(share());
  loading: boolean = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  find(limit: number = 10, offset: number = 0): Observable<{ count: number; data: Repo[] }> {
    let params = new HttpParams();
    params = params.append('limit', String(limit));
    params = params.append('offset', String(offset));
    return this.http
      .get<{ count: number; data: Repo[] }>('/repos', { params })
      .pipe(map(resp => ({ count: resp.count, data: resp.data.map(generateRepoModel) })));
  }

  findByID(id: number): void {
    this.loading = true;
    this.error = null;
    this.http
      .get<Repo>(`/repos/${id}`)
      .pipe(
        map(generateRepoModel),
        finalize(() => (this.loading = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.repoSubject.next(resp);
        },
        err => {
          this.error = err.message;
        }
      );
  }

  findHooks(): Observable<Hook[]> {
    return this.repo.pipe(
      switchMap(repo => this.http.get<any>(`/repos/${repo.id}/hooks`)),
      map(resp => (resp && resp.length ? resp.map(generateHook) : []))
    );
  }

  setActive(id: number, status: boolean): Observable<void> {
    return this.http.put<void>(`/repos/${id}/active`, { active: status });
  }
}
