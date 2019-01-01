import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { getAPIURL, handleError } from 'src/app/core/shared/shared-functions';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PersonalService {

  constructor(public http: HttpClient) { }

  fetchPersonalInfo(): Observable<JSONResponse> {
    const url = getAPIURL() + `/users/personal`;
    return this.http.get<JSONResponse>(url)
      .pipe(
        catchError(handleError<JSONResponse>('/users/personal'))
      );
  }
}
