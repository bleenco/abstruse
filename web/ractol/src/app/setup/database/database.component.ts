import { Component, OnInit } from '@angular/core';
import { SetupService } from '../shared/setup.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConfigDB, generateConfigDB } from '../shared/config.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.sass']
})
export class DatabaseComponent implements OnInit {
  dbForm!: FormGroup;
  submitted: boolean = false;
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
  testDBConnectionLoading: boolean = false;

  constructor(private fb: FormBuilder, private setup: SetupService) {
    this.createForm();
  }

  ngOnInit(): void {
    this.setup.fetchConfig().subscribe(config => {
      this.setup.config = { ...config };
      this.resetValues();
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.dbForm.valid) {
      return;
    }
  }

  testDBConnection(): void {
    this.connTest = 'untested';
    this.testDBConnectionLoading = true;
    this.setup
      .testDBConnection(this.generateModel())
      .pipe(finalize(() => (this.testDBConnectionLoading = false)))
      .subscribe(
        resp => (this.connTest = resp ? 'ok' : 'nok'),
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
