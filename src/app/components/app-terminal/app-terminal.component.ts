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
import * as hterm from 'hterm-bundle';

@Component({
  selector: 'app-terminal',
  templateUrl: 'app-terminal.component.html'
})
export class AppTerminalComponent implements OnInit {
  @Input() data: any;
  @Input() options: { size: 'normal' | 'large' };
  hterm: hterm.Terminal;

  constructor(
    private elementRef: ElementRef,
    @Inject(DOCUMENT) private document: any
  ) {
    hterm.hterm.defaultStorage = new hterm.lib.Storage.Local();
    this.hterm = new hterm.hterm.Terminal();
  }

  ngOnInit() {
    this.hterm.onTerminalReady = () => {
      this.hterm.setWindowTitle = () => {};
      this.hterm.prefs_.set('cursor-color', 'transparent');
      this.hterm.prefs_.set('font-family', 'monaco, menlo, monospace');
      this.hterm.prefs_.set('font-size', 11);
      this.hterm.prefs_.set('audible-bell-sound', '');
      this.hterm.prefs_.set('font-smoothing', 'subpixel-antialiased');
      this.hterm.prefs_.set('enable-bold', false);
      this.hterm.prefs_.set('backspace-sends-backspace', true);
      this.hterm.prefs_.set('cursor-blink', false);
      this.hterm.prefs_.set('receive-encoding', 'raw');
      this.hterm.prefs_.set('send-encoding', 'raw');
      this.hterm.prefs_.set('alt-sends-what', 'browser-key');
      this.hterm.prefs_.set('scrollbar-visible', false);
      this.hterm.prefs_.set('enable-clipboard-notice', false);
      this.hterm.prefs_.set('background-color', '#000000');
      this.hterm.prefs_.set('foreground-color', '#f8f8f2');
      this.hterm.prefs_.set('color-palette-overrides',
        ['#282a36',
         '#ff5555',
         '#50fa7b',
         '#F3FB97',
         '#bd93f9',
         '#ff79c6',
         '#8be9fd',
         '#bbbbbb',
         '#555555',
         '#ff5555',
         '#50fa7b',
         '#F3FB97',
         '#bd93f9',
         '#ff79c6',
         '#8be9fd',
         '#ffffff']);
      this.hterm.onVTKeystroke = () => {};
    };

    this.hterm.decorate(document.querySelector('#hterm'));
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

    this.hterm.io.print(this.data);
    if (this.hterm.keyboard.terminal
      && this.hterm.keyboard.terminal.scrollPort_
      && this.hterm.keyboard.terminal.scrollPort_.isScrolledEnd) {
        this.hterm.keyboard.terminal.scrollEnd();
    }
  }
}
