import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { generateTeam, Team } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  constructor(private http: HttpClient) {}

  find(id: number): Observable<Team> {
    return this.http.get(`/teams/${id}`).pipe(map(generateTeam));
  }

  list(): Observable<Team[]> {
    return this.http.get('/teams').pipe(map((resp: any) => (resp && resp.length ? resp.map(generateTeam) : [])));
  }

  create(data: any): Observable<Team> {
    return this.http.post<Team>('/teams', data).pipe(map(generateTeam));
  }

  update(data: any): Observable<Team> {
    return this.http.put<Team>('/teams', data).pipe(map(generateTeam));
  }
}
