import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Repo } from 'src/app/repositories/shared/repo.model';
import { BuildService } from '../shared/build.service';
import { JSONResponse } from 'src/app/core/shared/shared.model';

@Component({
  selector: 'app-builds-repo',
  templateUrl: './builds-repo.component.html',
  styleUrls: ['./builds-repo.component.sass']
})
export class BuildsRepoComponent implements OnInit {
  repoid: number;
  fetching: boolean;
  repo: Repo;

  constructor(
    public route: ActivatedRoute,
    public buildService: BuildService
  ) { }

  ngOnInit() {
    this.repoid = this.route.snapshot.params.repoid;
    this.fetchRepoInfo();
  }

  fetchRepoInfo(): void {
    this.fetching = true;
    this.buildService.fetchRepoInfo(this.repoid).subscribe((resp: JSONResponse) => {
      if (resp && resp.data) {
        this.repo = resp.data;
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetching = false;
    });
  }
}
