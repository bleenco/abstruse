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
  deleteConfirmDialogOpened: boolean;

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

  openDeleteConfirmDialog(): void {
    if (!this.worker) {
      return;
    }

    this.editDialogOpened = false;
    this.deleteConfirmDialogOpened = true;
  }

  deleteConfirmed(): void {
    if (this.worker && this.worker.id) {
      console.log('DELETE!');
    }
    this.deleteConfirmDialogOpened = false;
    this.worker = null;
  }

  deleteCancelled(): void {
    this.deleteConfirmDialogOpened = false;
    this.editDialogOpened = true;
  }
}
