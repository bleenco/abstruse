import { Component, OnInit, OnDestroy, Input, ElementRef, OnChanges, ViewEncapsulation } from '@angular/core';
import { ITheme, Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.sass']
})
export class TerminalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: string | null = null;

  terminal: Terminal;
  fitAddon: FitAddon;

  themeLight: ITheme = {
    foreground: '#615f51',
    background: '#ffffff',
    black: '#050505',
    red: '#b0263f',
    green: '#4b862c',
    yellow: '#d69e2e',
    blue: '#3b62d9',
    magenta: '#a431c4',
    cyan: '#178262',
    white: '#fbf1bc',
    brightBlack: '#0e0e0c',
    brightRed: '#b72424',
    brightGreen: '#4b862c',
    brightYellow: '#d69e2e',
    brightBlue: '#3b62d9',
    brightMagenta: '#a431c4',
    brightCyan: '#178262',
    brightWhite: '#fbf1bc',
    cursor: 'rgba(0, 0, 0, 0)',
    cursorAccent: 'rgba(0, 0, 0, 0)',
    selection: 'rgba(0, 0, 0, 0)'
  };

  theme: ITheme = {
    foreground: 'hsl(220, 14%, 71%)',
    background: '#2f3136',
    black: '#000',
    red: '#be5046',
    green: '#98c379',
    yellow: '#e6c07b',
    blue: '#61aeee',
    magenta: '#c678dd',
    cyan: '#56b6c2',
    white: '#ffffff',
    brightBlack: '#666666',
    brightRed: '#e06c75',
    brightGreen: '#98c379',
    brightYellow: '#e6c07b',
    brightBlue: '#61aeee',
    brightMagenta: '#c678dd',
    brightCyan: '#56b6c2',
    brightWhite: '#ffffff',
    cursor: 'rgba(0, 0, 0, 0)',
    cursorAccent: 'rgba(0, 0, 0, 0)',
    selection: 'rgba(0, 0, 0, 0)'
  };

  constructor(public elementRef: ElementRef) {
    this.terminal = new Terminal({
      allowTransparency: true,
      disableStdin: true,
      scrollback: 10000,
      drawBoldTextInBrightColors: true,
      fontWeightBold: 'bold'
    });
    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon);
  }

  ngOnInit() {
    this.terminal.open(this.elementRef.nativeElement.querySelector('.terminal-container'));
    this.terminal.setOption('fontFamily', 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace');
    this.terminal.setOption('fontSize', 13);
    this.terminal.setOption('fontWeight', 400);
    this.terminal.setOption('fontWeightBold', 400);
    this.terminal.setOption('theme', this.themeLight);
    this.fitAddon.fit();
    this.terminal.onData(() => {
      this.fitAddon.fit();
    });
  }

  ngOnChanges() {
    if (!this.data || !this.terminal) {
      return;
    }
    if (this.data === '__CLEAR__') {
      this.terminal.clear();
      return;
    }

    this.terminal.write(this.data);
  }

  ngOnDestroy() {
    this.data = null;
    this.terminal.dispose();
  }
}
