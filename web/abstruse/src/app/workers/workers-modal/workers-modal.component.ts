import { Component, OnInit, Input } from '@angular/core';
import { Worker } from '../shared/worker.class';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';

@Component({
  selector: 'app-workers-modal',
  templateUrl: './workers-modal.component.html',
  styleUrls: ['./workers-modal.component.sass']
})
export class WorkersModalComponent implements OnInit {
  @Input() worker: Worker;

  constructor(
    public activeModal: ActiveModal
  ) { }

  ngOnInit(): void {
  }

}
