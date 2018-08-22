import { Component, OnInit } from '@angular/core';
import { ImageService } from '../shared/image.service';

@Component({
  selector: 'app-images-list',
  templateUrl: './images-list.component.html',
  styleUrls: ['./images-list.component.sass']
})
export class ImagesListComponent implements OnInit {
  editorValue: string;

  constructor(public imageService: ImageService) { }

  ngOnInit() { }

}
