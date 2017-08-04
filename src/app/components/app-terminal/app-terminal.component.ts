import { Component, ElementRef, OnInit, Input, SimpleChange } from '@angular/core';
import * as AnsiUp from 'ansi_up';

@Component({
  selector: 'app-terminal',
  templateUrl: 'app-terminal.component.html'
})
export class AppTerminalComponent implements OnInit {
  @Input() data: any;
  @Input() options: { size: 'normal' | 'large' };
  au: any;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    this.au = new AnsiUp.default();
    this.au.use_classes = true;
  }

  ngOnChanges(changes: SimpleChange) {
    if (!this.data) {
      return;
    }

    const el = this.elementRef.nativeElement.querySelector('.window-terminal-container');
    if (typeof this.data.clear !== 'undefined') {
      el.innerHTML = '';
    } else {
      el.innerHTML += this.au.ansi_to_html(this.data);
      setTimeout(() => el.scrollTop = el.scrollHeight);
    }
  }
}
