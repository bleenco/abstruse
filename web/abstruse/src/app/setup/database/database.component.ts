import { Component, OnInit } from '@angular/core';
import { SetupService } from '../shared/setup.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConfigDB, generateConfigDB } from '../shared/config.model';
import { finalize } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.sass']
})
export class DatabaseComponent implements OnInit {
  dbForm!: FormGroup;
  tested: boolean = false;
  testDBConnectionLoading: boolean = false;
  saved: boolean = false;
  connTest: 'untested' | 'ok' | 'nok' = 'untested';
  drivers: { value: any; placeholder: string }[] = [
    { value: 'mysql', placeholder: 'MySQL' },
    { value: 'postgres', placeholder: 'PostgreSQL' },
    { value: 'mssql', placeholder: 'Microsoft SQL Server' }
  ];
  defaultHostname = '127.0.0.1';
  defaultPorts = {
    mysql: 3306,
    postgres: 5432,
    mssql: 1433
  };
  defaultUsername = 'root';
  defaultPassword = 'test';
  defaultDriver = 'mssql';

  constructor(private fb: FormBuilder, public setup: SetupService) {
    this.createForm();
  }

  ngOnInit(): void {
    this.setup.fetchConfig().subscribe(config => {
      this.setup.config = { ...config };
      this.resetValues();
    });
  }

  onSubmit(): void {
    if (!this.dbForm.valid) {
      return;
    }

    const config = this.generateModel();
    this.setup
      .saveDBConfig(config)
      .pipe(
        finalize(() => (this.connTest = 'untested')),
        untilDestroyed(this)
      )
      .subscribe(
        () => {
          this.setup.config = { ...this.setup.config, ...{ db: config } };
          this.saved = true;
          this.dbForm.markAsPristine();
          this.setup.wizard.steps[this.setup.wizard.step - 1].nextEnabled = true;
          setTimeout(() => (this.saved = false), 5000);
        },
        err => {
          this.resetValues();
          console.error(err);
        }
      );
  }

  testDBConnection(): void {
    this.connTest = 'untested';
    this.saved = false;
    this.setup.wizard.steps[this.setup.wizard.step - 1].nextEnabled = false;
    this.testDBConnectionLoading = true;
    this.setup
      .testDBConnection(this.generateModel())
      .pipe(
        finalize(() => (this.testDBConnectionLoading = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.connTest = resp ? 'ok' : 'nok';
        },
        err => {
          this.resetValues();
          console.error(err);
        }
      );
  }

  resetValues(): void {
    this.dbForm.patchValue({
      driver: this.setup.config.db.driver,
      host: this.setup.config.db.host,
      port: this.setup.config.db.port,
      name: this.setup.config.db.name,
      user: this.setup.config.db.user,
      password: this.setup.config.db.password,
      charset: this.setup.config.db.charset
    });
    this.connTest = 'untested';
    this.setup.wizard.steps[this.setup.wizard.step - 1].nextEnabled = false;
  }

  private generateModel(): ConfigDB {
    const data = {
      driver: this.dbForm.controls.driver.value,
      host: this.dbForm.controls.host.value,
      port: this.dbForm.controls.port.value,
      name: this.dbForm.controls.name.value,
      user: this.dbForm.controls.user.value,
      password: this.dbForm.controls.password.value,
      charset: this.dbForm.controls.charset.value
    };

    return generateConfigDB(data);
  }

  private createForm(): void {
    this.dbForm = this.fb.group({
      driver: [null, [Validators.required]],
      host: [null, [Validators.required]],
      port: [null, [Validators.required]],
      name: [null, [Validators.required]],
      user: [null, [Validators.required]],
      password: [null, [Validators.required]],
      charset: ['utf8', [Validators.required]]
    });
  }
}
