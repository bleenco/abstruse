import { Component, OnInit } from '@angular/core';
import { Build } from '../shared/build.model';

@Component({
  selector: 'app-builds-list-item',
  templateUrl: './builds-list-item.component.html',
  styleUrls: ['./builds-list-item.component.sass']
})
export class BuildsListItemComponent implements OnInit {
  build: Build;

  constructor() { }

  ngOnInit(): void {
  }

}
