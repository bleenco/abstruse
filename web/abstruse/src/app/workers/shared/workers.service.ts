import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { getAPIURL } from 'src/app/core/shared/shared-functions';
import { Worker } from './worker.class';

@Injectable({
  providedIn: 'root'
})
export class WorkersService {
  worker: Worker;
  editDialogOpened: boolean;

  constructor(public http: HttpClient) { }

  fetchWorkers(): Observable<JSONResponse> {
    const url = getAPIURL() + '/workers';
    return this.http.get<JSONResponse>(url);
  }

  openEditDialog(worker: Worker): void {
    this.worker = worker;
    this.editDialogOpened = true;
  }

  closeEditDialog(): void {
    this.editDialogOpened = false;
    this.worker = null;
  }
}
