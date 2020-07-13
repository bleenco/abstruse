import { Injectable } from '@angular/core';
import { Provider, generateProvider } from './provider.class';
import { ProviderRepo, generateProviderRepo } from './provider-repo.class';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { ReposService } from '../../repos/shared/repos.service';

@Injectable({ providedIn: 'root' })
export class ProvidersService {
  constructor(private http: HttpClient, private repos: ReposService) {}

  find(): Observable<Provider[]> {
    return this.http.get<Provider[]>('/providers').pipe(map(data => data.map(generateProvider)));
  }

  findRepos(id: number, page: number = 1, size: number = 30): Observable<ProviderRepo[]> {
    return combineLatest([this.findProviderRepos(id, page, size), this.repos.find()]).pipe(
      map(resp => {
        return resp[0].map(repo => {
          if (resp[1].find(x => x.providerID === id && String(x.uid) === String(repo.id))) {
            repo.isImported = true;
          }
          return repo;
        });
      })
    );
  }

  private findProviderRepos(id: number, page: number, size: number): Observable<ProviderRepo[]> {
    let params = new HttpParams();
    params = params.append('page', String(page));
    params = params.append('size', String(size));
    return this.http
      .get<ProviderRepo[]>(`/providers/${id}`, { params })
      .pipe(map(data => data.map(generateProviderRepo)));
  }

  create(data: any): Observable<Provider> {
    return this.http.post<any>('/providers', data).pipe(map(data => new Provider(data)));
  }
}
