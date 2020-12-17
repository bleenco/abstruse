import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { generateJobModel, Job } from 'src/app/builds/shared/build.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  stats(): Observable<any> {
    return this.http.get<any>('/stats');
  }

  jobs(from: Date, to: Date): Observable<Job[]> {
    let params = new HttpParams();
    params = params.append('from', String(from));
    params = params.append('to', String(to));
    return this.http
      .get<Job[]>('/stats/jobs', { params })
      .pipe(map(data => (data && data.length ? data.map(generateJobModel) : [])));
  }
}
