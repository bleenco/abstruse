import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { Repo } from '../shared/repo.model';
import { ReposService } from '../shared/repos.service';

@UntilDestroy()
@Component({
  selector: 'app-settings-ssh-modal',
  templateUrl: './settings-ssh-modal.component.html',
  styleUrls: ['./settings-ssh-modal.component.sass']
})
export class SettingsSshModalComponent implements OnInit {
  @Input() repo!: Repo;

  sshPrivateKey = '';
  saving = false;
  error: string | null = null;

  get valid(): boolean {
    return (
      this.sshPrivateKey !== '' &&
      this.sshPrivateKey.startsWith('-----BEGIN OPENSSH PRIVATE KEY-----') &&
      this.sshPrivateKey.endsWith('-----END OPENSSH PRIVATE KEY-----') &&
      this.sshPrivateKey.length > 100
    );
  }

  constructor(private reposService: ReposService, public activeModal: ActiveModal) {}

  ngOnInit(): void {}

  onPaste(e: ClipboardEvent): void {
    const text = e.clipboardData?.getData('text') || '';
    setTimeout(() => (this.sshPrivateKey = text.replace(/^\n|\n$/g, '')));
  }

  updateSSHPrivateKey(): void {
    if (!this.valid) {
      return;
    }

    this.saving = true;
    this.error = null;
    this.reposService
      .updateSSHPrivateKey(this.sshPrivateKey)
      .pipe(
        finalize(() => (this.saving = false)),
        untilDestroyed(this)
      )
      .subscribe(
        () => this.activeModal.close(true),
        err => (this.error = err.message)
      );
  }
}
