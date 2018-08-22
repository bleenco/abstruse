import { Component, OnInit, Input } from '@angular/core';
import { Image } from '../shared/image.model';
import { ImageService } from '../shared/image.service';

@Component({
  selector: 'app-image-base-item',
  templateUrl: './image-base-item.component.html',
  styleUrls: ['./image-base-item.component.sass']
})
export class ImageBaseItemComponent implements OnInit {
  @Input() image: Image;

  constructor(public imageService: ImageService) { }

  ngOnInit() { }
}
