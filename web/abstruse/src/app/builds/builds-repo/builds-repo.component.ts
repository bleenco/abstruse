import { Component, OnInit, OnDestroy } from '@angular/core';
import { Repo } from 'src/app/repos/shared/repo.model';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ReposService } from 'src/app/repos/shared/repos.service';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { BuildsService } from '../shared/builds.service';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Subscription, merge, of } from 'rxjs';

@Component({
  selector: 'app-builds-repo',
  templateUrl: './builds-repo.component.html'
})
export class BuildsRepoComponent implements OnInit, OnDestroy {
  repoid: number;
  buildid: number;
  jobid: number;
  repo: Repo;
  fetching: boolean;
  trigger: boolean;
  sub: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reposService: ReposService,
    private buildsService: BuildsService
  ) { }


  ngOnInit(): void {
    this.repoid = Number(this.route.snapshot.paramMap.get('repoid'));
    this.buildid = Number(this.route.firstChild.snapshot.paramMap.get('buildid')) || null;
    this.jobid = Number(this.route.firstChild.snapshot.paramMap.get('jobid')) || null;
    this.find();

    this.sub.add(
      this.router.events
        .pipe(
          filter(ev => ev instanceof NavigationEnd),
          map(() => this.route),
          map(route => {
            while (route.firstChild) {
              route = route.firstChild;
            }
            return route;
          }),
          filter(route => route.outlet === 'primary'),
          mergeMap(route => route.params)
        )
        .subscribe(ev => {
          this.buildid = ev.buildid ? ev.buildid : null;
          this.jobid = ev.jobid ? ev.jobid : null;
        })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
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
