import { Component, OnInit, Input } from '@angular/core';
import { Build } from '../shared/build.model';

@Component({
  selector: 'app-build-item',
  templateUrl: './build-item.component.html',
  styleUrls: ['./build-item.component.sass']
})
export class BuildItemComponent implements OnInit {
  @Input() build: Build;

  constructor() { }

  ngOnInit() { }
}
