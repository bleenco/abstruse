import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { Tag, Image } from '../shared/image.model';
import { ImagesService, imagesSubEvent } from '../shared/images.service';
import { finalize, filter } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { DataService } from 'src/app/shared/providers/data.service';

interface IBuild {
  tags: string[];
  buildLog: string;
  pushLog: string;
  build: boolean | null;
  push: boolean | null;
  error: string | null;
}

@UntilDestroy()
@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.sass']
})
export class ImageModalComponent implements OnInit, OnDestroy {
  image!: Image;
  tag!: Tag;
  building: boolean = false;
  form!: FormGroup;
  editorOptions = { language: 'dockerfile', theme: 'abstruse' };
  tab: 'form' | 'log' = 'form';
  build: IBuild | null = null;

  constructor(
    private fb: FormBuilder,
    private imagesService: ImagesService,
    private dataService: DataService,
    public activeModal: ActiveModal
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.build = null;

    this.dataService.socketOutput
      .pipe(
        filter(ev => ev.type.startsWith(imagesSubEvent)),
        untilDestroyed(this)
      )
      .subscribe(ev => {
        if (ev.data && ev.data.buildLog) {
          this.build!.buildLog = ev.data.buildLog;
        }
        if (ev.data && typeof ev.data.build !== 'undefined') {
          this.build!.build = ev.data.build;
          if (!ev.data.build) {
            this.tab = 'form';
            this.build!.error = ev.data.error;
          }
        }
        if (ev.data && ev.data.pushLog) {
          this.build!.buildLog = ev.data.pushLog;
        }
        if (ev.data && typeof ev.data.push !== 'undefined') {
          this.build!.push = ev.data.push;
          if (!ev.data.push) {
            this.tab = 'form';
            this.build!.error = ev.data.error;
          }
        }
      });
    this.dataService.subscribeToEvent(imagesSubEvent);

    if (!this.tag) {
      return;
    }
    this.build = {
      tags: [this.tag.tag],
      buildLog: this.tag.buildLog,
      pushLog: this.tag.pushLog,
      build: null,
      push: null,
      error: null
    };
  }

  ngOnDestroy(): void {
    this.dataService.unsubscribeAll();
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    const data: { name: string; tags: string[]; dockerfile: string } = {
      name: this.form.controls.name.value,
      tags: this.form.controls.tag.value.split(',').map((t: string) => t.trim()),
      dockerfile: this.form.controls.dockerfile.value
    };

    if (!data.tags.includes('latest')) {
      data.tags.push('latest');
    }

    this.building = true;
    this.tab = 'log';
    this.build = { tags: data.tags, buildLog: '', pushLog: '', build: null, push: null, error: null };

    this.imagesService
      .build(data)
      .pipe(
        finalize(() => (this.building = false)),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.checkDone();
      });
  }

  private checkDone(): void {
    if (this.build!.build && this.build!.push) {
      this.activeModal.close(true);
    }
  }

  private createForm(): void {
    this.form = this.fb.group({
      name: [(this.image && this.image.name) || null, [Validators.required]],
      tag: [(this.tag && this.tag.tag) || null, [Validators.required]],
      dockerfile: [(this.tag && this.tag.dockerfile) || null, [Validators.required]]
    });
  }
}
