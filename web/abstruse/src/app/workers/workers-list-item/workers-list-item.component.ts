import { Component, OnInit, Input } from '@angular/core';
import { Worker } from '../shared/worker.class';
import { WorkersService } from '../shared/workers.service';

@Component({
  selector: 'app-workers-list-item',
  templateUrl: './workers-list-item.component.html',
  styleUrls: ['./workers-list-item.component.sass']
})
export class WorkersListItemComponent implements OnInit {
  @Input() worker: Worker;

  constructor(public workersService: WorkersService) { }

  ngOnInit() { }

  edit(): void {
    this.workersService.openEditDialog(this.worker);
  }
}
