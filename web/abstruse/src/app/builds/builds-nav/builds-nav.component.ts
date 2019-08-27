import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-builds-nav',
  templateUrl: './builds-nav.component.html',
  styleUrls: ['./builds-nav.component.sass']
})
export class BuildsNavComponent implements OnInit {
  @Input() tab: 'current' | 'branches' | 'history' | 'pull_requests' | 'build' | 'job';
  @Input() repoid: number;
  @Input() buildid: number;
  @Input() jobid: number;

  constructor() { }

  ngOnInit() { }
}
