import { Component, OnInit, Input } from '@angular/core';
import { Build } from '../shared/build.model';

@Component({
  selector: 'app-build-list-item',
  templateUrl: './build-list-item.component.html',
  styleUrls: ['./build-list-item.component.sass']
})
export class BuildListItemComponent implements OnInit {
  @Input() build!: Build;
  @Input() style: 'repo' | 'history' = 'history';

  constructor() {}

  ngOnInit(): void {}

  restartBuild(): void {}

  stopBuild(): void {}
}
