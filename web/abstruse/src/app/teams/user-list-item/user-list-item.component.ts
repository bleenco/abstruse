import { Component, Input, OnInit } from '@angular/core';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { User } from '../shared/user.model';
import { UserModalComponent } from '../user-modal/user-modal.component';

@Component({
  selector: 'app-user-list-item',
  templateUrl: './user-list-item.component.html',
  styleUrls: ['./user-list-item.component.sass']
})
export class UserListItemComponent implements OnInit {
  @Input() user!: User;

  constructor(public modal: ModalService) {}

  ngOnInit(): void {}

  openUserModal(): void {
    const modalRef = this.modal.open(UserModalComponent, { size: 'small' });
    modalRef.componentInstance.user = this.user;
    modalRef.result.then(
      ok => {
        if (ok) {
          console.log('ok');
        }
      },
      () => {}
    );
  }
}
