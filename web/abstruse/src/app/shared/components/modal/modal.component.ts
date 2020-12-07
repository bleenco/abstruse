import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  Inject
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

export enum ModalDismissReasons {
  BACKDROP_CLICK,
  ESC
}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.sass']
})
export class ModalComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('UIModal', { read: ElementRef, static: false }) elementRef!: ElementRef;

  @Input() backdrop: boolean | 'white' = true;
  @Input() backdropOpacity = 0.5;
  @Input() keyboard = true;
  @Input() size: 'small' | 'large' | 'medium' = 'medium';

  @Output() dismissEvent = new EventEmitter();

  constructor(@Inject(DOCUMENT) private document: HTMLDocument, private ngZone: NgZone) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    fromEvent<KeyboardEvent>(this.document, 'keydown')
      .pipe(
        takeUntil(this.dismissEvent),
        filter((e: KeyboardEvent) => e.key === 'Escape' && this.keyboard)
      )
      .subscribe((e: KeyboardEvent) =>
        requestAnimationFrame(() => {
          if (!e.defaultPrevented) {
            this.ngZone.run(() => this.dismissEvent.emit(ModalDismissReasons.ESC));
          }
        })
      );
  }

  ngOnDestroy(): void {}
}
