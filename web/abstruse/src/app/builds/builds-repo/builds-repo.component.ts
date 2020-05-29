import { Component, OnInit } from '@angular/core';
import { Repo } from 'src/app/repos/shared/repo.model';
import { ActivatedRoute } from '@angular/router';
import { ReposService } from 'src/app/repos/shared/repos.service';
import { BuildsService } from '../shared/builds.service';

@Component({
  selector: 'app-builds-repo',
  templateUrl: './builds-repo.component.html',
  styleUrls: ['./builds-repo.component.sass']
})
export class BuildsRepoComponent implements OnInit {
  repoid: number;
  repo: Repo;
  fetching: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private reposService: ReposService,
    private buildsServie: BuildsService
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
        console.log(err);
      }, () => {
        this.fetching = false;
      });
  }
}
