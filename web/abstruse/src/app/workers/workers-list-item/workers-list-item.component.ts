import { Component, OnInit, Input } from '@angular/core';
import { Worker } from '../shared/worker.class';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { WorkersModalComponent } from '../workers-modal/workers-modal.component';

@Component({
  selector: 'app-workers-list-item',
  templateUrl: './workers-list-item.component.html',
  styleUrls: ['./workers-list-item.component.sass']
})
export class WorkersListItemComponent implements OnInit {
  @Input() worker: Worker;

  constructor(
    public modalService: ModalService
  ) { }

  ngOnInit(): void {
  }

  openWorkerModal(): void {
    const modalRef = this.modalService.open(WorkersModalComponent, { size: 'large' });
    modalRef.componentInstance.worker = this.worker;
    modalRef.result
      .then(result => console.log(result), reason => console.log(reason));
  }
}
