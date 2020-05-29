import { Component, OnInit } from '@angular/core';
import { Repo } from 'src/app/repos/shared/repo.model';
import { ActivatedRoute } from '@angular/router';
import { ReposService } from 'src/app/repos/shared/repos.service';
import { BuildsService } from '../shared/builds.service';
import { Build } from '../shared/build.model';

@Component({
  selector: 'app-builds-repo',
  templateUrl: './builds-repo.component.html',
  styleUrls: ['./builds-repo.component.sass']
})
export class BuildsRepoComponent implements OnInit {
  repoid: number;
  repo: Repo;
  fetching: boolean;
  fetchingBuilds: boolean;
  fetchingMore: boolean;
  hideMoreButton: boolean;
  builds: Build[] = [];
  limit = 5;
  offset = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private reposService: ReposService,
    private buildsService: BuildsService
  ) { }

  ngOnInit(): void {
    this.repoid = Number(this.activatedRoute.snapshot.paramMap.get('repoid'));
    this.find();
    this.findBuilds();
  }

  find(): void {
    this.fetching = true;
    this.reposService.find(this.repoid)
      .subscribe(repo => {
        this.repo = repo;
      }, err => {
        console.log(err);
      }, () => {
        this.fetching = false;
      });
  }

  findBuilds(): void {
    if (this.offset === 0) {
      this.fetchingBuilds = true;
    } else {
      this.fetchingMore = true;
    }

    this.buildsService.findByRepoID(this.repoid, this.limit, this.offset)
      .subscribe((resp: Build[]) => {
        this.builds = this.builds.concat(resp);
        if (resp.length === this.limit) {
          this.offset += resp.length;
        } else {
          this.hideMoreButton = true;
        }
      }, err => {
        console.error(err);
      }, () => {
        this.fetchingBuilds = false;
        this.fetchingMore = false;
      });
  }
}
