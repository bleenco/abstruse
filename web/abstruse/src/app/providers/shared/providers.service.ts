import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { getAPIURL } from 'src/app/core/shared/shared-functions';
import { Provider } from './provider.class';
import { map, filter } from 'rxjs/operators';
import { ProviderRepo, ProviderRepoPermission } from './repo.class';

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {

  constructor(
    public http: HttpClient
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

  listRepos(providerId: number, page = 1, size = 30): Observable<ProviderRepo[]> {
    const url = `${getAPIURL()}/providers/${providerId}/repos/${page}/${size}`;
    return this.http.get<JSONResponse>(url)
      .pipe(
        filter(resp => resp.data && resp.data.length),
        map(resp => resp.data.map((r: any) => {
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
            r.private,
            r.clone,
            r.clone_ssh,
            r.link,
            new Date(r.created),
            new Date(r.updated)
          );
        }))
      );
  }
}
