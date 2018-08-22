import { Component, OnInit } from '@angular/core';
import { ImageService } from '../shared/image.service';

@Component({
  selector: 'app-image-log-dialog',
  templateUrl: './image-log-dialog.component.html',
  styleUrls: ['./image-log-dialog.component.sass']
})
export class ImageLogDialogComponent implements OnInit {

  constructor(public imageService: ImageService) { }

  ngOnInit() { }

}
