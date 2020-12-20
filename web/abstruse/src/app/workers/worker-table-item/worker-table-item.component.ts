import { Component, OnInit, Input } from '@angular/core';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { Worker } from '../shared/worker.model';
import { WorkerModalComponent } from '../worker-modal/worker-modal.component';

@Component({
  selector: 'app-worker-table-item',
  templateUrl: './worker-table-item.component.html',
  styleUrls: ['./worker-table-item.component.sass']
})
export class WorkerTableItemComponent implements OnInit {
  @Input() worker!: Worker;

  constructor(public modalService: ModalService) {}

  ngOnInit(): void {}

  openWorkerModal(): void {
    const modalRef = this.modalService.open(WorkerModalComponent, { size: 'large' });
    modalRef.componentInstance.worker = this.worker;
    modalRef.result.then(
      () => {},
      () => {}
    );
  }
}
