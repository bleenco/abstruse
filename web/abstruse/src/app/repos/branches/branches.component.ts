import { Component, OnInit } from '@angular/core';
import { BuildsItemsOptions } from '../../builds/common/builds-items/builds-items-options.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-branches',
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.sass']
})
export class BranchesComponent implements OnInit {
  options: BuildsItemsOptions = { type: 'commits' };

  constructor(private route: ActivatedRoute) {
    this.options = { ...this.options, ...{ repoID: route.snapshot.parent!.params.id } };
  }

  ngOnInit(): void {}
}
