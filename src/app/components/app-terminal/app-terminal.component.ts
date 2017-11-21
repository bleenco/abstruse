import { Component, ElementRef, OnInit, Input, SimpleChange, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as xterminal from 'xterm';

@Component({
  selector: 'app-terminal',
  templateUrl: 'app-terminal.component.html'
})
export class AppTerminalComponent implements OnInit {
  @Input() data: any;
  @Input() options: { size: 'normal' | 'large', newline: boolean };
  term: any;

  constructor(
    private elementRef: ElementRef,
    @Inject(DOCUMENT) private document: any
  ) {
    let xterm: any = <any>xterminal;
    xterm.loadAddon('fit');
    this.term = new xterm({
      cols: 120
    });
  }

  ngOnInit() {
    let el = this.elementRef.nativeElement;

    this.term.on('open', () => this.term.fit());
    this.term.open(el.querySelector('.window-terminal-container'), true);
  }

  ngOnChanges(changes: SimpleChange) {
     if (!this.data) {
      return;
    }

    if (typeof this.data.clear !== 'undefined') {
      this.term.reset();
      return;
    }

    if (this.options.newline) {
      this.term.writeln(this.data);
    } else {
      this.term.write(this.data);
    }
  }
}
