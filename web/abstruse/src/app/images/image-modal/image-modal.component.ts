import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { Tag, Image } from '../shared/image.model';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.sass']
})
export class ImageModalComponent implements OnInit {
  image!: Image;
  tag!: Tag;
  building: boolean = false;
  form!: FormGroup;

  constructor(private fb: FormBuilder, public activeModal: ActiveModal) {}

  ngOnInit(): void {
    this.createForm();
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
  }

  private createForm(): void {
    this.form = this.fb.group({
      name: [(this.image && this.image.name) || null, [Validators.required]],
      tag: [(this.tag && this.tag.tag) || null, [Validators.required]],
      dockerfile: [(this.tag && this.tag.dockerfile) || null, [Validators.required]],
      imageID: [(this.image && this.image.id) || null],
      tagID: [(this.tag && this.tag.id) || null]
    });
  }
}
