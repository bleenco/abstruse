import { Component, OnInit, Input } from '@angular/core';
import { ImageService } from '../shared/image.service';
import { Image } from '../shared/image.model';

@Component({
  selector: 'app-image-create-dialog',
  templateUrl: './image-create-dialog.component.html',
  styleUrls: ['./image-create-dialog.component.sass']
})
export class ImageCreateDialogComponent implements OnInit {
  @Input() image: Image;

  form: Image;
  baseImages: { value: string, placeholder: string }[];
  fetchingBaseImages: boolean;
  baseImage: string;
  saving: boolean;
  tab: 'dockerfile' | 'initsh';

  constructor(public imageService: ImageService) { }

  ngOnInit() {
    this.tab = 'dockerfile';
    this.form = this.image || new Image('', false);
    this.form.initsh = this.image && this.image.initsh || '';
    this.form.tag = this.image && this.image.tag || 'latest';
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

        if (this.image && this.image.dockerfile) {
          this.form.dockerfile = this.image.dockerfile.replace('COPY init.sh /home/abstruse/init.sh\n\n', '');
          const splitted = this.form.dockerfile.split('\n');
          const find = splitted.find(line => line.startsWith('FROM '));
          if (find) {
            this.baseImage = find.replace('FROM ', '').replace(/\n/g, '').trim();
          }
        } else if (this.baseImages.length) {
          this.baseImage = this.baseImages[0].value.trim();
          this.form.dockerfile = `FROM ${this.baseImage}`;
        } else {
          this.form.dockerfile = '';
        }
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
