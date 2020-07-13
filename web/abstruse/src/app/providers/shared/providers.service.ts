import { Injectable } from '@angular/core';
import { Provider, generateProvider } from './provider.class';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ReposService } from '../../repos/shared/repos.service';

@Injectable({ providedIn: 'root' })
export class ProvidersService {
  constructor(private http: HttpClient, private repos: ReposService) {}

  find(): Observable<Provider[]> {
    return this.http.get<Provider[]>('/providers').pipe(map(data => data.map(generateProvider)));
  }

  create(data: any): Observable<Provider> {
    return this.http.post<any>('/providers', data).pipe(map(data => new Provider(data)));
  }
}
