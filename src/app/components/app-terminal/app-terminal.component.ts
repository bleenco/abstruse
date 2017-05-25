import {
  Component,
  ElementRef,
  OnInit,
  Input,
  EventEmitter,
  Output,
  SimpleChange
} from '@angular/core';
import * as hterm from 'htermabstruse';

@Component({
  selector: 'app-terminal',
  templateUrl: 'app-terminal.component.html'
})
export class AppTerminalComponent implements OnInit {
  @Input() data: any;
  @Input() options: { size: 'normal' | 'large' };
  @Output() outputData: EventEmitter<any>;

  term: any;
  termReady: boolean;

  constructor(private elementRef: ElementRef) {
    this.outputData = new EventEmitter<string>();
    this.termReady = false;
  }

  ngOnInit() {
    hterm.hterm.defaultStorage = new hterm.lib.Storage.Local();
    hterm.hterm.Terminal.prototype.overlaySize = () => {};

    let storage = new hterm.lib.Storage.Local();
    this.term = new hterm.hterm.Terminal();

    this.setBasic();

    this.term.prefs_.set('font-family', `Menlo, 'Lucida Console', monaco, monospace`);
    this.term.prefs_.set('font-size', 12);
    this.term.prefs_.set('background-color', '#1e1f29');
    this.term.prefs_.set('foreground-color', '#f8f8f2');
    this.term.prefs_.set('cursor-color', 'transparent');
    this.term.prefs_.set('color-palette-overrides', [
      '#ffffff',
      '#8be9fd',
      '#ff79c6',
      '#bd93f9',
      '#f1fa8c',
      '#50fa7b',
      '#ff5555',
      '#555555',
      '#bbbbbb',
      '#8be9fd',
      '#ff79c6',
      '#bd93f9',
      '#f1fa8c',
      '#50fa7b',
      '#ff5555',
      '#000000'
    ].reverse());

    this.term.onTerminalReady = () => {
      let io = this.term.io.push();

      io.onTerminalResize = (col: number, row: number) => {
        this.outputData.emit({ type: 'resize', cols: col, rows: row });
      };

      this.term.setWindowTitle = () => {};

      this.termReady = true;
      this.outputData.emit('ready');
    };
  }

  ngOnChanges(changes: SimpleChange) {
    if (!this.data || !this.termReady) {
      return;
    }

    if (this.data.clear) {
      this.term.wipeContents();
      this.term.scrollHome();
    } else {
      this.term.io.writeUTF8(this.data);
    }
  }

  setBasic() {
    setTimeout(() => {
      this.term.decorate(this.elementRef.nativeElement.querySelector('.terminal'));
      this.term.prefs_.storage.clear();
      this.term.prefs_.set('font-smoothing', 'subpixel-antialiased');
      this.term.prefs_.set('enable-bold', false);
      this.term.prefs_.set('backspace-sends-backspace', true);
      this.term.prefs_.set('cursor-blink', false);
      this.term.prefs_.set('receive-encoding', 'raw');
      this.term.prefs_.set('send-encoding', 'raw');
      this.term.prefs_.set('alt-sends-what', 'browser-key');
      this.term.prefs_.set('scrollbar-visible', false);
      this.term.prefs_.set('enable-clipboard-notice', false);
    });
  }
}
