import { Injectable } from '@angular/core';
import { Provider } from './provider.class';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {
  providers: Provider[] = [];
  fetchingProviders: boolean = false;

  constructor(private http: HttpClient) {}

  list(): void {
    this.fetchingProviders = true;
  }

  create(data: any): Observable<Provider> {
    return this.http.post<any>('/providers', data).pipe(map(data => new Provider(data)));
  }
}
