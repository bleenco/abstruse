import {
  Component,
  ElementRef,
  OnInit,
  Input,
  EventEmitter,
  Output,
  SimpleChange
} from '@angular/core';
import * as hterm from 'hterm';

@Component({
  selector: 'app-terminal',
  templateUrl: 'app-terminal.component.html'
})
export class AppTerminalComponent implements OnInit {
  @Input() data: string;
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

    this.term.onTerminalReady = () => {
      let io = this.term.io.push();

      io.onTerminalResize = (col: number, row: number) => {
        this.outputData.emit({ type: 'resize', cols: col, rows: row });
      };

      this.term.prefs_.set('font-family', `Menlo, 'Lucida Console', monaco, monospace`);
      this.term.prefs_.set('font-size', 11);
      this.term.prefs_.set('background-color', '#222C3C');
      this.term.prefs_.set('foreground-color', '#7F8FA4');
      this.term.prefs_.set('cursor-color', 'transparent');
      this.term.prefs_.set('color-palette-overrides', [
        '#1d1f21',
        '#cc342b',
        '#198844',
        '#fba922',
        '#3971ed',
        '#a36ac7',
        '#3971ed',
        '#c5c8c6',
        '#969896',
        '#cc342b',
        '#198844',
        '#fba922',
        '#3971ed',
        '#a36ac7',
        '#3971ed',
        '#ffffff'
      ]);

      this.term.setWindowTitle = () => {};

      this.termReady = true;
      this.outputData.emit('ready');
    };
  }

  ngOnChanges(changes: SimpleChange) {
    if (!this.data || !this.termReady) {
      return;
    }

    requestAnimationFrame(() => this.term.io.writeUTF8(this.data));
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
      this.term.prefs_.set('background-color', 'transparent');
    });
  }
}
