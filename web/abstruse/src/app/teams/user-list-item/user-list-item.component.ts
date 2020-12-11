import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/auth/shared/auth.service';
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
  @Output() updated = new EventEmitter<void>();

  constructor(public modal: ModalService, public auth: AuthService) {}

  ngOnInit(): void {}

  openUserModal(): void {
    const modalRef = this.modal.open(UserModalComponent, { size: 'medium' });
    modalRef.componentInstance.user = this.user;
    modalRef.result.then(
      ok => {
        if (ok) {
          this.updated.next();
        }
      },
      () => {}
    );
  }
}
