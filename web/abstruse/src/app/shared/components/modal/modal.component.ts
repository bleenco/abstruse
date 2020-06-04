import {
  Component,
  OnInit,
  ViewEncapsulation,
  Output,
  EventEmitter,
  Input,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

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

  @ViewChild('UIModal', { read: ElementRef, static: false }) elementRef: ElementRef;

  @Input() backdrop: boolean | 'white' = true;
  @Input() backdropOpacity = .5;
  @Input() keyboard = true;
  @Input() size: 'small' | 'large' | 'medium';

  @Output() dismissEvent = new EventEmitter();

  constructor(
    private ngZone: NgZone
  ) { }

  ngOnInit() { }

  ngAfterViewInit() {
    fromEvent<KeyboardEvent>(this.elementRef.nativeElement, 'keydown')
      .pipe(
        takeUntil(this.dismissEvent),
        filter((e: KeyboardEvent) => e.key === 'Escape' && this.keyboard)
      )
      .subscribe((e: KeyboardEvent) => requestAnimationFrame(() => {
        if (!e.defaultPrevented) {
          this.ngZone.run(() => this.dismissEvent.emit(ModalDismissReasons.ESC));
        }
      }));
  }

  ngOnDestroy() { }
}
