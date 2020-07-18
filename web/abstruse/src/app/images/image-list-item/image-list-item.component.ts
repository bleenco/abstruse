import { Component, OnInit, Input } from '@angular/core';
import { Image } from '../shared/image.model';

@Component({
  selector: 'app-image-list-item',
  templateUrl: './image-list-item.component.html',
  styleUrls: ['./image-list-item.component.sass']
})
export class ImageListItemComponent implements OnInit {
  @Input() image!: Image;

  constructor() {}

  ngOnInit(): void {}
}
