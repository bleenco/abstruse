import { Component, OnInit } from '@angular/core';
import { Worker } from '../shared/worker.class';

@Component({
  selector: 'app-workers-list',
  templateUrl: './workers-list.component.html',
  styleUrls: ['./workers-list.component.sass']
})
export class WorkersListComponent implements OnInit {
  workers: Worker[] = [];
  fetchingWorkers: boolean;

  constructor() { }

  ngOnInit(): void { }
}
