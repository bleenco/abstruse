import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { Version, generateVersion } from './version.class';

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  version!: Version;
  fetchingVersion: boolean = false;

  constructor(public http: HttpClient) {}

  fetchVersion(): void {
    this.fetchingVersion = true;
    this.http
      .get<Version>('/system/version')
      .pipe(finalize(() => (this.fetchingVersion = false)))
      .subscribe(version => (this.version = generateVersion(version)));
  }
}
