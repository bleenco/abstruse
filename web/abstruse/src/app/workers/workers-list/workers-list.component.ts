import { Component, OnInit } from '@angular/core';
import { Worker } from '../shared/worker.class';
import { WorkersService } from '../shared/workers.service';
import { DataService } from '../../shared/providers/data.service';
import { JSONResponse } from 'src/app/core/shared/shared.model';

@Component({
  selector: 'app-workers-list',
  templateUrl: './workers-list.component.html',
  styleUrls: ['./workers-list.component.sass']
})
export class WorkersListComponent implements OnInit {
  workers: Worker[] = [];
  fetchingWorkers: boolean;

  constructor(
    public workersService: WorkersService,
    public dataService: DataService
  ) { }

  ngOnInit(): void {
    this.fetchWorkers();
  }

  private fetchWorkers(): void {
    this.fetchingWorkers = true;
    this.workersService.fetchWorkers()
      .subscribe((resp: JSONResponse) => {
        this.workers = resp.data.map((w: any) => {
          const worker = new Worker(
            w.host.cert_id,
            w.addr,
            w.host.hostname,
            w.host.uptime,
            w.host.boot_time,
            w.host.procs,
            w.host.os,
            w.host.platform,
            w.host.platform_family,
            w.host.platform_version,
            w.host.kernel_version,
            w.host.kernel_arch,
            w.host.virtualization_system,
            w.host.virtualization_role,
            w.host.host_id
          );

          return worker;
        });
      }, err => {
        console.error(err);
      }, () => {
        this.fetchingWorkers = false;
      });
  }
}
