import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SetupService } from '../shared/setup.service';
import { getAvatars } from '../../core/shared/shared-functions';
import { User } from '../../core/shared/user.model';

@Component({
  selector: 'app-setup-user',
  templateUrl: './setup-user.component.html',
  styleUrls: ['./setup-user.component.sass']
})
export class SetupUserComponent implements OnInit {
  @ViewChild('adminForm') adminForm: NgForm;

  avatars: string[];
  user: User;
  creatingUser: boolean;

  constructor(public setup: SetupService) { }

  ngOnInit() {
    this.avatars = getAvatars();
    this.user = new User('', '', '', '', this.avatars[1], true);
  }

  resetForm(): void {
    this.adminForm.resetForm();
    this.user = new User('', '', '', '', this.avatars[1], true);
  }

  createUser(): void {
    this.creatingUser = true;
    this.setup.createUser(this.user).subscribe(resp => {
      this.resetForm();
      this.creatingUser = false;
      if (resp && resp.data && resp.data === 'ok') {
        this.setup.next();
      }
    });
  }
}
