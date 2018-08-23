import { Component, OnInit } from '@angular/core';
import { ImageService } from '../shared/image.service';
import { Image } from '../shared/image.model';

@Component({
  selector: 'app-image-create-dialog',
  templateUrl: './image-create-dialog.component.html',
  styleUrls: ['./image-create-dialog.component.sass']
})
export class ImageCreateDialogComponent implements OnInit {
  form: Image;
  baseImages: string[];
  fetchingBaseImages: boolean;
  baseImage: string;
  saving: boolean;

  constructor(public imageService: ImageService) { }

  ngOnInit() {
    this.form = new Image('', false);
    this.form.dockerfile = 'FROM ubuntu_latest\n\n';
    this.form.initsh = '';
    this.fetchBaseImages();
  }

  createImage(): void {
    this.saving = true;
    this.imageService.createImage(this.form).subscribe(resp => {
      if (resp && resp.data === 'OK') {
        this.imageService.fetchBuildImages();
        this.imageService.closeCreateDialog();
      }
      this.saving = false;
    });
  }

  fetchBaseImages(): void {
    this.fetchingBaseImages = true;
    this.imageService.getBaseImages()
      .subscribe(resp => {
        if (resp && resp.data) {
          this.baseImages = resp.data
            .filter(image => !!image.ready)
            .map(image => ({ value: image.repository, placeholder: image.repository }));
        }
        this.fetchingBaseImages = false;
      });
  }

  onBaseImageSelected(baseImage: string): void {
    this.baseImage = baseImage;

    const splitted = this.form.dockerfile.split('\n');
    if (splitted.find(line => line.startsWith('FROM'))) {
      const index = splitted.findIndex(line => line.startsWith('FROM'));
      splitted[index] = `FROM ${this.baseImage}`;
      this.form.dockerfile = splitted.join('\n');
    } else {
      splitted.unshift(`FROM ${this.baseImage}\n\n`);
      this.form.dockerfile = splitted.join('\n');
    }
  }

}
