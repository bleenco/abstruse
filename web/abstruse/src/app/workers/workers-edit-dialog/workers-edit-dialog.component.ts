import { Component, OnInit, Input } from '@angular/core';
import { Worker } from '../shared/worker.class';
import { WorkersService } from '../shared/workers.service';

@Component({
  selector: 'app-workers-edit-dialog',
  templateUrl: './workers-edit-dialog.component.html',
  styleUrls: ['./workers-edit-dialog.component.sass']
})
export class WorkersEditDialogComponent implements OnInit {
  @Input() worker: Worker;

  priorityValues: any[];

  constructor(public workersService: WorkersService) { }

  ngOnInit() {
    this.priorityValues = Array.from(new Array(10), (x, i) => i).map(i => {
      return { value: i, placeholder: String(i) };
    }).reverse();
  }
}
