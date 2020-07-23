import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Image } from '../shared/image.model';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { ImageModalComponent } from '../image-modal/image-modal.component';

@Component({
  selector: 'app-image-list-item',
  templateUrl: './image-list-item.component.html',
  styleUrls: ['./image-list-item.component.sass']
})
export class ImageListItemComponent implements OnInit {
  @Input() image!: Image;
  @Output() onBuildDone: EventEmitter<boolean> = new EventEmitter<boolean>();

  items: boolean = false;

  constructor(public modal: ModalService) {}

  ngOnInit(): void {}

  openImageModal(tag: string): void {
    const modalRef = this.modal.open(ImageModalComponent, { size: 'large' });
    modalRef.componentInstance.image = this.image;
    modalRef.componentInstance.tag = this.image.tags.find(t => t.tag === tag);
    modalRef.result.then(
      ok => {
        this.onBuildDone.emit(ok);
      },
      ok => {
        this.onBuildDone.emit(ok);
      }
    );
  }
}
