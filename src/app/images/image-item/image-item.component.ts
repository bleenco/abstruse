import { Component, OnInit, Input } from '@angular/core';
import { Image } from '../shared/image.model';
import { ImageService } from '../shared/image.service';

@Component({
  selector: 'app-image-item',
  templateUrl: './image-item.component.html',
  styleUrls: ['./image-item.component.sass']
})
export class ImageItemComponent implements OnInit {
  @Input() image: Image;

  constructor(public imageService: ImageService) { }

  ngOnInit() { }
}
