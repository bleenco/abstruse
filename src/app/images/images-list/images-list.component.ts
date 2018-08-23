import { Component, OnInit, HostListener } from '@angular/core';
import { ImageService } from '../shared/image.service';
import { DataService } from '../../shared/providers/data.service';
import { filter } from 'rxjs/operators';
import { Image } from '../shared/image.model';

@Component({
  selector: 'app-images-list',
  templateUrl: './images-list.component.html',
  styleUrls: ['./images-list.component.sass']
})
export class ImagesListComponent implements OnInit {
  editorValue: string;

  constructor(public imageService: ImageService, public dataService: DataService) { }

  ngOnInit() {
    this.dataService.socketOutput
      .pipe(filter(ev => ev.type === 'image building' || ev.type === 'image error' || ev.type === 'image done'))
      .subscribe(event => {
        if (event.type === 'image building') {
          const baseIndex = this.imageService.getBaseImageIndex(event.data.image);
          if (baseIndex !== -1) {
            this.imageService.baseImages[baseIndex].appendLog(event.data.output);

            if (this.imageService.detailsImage && this.imageService.detailsImage.repository === event.data.image.repository) {
              this.imageService.logData = event.data.output;
            }
          }
        } else {

        }

        if (event.type === 'image done') {
          this.imageService.fetchBaseImages();
        }
      });

    this.dataService.socketOutput
      .pipe(filter(ev => ev.type === 'building images list'))
      .subscribe(event => {
        const list: Image[] = event.data;
        this.imageService.buildingImages = list;

        if (this.imageService.baseImages && this.imageService.baseImages.length) {
          this.imageService.baseImages = this.imageService.baseImages.map(image => {
            image.building = false;
            return image;
          });

          list.forEach(image => {
            const index = this.imageService.baseImages.findIndex(baseImage => {
              return baseImage.repository === image.repository;
            });

            if (index !== -1) {
              this.imageService.baseImages[index].building = true;
            }
          });
        }
      });

    this.dataService.socketInput.emit({ type: 'subscribeToImages' });
  }

  @HostListener('document:keydown', ['$event']) onKeyDownHandler(event: KeyboardEvent) {
    if (event.keyCode === 27 && this.imageService.detailsDialogOpened) {
      this.imageService.closeDetailsDialog();
    }
  }
}
