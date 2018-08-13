import { Component, OnInit } from '@angular/core';
import { SetupService } from '../shared/setup.service';
import { getAvatars } from '../../core/shared/shared-functions';
import { User } from '../../core/shared/user.model';

@Component({
  selector: 'app-setup-user',
  templateUrl: './setup-user.component.html',
  styleUrls: ['./setup-user.component.sass']
})
export class SetupUserComponent implements OnInit {
  avatars: string[];
  user: User;

  constructor(public setup: SetupService) { }

  ngOnInit() {
    this.avatars = getAvatars();
    this.user = new User('', '', '', '', this.avatars[0], true);
  }

}
