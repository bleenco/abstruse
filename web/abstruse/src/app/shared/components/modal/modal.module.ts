import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal.component';
import { ModalService } from './modal.service';

@NgModule({
  imports: [CommonModule],
  declarations: [ModalComponent],
  entryComponents: [ModalComponent],
  providers: [ModalService],
  exports: [ModalComponent]
})
export class ModalModule {}
