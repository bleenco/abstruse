import { Component, OnInit } from '@angular/core';
import { BuildsService } from '../shared/builds.service';
import { JSONResponse } from 'src/app/core/shared/shared.model';

@Component({
  selector: 'app-builds-list',
  templateUrl: './builds-list.component.html',
  styleUrls: ['./builds-list.component.sass']
})
export class BuildsListComponent implements OnInit {

  constructor(public buildsService: BuildsService) { }

  ngOnInit(): void {
  }

  startJob(): void {
    this.buildsService.startJob()
      .subscribe((resp: JSONResponse) => {
        console.log(resp);
      }, err => {
        console.error(err);
      }, () => {
        console.log('done');
      });
  }
}
