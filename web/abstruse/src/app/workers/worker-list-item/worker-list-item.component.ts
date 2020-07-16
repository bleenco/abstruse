import { Component, OnInit, Input } from '@angular/core';
import { Worker } from '../shared/worker.model';

@Component({
  selector: 'app-worker-list-item',
  templateUrl: './worker-list-item.component.html',
  styleUrls: ['./worker-list-item.component.sass']
})
export class WorkerListItemComponent implements OnInit {
  @Input() worker!: Worker;

  constructor() {}

  ngOnInit(): void {}
}
