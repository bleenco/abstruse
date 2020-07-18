import { Component, OnInit } from '@angular/core';
import { ImagesService } from '../shared/images.service';
import { Image } from '../shared/image.model';
import { finalize } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { ImageModalComponent } from '../image-modal/image-modal.component';

@UntilDestroy()
@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.sass']
})
export class ImagesComponent implements OnInit {
  loading: boolean = false;
  syncing: boolean = false;
  images: Image[] = [];
  error: string | null = null;

  constructor(private imagesService: ImagesService, private modal: ModalService) {}

  ngOnInit(): void {
    this.find();
  }

  openImageModal(): void {
    const modalRef = this.modal.open(ImageModalComponent, { size: 'large' });
    modalRef.result.then(
      ok => {},
      () => {}
    );
  }

  find(): void {
    this.loading = true;
    this.imagesService
      .find()
      .pipe(
        finalize(() => (this.loading = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.images = resp;
        },
        err => {
          this.error = err.message;
        }
      );
  }

  sync(): void {
    this.syncing = true;
    this.imagesService
      .sync()
      .pipe(
        finalize(() => (this.syncing = false)),
        untilDestroyed(this)
      )
      .subscribe(() => this.find());
  }
}
