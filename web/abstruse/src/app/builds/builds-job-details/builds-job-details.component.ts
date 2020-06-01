import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuildsService } from '../shared/builds.service';
import { Build } from '../shared/build.model';

@Component({
  selector: 'app-builds-job-details',
  templateUrl: './builds-job-details.component.html',
  styleUrls: ['./builds-job-details.component.sass']
})
export class BuildsJobDetailsComponent implements OnInit {
  buildid: number;
  fetching: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private buildsServie: BuildsService
  ) { }

  ngOnInit(): void {
    this.buildid = Number(this.activatedRoute.snapshot.paramMap.get('buildid'));
  }

}
