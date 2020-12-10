import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { generateTeam, Team } from './team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  constructor(private http: HttpClient) {}

  list(): Observable<Team[]> {
    return this.http.get('/teams').pipe(map((resp: any) => (resp && resp.length ? resp.map(generateTeam) : [])));
  }
}
