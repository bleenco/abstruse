import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SetupService } from '../shared/setup.service';

@UntilDestroy()
@Component({
  selector: 'app-etcd',
  templateUrl: './etcd.component.html',
  styleUrls: ['./etcd.component.sass']
})
export class EtcdComponent implements OnInit {
  form!: FormGroup;
  saved: boolean = false;

  constructor(private fb: FormBuilder, private setup: SetupService) {
    this.createForm();
  }

  ngOnInit(): void {
    this.setup
      .fetchConfig()
      .pipe(untilDestroyed(this))
      .subscribe(config => {
        this.setup.config = { ...config };
        this.resetValues();
      });
  }

  onSubmit(): void {}

  resetValues(): void {
    this.form.patchValue({
      name: this.setup.config.etcd.name,
      host: this.setup.config.etcd.host,
      clientPort: this.setup.config.etcd.clientPort,
      peerPort: this.setup.config.etcd.peerPort,
      dataDir: this.setup.config.etcd.dataDir,
      username: this.setup.config.etcd.username,
      password: this.setup.config.etcd.password,
      rootPassword: this.setup.config.etcd.rootPassword
    });
    this.form.markAsPristine();
    this.saved = false;
  }

  private createForm(): void {
    this.form = this.fb.group({
      name: [null, [Validators.required]],
      host: [null, [Validators.required]],
      clientPort: [null, [Validators.required]],
      peerPort: [null, [Validators.required]],
      dataDir: [null, [Validators.required]],
      username: [null, [Validators.required]],
      password: [null, [Validators.required]],
      rootPassword: [null, [Validators.required]]
    });
  }
}
