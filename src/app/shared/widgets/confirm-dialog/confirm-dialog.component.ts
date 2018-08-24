import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.sass']
})
export class ConfirmDialogComponent implements OnInit {
  @Input() title: string;
  @Input() text: string;
  @Input() confirmClass: string;

  @Output() confirmed: EventEmitter<void>;
  @Output() cancelled: EventEmitter<void>;

  constructor() {
    this.confirmed = new EventEmitter<void>();
    this.cancelled = new EventEmitter<void>();
  }

  ngOnInit() { }

  confirm(): void {
    this.confirmed.emit();
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
