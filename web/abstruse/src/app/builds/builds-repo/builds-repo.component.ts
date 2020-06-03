import { Component, OnInit } from '@angular/core';
import { Repo } from 'src/app/repos/shared/repo.model';
import { ActivatedRoute } from '@angular/router';
import { ReposService } from 'src/app/repos/shared/repos.service';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { BuildsService } from '../shared/builds.service';

@Component({
  selector: 'app-builds-repo',
  templateUrl: './builds-repo.component.html'
})
export class BuildsRepoComponent implements OnInit {
  repoid: number;
  repo: Repo;
  fetching: boolean;
  trigger: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private reposService: ReposService,
    private buildsService: BuildsService
  ) { }


  ngOnInit(): void {
    this.repoid = Number(this.activatedRoute.snapshot.paramMap.get('repoid'));
    this.find();
  }

  find(): void {
    this.fetching = true;
    this.reposService.find(this.repoid)
      .subscribe(repo => {
        this.repo = repo;
      }, err => {
        console.error(err)
      }, () => {
        this.fetching = false;
      });
  }

  triggerBuild(): void {
    this.trigger = true;
    this.buildsService.triggerBuild(this.repoid)
      .subscribe((resp: JSONResponse) => {
        console.log(resp);
      }, err => {
        console.error(err);
        this.trigger = false;
      }, () => {
        this.trigger = false;
      });
  }
}
