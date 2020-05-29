import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { getAPIURL } from 'src/app/core/shared/shared-functions';
import { Provider } from './provider.class';
import { map, filter } from 'rxjs/operators';

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
}
