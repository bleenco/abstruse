import { Component, OnInit, OnDestroy, Input, ElementRef, OnChanges, ViewEncapsulation } from '@angular/core';
import { ITheme, Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class TerminalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: string;

  terminal: Terminal;
  fitAddon: FitAddon;
  themeLight: ITheme = {
    foreground: '#615f51',
    background: '#fff',
    black: '#050505',
    red: '#b0263f',
    green: '#4b862c',
    yellow: '#a18912',
    blue: '#3b62d9',
    magenta: '#a431c4',
    cyan: '#178262',
    white: '#fbf1bc',
    brightBlack: '#0e0e0c',
    brightRed: '#b72424',
    brightGreen: '#4b862c',
    brightYellow: '#87400d',
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
    background: 'hsl(220, 13%, 18%)',
    black: '#000',
    red: 'hsl(355, 65%, 65%)',
    green: 'hsl( 95, 38%, 62%)',
    yellow: 'hsl( 29, 54%, 61%)',
    blue: 'hsl(207, 82%, 66%)',
    magenta: 'hsl(286, 60%, 67%)',
    cyan: 'hsl(187, 47%, 55%)',
    white: '#ffffff',
    brightBlack: '#666666',
    brightRed: 'hsl(5, 48%, 51%)',
    brightGreen: 'hsl( 95, 38%, 62%)',
    brightYellow: 'hsl( 39, 67%, 69%)',
    brightBlue: 'hsl(207, 82%, 66%)',
    brightMagenta: 'hsl(286, 60%, 67%)',
    brightCyan: 'hsl(187, 47%, 55%)',
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
      fontWeightBold: '700'
    });
    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon);
  }

  ngOnInit() {
    this.terminal.open(this.elementRef.nativeElement.querySelector('.terminal-container'));
    this.terminal.setOption('fontFamily', 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace');
    this.terminal.setOption('fontSize', 12);
    this.terminal.setOption('theme', this.theme);
    this.fitAddon.fit();
  }

  ngOnChanges() {
    if (!this.data || !this.terminal) {
      return;
    }

    this.terminal.write(this.data);
  }

  ngOnDestroy() {
    this.data = null;
    this.terminal.dispose();
  }
}
