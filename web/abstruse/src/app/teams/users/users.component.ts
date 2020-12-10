import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { User } from '../shared/user.model';
import { UsersService } from '../shared/users.service';
import { UserModalComponent } from '../user-modal/user-modal.component';

@UntilDestroy()
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.sass']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  fetchingUsers = false;
  error: string | null = null;

  constructor(private usersService: UsersService, public modal: ModalService) {}

  ngOnInit(): void {
    this.list();
  }

  openUserModal(): void {
    const modalRef = this.modal.open(UserModalComponent, { size: 'small' });
    modalRef.result.then(
      ok => {
        if (ok) {
          this.list();
        }
      },
      () => {}
    );
  }

  list(): void {
    this.fetchingUsers = true;
    this.usersService
      .list()
      .pipe(
        finalize(() => (this.fetchingUsers = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.users = resp;
        },
        err => {
          this.error = err.message;
        }
      );
  }
}
