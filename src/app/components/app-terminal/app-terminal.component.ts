import {
  Component,
  ElementRef,
  OnInit,
  Input,
  SimpleChange,
  EventEmitter,
  Inject
} from '@angular/core';
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
  terminalReady: boolean;
  unwritenChanges: string[];

  constructor(
    private elementRef: ElementRef,
    @Inject(DOCUMENT) private document: any
  ) {
    this.terminalReady = false;
    this.unwritenChanges = [];
  }

  ngOnInit() {
    let el = this.elementRef.nativeElement;
    let xterm: any = <any>xterminal;
    xterm.loadAddon('fit');
    this.term = new xterm({
      scrollback: 15000,
      cols: 120
    });

    this.term.on('open', () => {
      this.terminalReady = true;
      if (this.unwritenChanges.length) {
        this.unwritenChanges.forEach(p => this.printToTerminal(p));
        this.unwritenChanges = [];
      }
    });

    this.term.open(el.querySelector('.window-terminal-container'), true);
    setTimeout(() => {
      this.term.fit();
    });
  }

  ngOnChanges(changes: SimpleChange) {
    if (!this.data) {
      return;
    }

    if (typeof this.data.clear !== 'undefined') {
      this.term.reset();
      return;
    }

    if (!this.terminalReady) {
      this.unwritenChanges.push(this.data);
    } else {
      this.printToTerminal(this.data);
    }
  }

  printToTerminal(data: string) {
    if (this.options.newline) {
      this.term.writeln(data);
    } else {
      this.term.write(data);
    }
    setTimeout(() => {
      this.term.fit();
    });
  }
}
