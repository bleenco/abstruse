import { Component, OnInit, OnDestroy, Input, ElementRef, OnChanges } from '@angular/core';
import { ITheme, Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.sass']
})
export class TerminalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: any;

  terminal: any;
  theme: ITheme = {
    foreground: '#F8F8F2',
    background: '#262626',
    black: '#000',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#96ECFD',
    magenta: '#bd93f9',
    cyan: '#8be9fd',
    white: '#ffffff',
    brightBlack: '#666666',
    brightRed: '#ff5555',
    brightGreen: '#50fa7b',
    brightYellow: '#f1fa8c',
    brightBlue: '#96ECFD',
    brightMagenta: '#bd93f9',
    brightCyan: '#8be9fd',
    brightWhite: '#ffffff',
    cursor: 'rgba(0, 0, 0, 0)',
    cursorAccent: 'rgba(0, 0, 0, 0)',
    selection: 'rgba(0, 0, 0, .3)'
  };

  constructor(public elementRef: ElementRef) {
    Terminal.applyAddon(fit);
    this.terminal = new Terminal();
  }

  ngOnInit() {
    this.terminal.open(this.elementRef.nativeElement.querySelector('.terminal-container'));
    this.terminal.setOption('fontFamily', 'Monaco, Menlo, "Ubuntu Mono", monospace');
    this.terminal.setOption('fontSize', 11);
    this.terminal.setOption('theme', this.theme);
    this.terminal.fit();
  }

  ngOnChanges() {
    if (!this.data || !this.terminal) {
      return;
    }

    if (typeof this.data.clear !== 'undefined') {
      this.terminal.reset();
      return;
    }

    this.terminal.write(this.data);
  }

  ngOnDestroy() {
    this.data = null;
  }
}
