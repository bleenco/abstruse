import { Component, OnInit, Input } from '@angular/core';
import { Repo } from '../shared/repo.model';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { ReposSettingsModalComponent } from '../repos-settings-modal/repos-settings-modal.component';

@Component({
  selector: 'app-repos-list-item',
  templateUrl: './repos-list-item.component.html',
  styleUrls: ['./repos-list-item.component.sass']
})
export class ReposListItemComponent implements OnInit {
  @Input() repo: Repo;

  constructor(private modalService: ModalService) { }

  ngOnInit(): void { }

  openSettingsModal(): void {
    const modalRef = this.modalService.open(ReposSettingsModalComponent, { size: 'medium' });
    modalRef.componentInstance.repo = Object.create(this.repo);
    modalRef.result
      .then(result => console.log(result), reason => console.log(reason));
  }
}
