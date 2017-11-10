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
import * as hterm from 'hterm-umdjs';

const terminalColorPallete = ['rgb(40, 42, 54)', 'rgb(255, 85, 85)', 'rgb(80, 250, 123)',
  'rgb(243, 251, 151)', 'rgb(189, 147, 249)', 'rgb(255, 121, 198)', 'rgb(139, 233, 253)',
  'rgb(187, 187, 187)', 'rgb(85, 85, 85)', 'rgb(255, 85, 85)', 'rgb(80, 250, 123)',
  'rgb(243, 251, 151)', 'rgb(189, 147, 249)', 'rgb(255, 121, 198)', 'rgb(139, 233, 253)',
  'rgb(255, 255, 255)'];

@Component({
  selector: 'app-terminal',
  templateUrl: 'app-terminal.component.html'
})
export class AppTerminalComponent implements OnInit {
  @Input() data: any;
  @Input() options: { size: 'normal' | 'large' };
  hterm: hterm.Terminal;
  terminalReady: boolean;
  unwritenChanges: string;

  constructor(
    private elementRef: ElementRef,
    @Inject(DOCUMENT) private document: any
  ) {
    hterm.hterm.defaultStorage = new hterm.lib.Storage.Local();
    this.hterm = new hterm.hterm.Terminal();
    this.terminalReady = false;
    this.unwritenChanges = '';
  }

  ngOnInit() {
    this.hterm.onVTKeystroke = () => {};
    this.hterm.showOverlay = () => {};
    this.hterm.onTerminalReady = () => {
      this.hterm.setWindowTitle = () => {};
      this.hterm.prefs_.set('cursor-color', 'transparent');
      this.hterm.prefs_.set('font-family', 'monaco, Menlo, monospace');
      this.hterm.prefs_.set('font-size', 12);
      this.hterm.prefs_.set('audible-bell-sound', '');
      this.hterm.prefs_.set('font-smoothing', 'subpixel-antialiased');
      this.hterm.prefs_.set('enable-bold', true);
      this.hterm.prefs_.set('cursor-blink', false);
      this.hterm.prefs_.set('receive-encoding', 'raw');
      this.hterm.prefs_.set('send-encoding', 'raw');
      this.hterm.prefs_.set('scrollbar-visible', false);
      this.hterm.prefs_.set('enable-clipboard-notice', false);
      this.hterm.prefs_.set('background-color', '#000000');
      this.hterm.prefs_.set('foreground-color', '#f8f8f2');
      hterm.lib.colors.stockColorPalette.splice(0, terminalColorPallete.length);
      hterm.lib.colors.stockColorPalette = terminalColorPallete
        .concat(hterm.lib.colors.stockColorPalette);
      this.hterm.prefs_.set('color-palette-overrides', terminalColorPallete);

      this.terminalReady = true;
      if (this.unwritenChanges) {
        this.printToTerminal(this.unwritenChanges);
        this.unwritenChanges = '';
      }
    };

    this.hterm.decorate(this.document.querySelector('.window-terminal-container'));
    this.hterm.installKeyboard(null);
  }

  ngOnChanges(changes: SimpleChange) {
    if (!this.data) {
      return;
    }

    if (typeof this.data.clear !== 'undefined') {
      this.hterm.keyboard.terminal.wipeContents();
      return;
    }

    if (!this.terminalReady) {
      this.unwritenChanges += this.data;
    } else {
      this.printToTerminal(this.data);
    }
  }

  printToTerminal(data: string) {
    this.hterm.io.writeUTF8(this.data);
    if (this.hterm.keyboard.terminal
      && this.hterm.keyboard.terminal.scrollPort_
      && this.hterm.keyboard.terminal.scrollPort_.isScrolledEnd) {
        this.hterm.keyboard.terminal.scrollEnd();
    }
  }
}
