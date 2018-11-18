import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { ImageService } from '../shared/image.service';
import { DataService } from '../../shared/providers/data.service';
import { filter } from 'rxjs/operators';
import { Image } from '../shared/image.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-images-list',
  templateUrl: './images-list.component.html',
  styleUrls: ['./images-list.component.sass']
})
export class ImagesListComponent implements OnInit, OnDestroy {
  imageSub: Subscription;
  buildSub: Subscription;

  constructor(public imageService: ImageService, public dataService: DataService) { }

  ngOnInit() {
    this.imageService.tab = 'build images';
    this.imageService.fetchBuildImages();

    this.imageSub = this.dataService.socketOutput
      .pipe(filter(ev => ev.type === 'image building' || ev.type === 'image error' || ev.type === 'image done'))
      .subscribe(event => {
        if (event.type === 'image building' || event.type === 'image error') {
          const baseIndex = this.imageService.getBaseImageIndex(event.data.image);
          if (baseIndex !== -1) {
            this.imageService.baseImages[baseIndex].appendLog(event.data.output);

            if (this.imageService.detailsImage && this.imageService.detailsImage.repository === event.data.image.repository) {
              this.imageService.logData = event.data.output;
            }
          }

          const buildIndex = this.imageService.getBuildImageIndex(event.data.image);
          if (buildIndex !== -1) {
            this.imageService.buildImages[buildIndex].appendLog(event.data.output);

            if (this.imageService.detailsImage && this.imageService.detailsImage.repository === event.data.image.repository) {
              this.imageService.logData = event.data.output;
            }
          }
        }

        if (event.type === 'image done') {
          if (this.imageService.tab === 'build images') {
            this.imageService.fetchBuildImages();
          } else if (this.imageService.tab === 'base images') {
            this.imageService.fetchBaseImages();
          }
        }
      });

    this.buildSub = this.dataService.socketOutput
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

        if (this.imageService.buildImages && this.imageService.buildImages.length) {
          this.imageService.buildImages = this.imageService.buildImages.map(image => {
            image.building = false;
            return image;
          });

          list.forEach(image => {
            const index = this.imageService.buildImages.findIndex(buildImage => {
              return buildImage.repository === image.repository && buildImage.tag === image.tag;
            });

            if (index !== -1) {
              this.imageService.buildImages[index].building = true;
            }
          });
        }

        if (this.imageService.detailsImage) {
          this.imageService.detailsImage.building = false;

          list.forEach(image => {
            if ( this.imageService.detailsImage.repository === image.repository &&  this.imageService.detailsImage.tag === image.tag) {
              this.imageService.detailsImage.building = true;
            }
          });
        }
      });

    this.dataService.socketInput.emit({ type: 'subscribeToImages' });
  }

  ngOnDestroy() {
    if (this.imageSub) {
      this.imageSub.unsubscribe();
    }

    if (this.buildSub) {
      this.imageSub.unsubscribe();
    }

    this.dataService.socketInput.emit({ type: 'unsubscribeFromImages' });
  }

  @HostListener('document:keydown', ['$event']) onKeyDownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape' && this.imageService.detailsDialogOpened) {
      this.imageService.closeDetailsDialog();
    }
  }
}
