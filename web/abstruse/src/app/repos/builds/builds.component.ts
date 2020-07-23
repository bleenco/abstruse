import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuildsItemsOptions } from '../../builds/common/builds-items/builds-items-options.model';

@Component({
  selector: 'app-builds',
  templateUrl: './builds.component.html',
  styleUrls: ['./builds.component.sass']
})
export class BuildsComponent implements OnInit {
  options: BuildsItemsOptions = { type: 'latest' };

  constructor(private route: ActivatedRoute) {
    this.options = { ...this.options, ...{ repoID: route.snapshot.parent!.params.id } };
  }

  ngOnInit(): void {}
}
