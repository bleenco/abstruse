import { Component, OnInit, Input } from '@angular/core';
import { Build } from '../shared/build.model';
import { BuildsService } from '../shared/builds.service';

@Component({
  selector: 'app-builds-list-item',
  templateUrl: './builds-list-item.component.html',
  styleUrls: ['./builds-list-item.component.sass']
})
export class BuildsListItemComponent implements OnInit {
  @Input() build: Build;

  constructor(private buildsService: BuildsService) { }

  ngOnInit(): void { }

  stopBuild(): void {
    this.build.processing = true;
    this.buildsService.stopBuild(this.build.id)
      .subscribe(resp => {
        if (!resp.data) {
          console.error(resp);
        }
      }, err => {
        this.build.processing = false;
        console.error(err);
      }, () => {
        this.build.processing = false;
      });
  }

  restartBuild(): void {
    this.build.processing = true;
    this.buildsService.restartBuild(this.build.id)
      .subscribe(resp => {
        if (resp.data) {
          this.build.resetTime();
        }
      }, err => {
        this.build.processing = false;
        console.error(err);
      }, () => {
        this.build.processing = false;
      });
  }
}
