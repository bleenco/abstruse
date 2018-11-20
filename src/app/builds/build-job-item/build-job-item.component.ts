import { Component, OnInit, Input } from '@angular/core';
import { BuildJob, Build } from '../shared/build.model';
import { DataService } from 'src/app/shared/providers/data.service';

@Component({
  selector: 'app-build-job-item',
  templateUrl: './build-job-item.component.html',
  styleUrls: ['./build-job-item.component.sass']
})
export class BuildJobItemComponent implements OnInit {
  @Input() job: BuildJob;
  @Input() build: Build;
  @Input() currentTime: number;

  constructor(public dataService: DataService) { }

  ngOnInit() { }

  restartJob(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    this.job.processing = true;
    this.dataService.socketInput.emit({ type: 'restartJob', data: { jobId: this.job.id } });
  }

  stopJob(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();


    this.job.processing = true;
    this.dataService.socketInput.emit({ type: 'stopJob', data: { jobId: this.job.id } });
  }
}
