import { Injectable } from '@angular/core';
import { Provider, generateProvider } from './provider.class';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProvidersService {
  constructor(private http: HttpClient) {}

  find(): Observable<Provider[]> {
    return this.http.get<Provider[]>('/providers').pipe(map(data => data.map(generateProvider)));
  }

  sync(id: number): Observable<void> {
    return this.http.put<void>('/providers/sync', { id });
  }

  create(data: any): Observable<Provider> {
    return this.http.post<any>('/providers', data).pipe(map(data => new Provider(data)));
  }

  update(data: any): Observable<Provider> {
    return this.http.put<any>('/providers', data).pipe(map(data => new Provider(data)));
  }
}
