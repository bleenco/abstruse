import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Repo, generateRepoModel } from './repo.model';
import { map, finalize, switchMap, share, filter } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Hook, generateHook, HookData } from './hook.model';
import { EnvVariable, generateEnvVariable } from '../settings-envs/env-variable.model';

interface ConfigResp {
  content: string;
}

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class ReposService {
  repoSubject: BehaviorSubject<Repo | null> = new BehaviorSubject<Repo | null>(null);
  repo = this.repoSubject.asObservable().pipe(
    filter(repo => !!repo),
    share()
  );
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  find(
    limit: number = 10,
    offset: number = 0,
    keyword: string = ''
  ): Observable<{ count: number; data: Repo[] }> {
    let params = new HttpParams();
    params = params.append('limit', String(limit));
    params = params.append('offset', String(offset));
    params = params.append('keyword', keyword);
    return this.http
      .get<{ count: number; data: Repo[] }>('/repos', { params })
      .pipe(map(resp => ({ count: resp.count, data: resp.data.map(generateRepoModel) })));
  }

  findByID(id: number): void {
    this.repoSubject.next(null);
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
    return this.repoSubject.pipe(
      filter(repo => !!repo),
      switchMap(repo => this.http.get<any>(`/repos/${repo?.id}/hooks`)),
      map(resp => (resp && resp.length ? resp.map(generateHook) : []))
    );
  }

  saveHooks(data: HookData): Observable<void> {
    return this.repoSubject.pipe(
      filter(repo => !!repo),
      switchMap(repo => this.http.put<void>(`/repos/${repo?.id}/hooks`, data))
    );
  }

  setActive(id: number, status: boolean): Observable<void> {
    return this.http.put<void>(`/repos/${id}/active`, { active: status });
  }

  findConfig(id: number): Observable<ConfigResp> {
    return this.http.get<ConfigResp>(`/repos/${id}/config`);
  }

  findEnvs(): Observable<EnvVariable[]> {
    return this.repoSubject.pipe(
      filter(repo => !!repo),
      switchMap(repo => this.http.get<any>(`/repos/${repo?.id}/envs`)),
      map(resp => (resp && resp.length ? resp.map(generateEnvVariable) : []))
    );
  }

  createEnv(env: EnvVariable): Observable<void> {
    return this.repoSubject.pipe(
      filter(repo => !!repo),
      switchMap(repo => this.http.put<void>(`/repos/${repo?.id}/envs`, env))
    );
  }

  updateEnv(env: EnvVariable): Observable<void> {
    return this.repoSubject.pipe(
      filter(repo => !!repo),
      switchMap(repo => this.http.post<void>(`/repos/${repo?.id}/envs`, env))
    );
  }

  deleteEnv(env: EnvVariable): Observable<void> {
    return this.repoSubject.pipe(
      filter(repo => !!repo),
      switchMap(repo => this.http.delete<void>(`/repos/${repo?.id}/envs/${env.id}`))
    );
  }
}
