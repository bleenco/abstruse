import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest } from 'rxjs';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { getAPIURL } from 'src/app/core/shared/shared-functions';
import { Provider } from './provider.class';
import { map, filter } from 'rxjs/operators';
import { ProviderRepo, ProviderRepoPermission } from './repo.class';
import { ReposService } from 'src/app/repos/shared/repos.service';
import { User } from 'src/app/teams/shared/user.model';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { ProvidersModalComponent } from '../providers-modal/providers-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {
  providers: Provider[] = [];
  fetchingProviders: boolean;

  constructor(public http: HttpClient, public reposService: ReposService, public modalService: ModalService) {
    this.providers = [];
  }

  openProviderModal(provider?: Provider): void {
    const modalRef = this.modalService.open(ProvidersModalComponent, { size: 'medium' });
    if (provider) {
      modalRef.componentInstance.provider = new Provider(provider.id, provider.name, provider.url, provider.secret);
    } else {
      modalRef.componentInstance.provider = new Provider();
    }
    modalRef.result.then(ok => {
      if (ok) {
        this.list();
      }
    });
  }

  list(): void {
    this.fetchingProviders = true;
    const url = `${getAPIURL()}/providers`;
    this.http
      .get<JSONResponse>(url)
      .pipe(
        map(resp => (resp.data && resp.data.length ? resp.data : [])),
        map(data =>
          data.map((p: any) => {
            return new Provider(
              p.id,
              p.name,
              p.url,
              p.secret,
              p.access_token,
              p.user_id,
              new Date(p.created_at),
              new Date(p.updated_at)
            );
          })
        )
      )
      .subscribe(
        providers => {
          this.providers = providers;
        },
        err => {
          console.error(err);
          this.fetchingProviders = false;
          this.providers = [];
        },
        () => {
          this.fetchingProviders = false;
        }
      );
  }

  find(providerID: number): Observable<Provider> {
    const url = `${getAPIURL()}/providers/${providerID}`;
    return this.http.get<JSONResponse>(url).pipe(
      map(resp => {
        const u = resp.data.user;
        return new Provider(
          resp.data.id,
          resp.data.name,
          resp.data.url,
          resp.data.secret,
          resp.data.access_token,
          resp.data.user_id,
          new Date(resp.data.created_at),
          new Date(resp.data.updated_at),
          new User(
            u.id,
            u.email,
            u.fullname,
            u.avatar,
            Boolean(u.admin),
            new Date(u.created_at),
            new Date(u.updated_at)
          )
        );
      })
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
    return combineLatest([this.listProviderRepos(providerId, page, size), this.reposService.list()]).pipe(
      map(resp =>
        resp[0].map(repo => {
          if (resp[1].find(x => x.providerId === providerId && String(x.uid) === String(repo.id))) {
            repo.isImported = true;
          }
          return repo;
        })
      )
    );
  }

  listProviderRepos(providerId: number, page = 1, size = 30): Observable<ProviderRepo[]> {
    const url = `${getAPIURL()}/providers/${providerId}/repos/${page}/${size}`;
    return this.http.get<JSONResponse>(url).pipe(
      map(resp => (resp.data && resp.data.length ? resp.data : [])),
      map(data =>
        data.map((r: any) => {
          return new ProviderRepo(
            r.id,
            r.namespace,
            r.name,
            new ProviderRepoPermission(r.permission.pull, r.permission.push, r.permission.admin),
            r.branch,
            Boolean(r.private),
            r.clone,
            r.clone_ssh,
            r.link,
            new Date(r.created),
            new Date(r.updated)
          );
        })
      )
    );
  }

  reposFind(providerId: number, keyword: string): Observable<ProviderRepo> {
    const url = `${getAPIURL()}/providers/${providerId}/repos`;
    return this.http
      .post<JSONResponse>(url, { keyword })
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
