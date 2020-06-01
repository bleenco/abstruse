import { Component, OnInit, Input } from '@angular/core';
import { Build, Job } from '../shared/build.model';

@Component({
  selector: 'app-builds-info-container',
  templateUrl: './builds-info-container.component.html',
  styleUrls: ['./builds-info-container.component.sass']
})
export class BuildsInfoContainerComponent implements OnInit {
  @Input() build: Build;
  @Input() job: Job;

  constructor() { }

  ngOnInit(): void { }
}
