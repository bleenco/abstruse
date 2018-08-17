import { Component, OnInit, Input } from '@angular/core';
import { Build } from '../shared/build.model';
import { BuildService } from '../shared/build.service';

@Component({
  selector: 'app-build-item',
  templateUrl: './build-item.component.html',
  styleUrls: ['./build-item.component.sass']
})
export class BuildItemComponent implements OnInit {
  @Input() build: Build;

  isMenuOpened: boolean;

  constructor(public buildService: BuildService) { }

  ngOnInit() { }

  toggleMenu(ev: MouseEvent): void {
    ev.stopPropagation();
    this.isMenuOpened = !this.isMenuOpened;
  }

  restartBuild(ev: MouseEvent, buildId: number): void {
    this.buildService.restartBuild(ev, buildId);
    this.isMenuOpened = false;
  }

  stopBuild(ev: MouseEvent, buildId: number): void {
    this.buildService.stopBuild(ev, buildId);
    this.isMenuOpened = false;
  }
}
