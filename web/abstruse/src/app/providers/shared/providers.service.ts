import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest } from 'rxjs';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { getAPIURL } from 'src/app/core/shared/shared-functions';
import { Provider } from './provider.class';
import { map, filter } from 'rxjs/operators';
import { ProviderRepo, ProviderRepoPermission } from './repo.class';
import { ReposService } from 'src/app/repos/shared/repos.service';

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {

  constructor(
    private http: HttpClient,
    private reposService: ReposService
  ) { }

  list(): Observable<Provider[]> {
    const url = `${getAPIURL()}/providers`;
    return this.http.get<JSONResponse>(url)
      .pipe(
        filter(resp => resp.data && resp.data.length),
        map(resp => resp.data.map((p: any) => {
          return new Provider(
            p.id,
            p.name,
            p.url,
            p.access_token,
            p.user_id,
            new Date(p.created_at),
            new Date(p.updated_at)
          );
        }))
      );
  }

  create(provider: Provider): Observable<JSONResponse> {
    const url = `${getAPIURL()}/providers`;
    return this.http.put<JSONResponse>(url, provider);
  }

  update(provider: Provider): Observable<JSONResponse> {
    const url = `${getAPIURL()}/providers`;
    return this.http.post<JSONResponse>(url, provider);
  }

  import(providerId: number, repo: ProviderRepo): Observable<JSONResponse> {
    const url = `${getAPIURL()}/providers/${providerId}/repos/import`;
    return this.http.put<JSONResponse>(url, repo);
  }

  listRepos(providerId: number, page = 1, size = 30): Observable<ProviderRepo[]> {
    return combineLatest([this.listProviderRepos(providerId, page, size), this.reposService.list()])
      .pipe(
        map(resp => resp[0].map(repo => {
          if (resp[1].find(x => x.providerId === providerId && String(x.uid) === String(repo.id))) {
            repo.isImported = true;
          }
          return repo;
        }))
      );
  }

  listProviderRepos(providerId: number, page = 1, size = 30): Observable<ProviderRepo[]> {
    const url = `${getAPIURL()}/providers/${providerId}/repos/${page}/${size}`;
    return this.http.get<JSONResponse>(url)
      .pipe(
        map(resp => resp.data && resp.data.length ? resp.data : []),
        map(data => data.map((r: any) => {
          return new ProviderRepo(
            r.id,
            r.namespace,
            r.name,
            new ProviderRepoPermission(
              r.permission.pull,
              r.permission.push,
              r.permission.admin
            ),
            r.branch,
            Boolean(r.private),
            r.clone,
            r.clone_ssh,
            r.link,
            new Date(r.created),
            new Date(r.updated)
          );
        }))
      );
  }

  reposFind(providerId: number, keyword: string): Observable<ProviderRepo> {
    const url = `${getAPIURL()}/providers/${providerId}/repos`;
    return this.http.post<JSONResponse>(url, { keyword })
      .pipe(
        filter(resp => resp && resp.data),
        map(resp => {
          return new ProviderRepo(
            resp.data.id,
            resp.data.namespace,
            resp.data.name,
            new ProviderRepoPermission(
              resp.data.permission.pull,
              resp.data.permission.push,
              resp.data.permission.admin
            ),
            resp.data.branch,
            resp.data.private,
            resp.data.clone,
            resp.data.clone_ssh,
            resp.data.link,
            new Date(resp.data.created),
            new Date(resp.data.updated)
          );
        })
      );
  }
}
