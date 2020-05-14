import { Component, OnInit, Input } from '@angular/core';
import { Worker } from '../shared/worker.class';

@Component({
  selector: 'app-workers-list-item',
  templateUrl: './workers-list-item.component.html',
  styleUrls: ['./workers-list-item.component.sass']
})
export class WorkersListItemComponent implements OnInit {
  @Input() worker: Worker;

  constructor() { }

  ngOnInit(): void {
  }

}
