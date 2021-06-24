import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { SettingsMountModalComponent } from '../settings-mount-modal/settings-mount-modal.component';
import { ReposService } from '../shared/repos.service';
import { MountVariable } from './mount-variable.model';

@UntilDestroy()
@Component({
  selector: 'app-settings-mount',
  templateUrl: './settings-mount.component.html',
  styleUrls: ['./settings-mount.component.sass']
})
export class SettingsMountComponent implements OnInit {
  id!: number;
  mounts: MountVariable[] = [];
  fetching = false;
  fetchingError = null;

  constructor(
    private route: ActivatedRoute,
    private reposService: ReposService,
    public modal: ModalService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.findMounts();
  }

  openAddMountVariableModal(): void {
    const modalRef = this.modal.open(SettingsMountModalComponent, { size: 'medium' });
    modalRef.componentInstance.mount = new MountVariable();
    modalRef.result.then(
      (ok: boolean) => {
        if (ok) {
          this.findMounts();
        }
      },
      () => {}
    );
  }

  openEditMountVariableModal(index: number): void {
    const modalRef = this.modal.open(SettingsMountModalComponent, { size: 'medium' });
    modalRef.componentInstance.mount = this.mounts[index];
    modalRef.result.then(
      (ok: boolean) => {
        if (ok) {
          this.findMounts();
        }
      },
      () => {}
    );
  }

  findMounts(): void {
    this.fetching = true;
    this.reposService
      .findMounts()
      .pipe(
        finalize(() => (this.fetching = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.mounts = resp;
        },
        err => {
          this.fetchingError = err.message;
        }
      );
  }
}
