import { Component, ElementRef, OnInit, Input, SimpleChange, Inject } from '@angular/core';
import { Terminal, ITheme } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';

@Component({
  selector: 'app-terminal',
  templateUrl: 'app-terminal.component.html'
})
export class AppTerminalComponent implements OnInit {
  @Input() data: any;
  @Input() options: { size: 'normal' | 'large', newline: boolean };
  term: any;
  theme: ITheme;

  constructor(private elementRef: ElementRef) {
    Terminal.applyAddon(fit);
    this.term = new Terminal({ cols: 120, scrollback: 100000 });
    this.theme = {
      foreground: '#F8F8F2',
      background: '#000000',
      cursor: 'rgba(0, 0, 0, 0)',
      cursorAccent: 'rgba(0, 0, 0, 0)',
      selection: 'rgba(0, 0, 0, 0)',
      black: '#000000',
      red: '#ff5555',
      green: '#50fa7b',
      yellow: '#f1fa8c',
      blue: '#96ECFD',
      magenta: '#bd93f9',
      cyan: '#8be9fd',
      white: '#ffffff',
      brightBlack: '#000000',
      brightRed: '#ff5555',
      brightGreen: '#50fa7b',
      brightYellow: '#f1fa8c',
      brightBlue: '#96ECFD',
      brightMagenta: '#bd93f9',
      brightCyan: '#8be9fd',
      brightWhite: '#ffffff'
    };
  }

  ngOnInit() {
    const el = this.elementRef.nativeElement.querySelector('.window-terminal-container');
    this.term.open(el);
    this.term.setOption('fontFamily', 'Monaco');
    this.term.setOption('fontSize', 12);
    this.term.setOption('theme', this.theme);
    this.term.fit();
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
