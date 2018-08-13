import { Component, OnInit } from '@angular/core';
import { SetupService } from '../shared/setup.service';
import { User } from '../../core/shared/user.model';

@Component({
  selector: 'app-setup-user-dialog',
  templateUrl: './setup-user-dialog.component.html',
  styleUrls: ['./setup-user-dialog.component.sass']
})
export class SetupUserDialogComponent implements OnInit {

  constructor(public setup: SetupService) { }

  ngOnInit() {
    this.setup.dialogUser = new User('', '', '', '', this.setup.avatars[0], false);
  }

}
