import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Setup } from './setup.model';
import { SetupWizard, defaultWizardConfig } from './wizard.model';
import { Config, generateConfig, ConfigDB, ConfigEtcd, ConfigAuth } from './config.model';
import { map, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Admin } from './admin.model';

@Injectable({ providedIn: 'root' })
export class SetupService {
  wizard: SetupWizard = defaultWizardConfig();
  config!: Config;
  fetchingConfig: boolean = false;
  savingConfig: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  next(): void {
    if (this.wizard.step < this.wizard.steps.length) {
      this.wizard.step++;
      this.navigate();
    }
  }

  back(): void {
    if (this.wizard.step >= 1) {
      this.wizard.step--;
      this.navigate();
    }
  }

  navigate(): void {
    const step = this.wizard.steps.find(s => s.step === this.wizard.step);
    this.router.navigate([`/setup/${step?.route}`]);
  }

  fetchConfig(): Observable<Config> {
    this.fetchingConfig = true;
    return this.http.get<Config>('/setup/config').pipe(
      map(data => generateConfig(data)),
      finalize(() => (this.fetchingConfig = false))
    );
  }

  saveConfig(config: Config): Observable<void> {
    this.savingConfig = true;
    return this.http.put<void>('/setup/config', config).pipe(finalize(() => (this.savingConfig = false)));
  }

  saveAuthConfig(config: ConfigAuth): Observable<void> {
    this.savingConfig = true;
    return this.http.put<void>('/setup/auth', config).pipe(finalize(() => (this.savingConfig = false)));
  }

  saveDBConfig(config: ConfigDB): Observable<void> {
    this.savingConfig = true;
    return this.http.put<void>('/setup/db', config).pipe(finalize(() => (this.savingConfig = false)));
  }

  saveEtcdConfig(config: ConfigEtcd): Observable<void> {
    this.savingConfig = true;
    return this.http.put<void>('/setup/etcd', config).pipe(finalize(() => (this.savingConfig = false)));
  }

  saveUser(form: Admin): Observable<void> {
    return this.http.post<void>('/setup/user', form);
  }

  testDBConnection(config: ConfigDB): Observable<boolean> {
    return this.http.post<boolean>('/setup/db/test', config);
  }

  ready(): Promise<boolean> {
    return new Promise(resolve => {
      this.http.get<Setup>('/setup/ready').subscribe(
        resp => {
          if (resp.database && resp.user) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        () => {
          resolve(false);
        }
      );
    });
  }
}
