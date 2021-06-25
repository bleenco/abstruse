import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, finalize } from 'rxjs/operators';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { SettingsSshModalComponent } from '../settings-ssh-modal/settings-ssh-modal.component';
import { Repo } from '../shared/repo.model';
import { ReposService } from '../shared/repos.service';

@UntilDestroy()
@Component({
  selector: 'app-settings-ssh',
  templateUrl: './settings-ssh.component.html',
  styleUrls: ['./settings-ssh.component.sass']
})
export class SettingsSshComponent implements OnInit {
  @Input() repo!: Repo;
  form: { useSSH: boolean } = { useSSH: false };
  saving = false;
  error: string | null = null;

  constructor(private reposService: ReposService, public modal: ModalService) {}

  ngOnInit(): void {
    this.reposService.repoSubject
      .pipe(
        filter(r => !!r),
        untilDestroyed(this)
      )
      .subscribe(repo => {
        this.repo = repo as Repo;
        this.form.useSSH = !!this.repo.useSSH;
      });
  }

  updateMisc(): void {
    this.error = null;
    if (this.form.useSSH === this.repo.useSSH) {
      return;
    }

    this.saving = true;
    this.reposService
      .updateMisc(this.form)
      .pipe(
        finalize(() => (this.saving = false)),
        untilDestroyed(this)
      )
      .subscribe(
        () => {
          this.repo.useSSH = this.form.useSSH;
        },
        err => (this.error = err.message)
      );
  }

  openSSHPrivateKeyModal(): void {
    const modalRef = this.modal.open(SettingsSshModalComponent, { size: 'medium' });
    modalRef.componentInstance.repo = this.repo;
    modalRef.result.then(
      () => {},
      () => {}
    );
  }
}
