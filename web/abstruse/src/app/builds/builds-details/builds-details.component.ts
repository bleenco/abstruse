import { Component, OnInit } from '@angular/core';
import { Build } from '../shared/build.model';
import { ActivatedRoute } from '@angular/router';
import { BuildsService } from '../shared/builds.service';

@Component({
  selector: 'app-builds-details',
  templateUrl: './builds-details.component.html',
  styleUrls: ['./builds-details.component.sass']
})
export class BuildsDetailsComponent implements OnInit {
  buildid: number;
  fetching: boolean;
  build: Build;

  constructor(
    private activatedRoute: ActivatedRoute,
    private buildsServie: BuildsService
  ) { }

  ngOnInit(): void {
    this.buildid = Number(this.activatedRoute.snapshot.paramMap.get('buildid'));
    this.findAll();
  }

  findAll(): void {
    this.fetching = true;
    this.buildsServie.findAll(this.buildid)
      .subscribe(build => {
        this.build = build;
      }, err => {
        console.error(err);
      }, () => {
        this.fetching = false;
      });
  }
}
