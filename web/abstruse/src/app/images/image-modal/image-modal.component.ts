import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { Tag, Image } from '../shared/image.model';
import { ImagesService } from '../shared/images.service';
import { finalize } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
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
  editorOptions = {
    theme: 'blackboard',
    language: 'dockerfile'
  };
  tab: 'form' | 'log' = 'form';

  constructor(private fb: FormBuilder, private imagesService: ImagesService, public activeModal: ActiveModal) {}

  ngOnInit(): void {
    this.createForm();
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    const data: { name: string; tags: string[]; dockerfile: string } = {
      name: this.form.controls.name.value,
      tags: [this.form.controls.tag.value],
      dockerfile: this.form.controls.dockerfile.value
    };

    this.building = true;
    this.imagesService
      .build(data)
      .pipe(
        finalize(() => (this.building = false)),
        untilDestroyed(this)
      )
      .subscribe(resp => {
        console.log(resp);
      });
  }

  private createForm(): void {
    this.form = this.fb.group({
      name: [(this.image && this.image.name) || null, [Validators.required]],
      tag: [(this.tag && this.tag.tag) || null, [Validators.required]],
      dockerfile: [(this.tag && this.tag.dockerfile) || null, [Validators.required]]
    });
  }
}
