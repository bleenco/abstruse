import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ElementRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { ITheme, Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebglAddon } from 'xterm-addon-webgl';

export type TerminalTheme = 'light' | 'dark';

const themes: { [key: string]: ITheme } = {
  light: {
    foreground: '#615f51',
    background: '#ffffff',
    black: '#050505',
    red: '#b0263f',
    green: '#4b862c',
    yellow: '#d69e2e',
    blue: '#3b62d9',
    magenta: '#a431c4',
    cyan: '#178262',
    white: '#615f51',
    brightBlack: '#0e0e0c',
    brightRed: '#b72424',
    brightGreen: '#4b862c',
    brightYellow: '#d69e2e',
    brightBlue: '#3b62d9',
    brightMagenta: '#a431c4',
    brightCyan: '#178262',
    brightWhite: '#615f51',
    cursor: 'rgba(0, 0, 0, 0)',
    cursorAccent: 'rgba(0, 0, 0, 0)',
    selection: 'rgba(0, 0, 0, 0.1)'
  },
  dark: {
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
    selection: 'rgba(0, 0, 0, 0.3)'
  }
};

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.sass']
})
export class TerminalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: string | null = null;
  @Input() theme: TerminalTheme = 'light';

  terminal: Terminal;
  fitAddon: FitAddon;
  webglAddon: WebglAddon;

  constructor(public elementRef: ElementRef) {
    this.terminal = new Terminal({
      rendererType: 'canvas',
      convertEol: true,
      disableStdin: true,
      scrollback: 1000000,
      drawBoldTextInBrightColors: true,
      fontSize: 13,
      fontWeight: 400,
      fontWeightBold: 700
    });
    this.fitAddon = new FitAddon();
    this.webglAddon = new WebglAddon();
  }

  ngOnInit(): void {
    this.terminal.open(this.elementRef.nativeElement.querySelector('.terminal-container'));
    this.terminal.loadAddon(this.fitAddon);

    try {
      this.terminal.loadAddon(this.webglAddon);
      this.webglAddon.onContextLoss(() => this.webglAddon.dispose());
    } catch (e) {
      this.terminal.setOption('rendererType', 'dom');
      this.terminal.setOption('fontSize', 12);
    }

    this.terminal.setOption(
      'fontFamily',
      'SourceCodePro, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    );
    this.setTheme();

    this.fitAddon.fit();

    this.terminal.onData(() => this.fitAddon.fit());
    this.terminal.onResize(() => this.fitAddon.fit());
    this.terminal.onLineFeed(() => this.fitAddon.fit());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.terminal) {
      return;
    }

    if ('theme' in changes) {
      this.setTheme();
      this.fitAddon.fit();
    }

    if (!changes.data || !this.data) {
      return;
    }

    if (this.data === '__CLEAR__') {
      this.terminal.clear();
      this.terminal.reset();
      return;
    }

    this.terminal.write(this.data, () => this.fitAddon.fit());
  }

  ngOnDestroy(): void {
    this.data = null;
    this.terminal.dispose();
  }

  private setTheme(): void {
    this.terminal.setOption('theme', themes[this.theme]);
  }
}
