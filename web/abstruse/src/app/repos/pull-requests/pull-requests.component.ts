import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuildsItemsOptions } from '../../builds/common/builds-items/builds-items-options.model';

@Component({
  selector: 'app-pull-requests',
  templateUrl: './pull-requests.component.html',
  styleUrls: ['./pull-requests.component.sass']
})
export class PullRequestsComponent implements OnInit {
  options: BuildsItemsOptions = { type: 'pull-requests' };

  constructor(private route: ActivatedRoute) {
    this.options = { ...this.options, ...{ repoID: route.snapshot.parent!.params.id } };
  }

  ngOnInit(): void {}
}
