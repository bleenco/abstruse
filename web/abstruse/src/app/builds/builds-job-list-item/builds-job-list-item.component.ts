import { Component, OnInit, Input } from '@angular/core';
import { Job, Build } from '../shared/build.model';

@Component({
  selector: 'app-builds-job-list-item',
  templateUrl: './builds-job-list-item.component.html',
  styleUrls: ['./builds-job-list-item.component.sass']
})
export class BuildsJobListItemComponent implements OnInit {
  @Input() job: Job;
  @Input() build: Build;

  constructor() { }

  ngOnInit() { }
}
