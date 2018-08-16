import { Component, OnInit, Input } from '@angular/core';
import { BuildService } from '../shared/build.service';
import { BuildJob } from '../shared/build.model';

@Component({
  selector: 'app-build-job-item',
  templateUrl: './build-job-item.component.html',
  styleUrls: ['./build-job-item.component.sass']
})
export class BuildJobItemComponent implements OnInit {
  @Input() job: BuildJob;

  constructor(public buildService: BuildService) { }

  ngOnInit() { }
}
