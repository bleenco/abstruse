import { Component, OnInit, Input } from '@angular/core';
import { Worker } from '../shared/worker.model';

@Component({
  selector: 'app-worker-table-item',
  templateUrl: './worker-table-item.component.html',
  styleUrls: ['./worker-table-item.component.sass']
})
export class WorkerTableItemComponent implements OnInit {
  @Input() worker!: Worker;

  constructor() {}

  ngOnInit(): void {}
}
