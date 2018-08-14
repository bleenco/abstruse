import { Component, OnInit } from '@angular/core';
import { SetupService } from '../shared/setup.service';
import { User } from '../../core/shared/user.model';

@Component({
  selector: 'app-setup-user-dialog',
  templateUrl: './setup-user-dialog.component.html',
  styleUrls: ['./setup-user-dialog.component.sass']
})
export class SetupUserDialogComponent implements OnInit {
  saving: boolean;
  user: User;

  constructor(public setup: SetupService) { }

  ngOnInit() {
    this.saving = false;
    this.user = new User('', '', '', '', this.setup.avatars[1], false);
  }

  createUser(): void {
    this.saving = true;
    this.setup.createUser(this.user).subscribe(resp => {
      if (resp && resp.data === 'ok') {
        this.setup.fetchUsers();
      }
      this.saving = false;
      this.setup.userDialogOpened = false;
    });
  }

}
