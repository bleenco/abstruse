import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { getAPIURL } from 'src/app/core/shared/shared-functions';

@Injectable({
  providedIn: 'root'
})
export class WorkersService {
  editDialogOpened: boolean;

  constructor(public http: HttpClient) { }

  fetchWorkers(): Observable<JSONResponse> {
    const url = getAPIURL() + '/workers';
    return this.http.get<JSONResponse>(url);
  }

  openEditDialog(): void {
    this.editDialogOpened = true;
  }

  closeEditDialog(): void {
    this.editDialogOpened = false;
  }
}
