import {
  Component,
  ElementRef,
  OnInit,
  Input,
  EventEmitter,
  Output,
  SimpleChange,
  Renderer
} from '@angular/core';
// import * as hterm from 'htermabstruse';
import * as xterminal from 'xterm';

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

  constructor(private elementRef: ElementRef, private renderer: Renderer) {
    this.outputData = new EventEmitter<string>();
    this.termReady = false;
  }

  ngOnInit() {
    let el = this.elementRef.nativeElement;
    let xterm: any = <any>xterminal;
    xterm.loadAddon('fit');
    this.term = new xterm({ scrollback: 3000 });

    this.term.on('open', () => {
      const colors = [
        '#2a2a2a',
        '#ff0000',
        '#79ff0f',
        '#e7bf00',
        '#396bd7',
        '#b449be',
        '#66ccff',
        '#bbbbbb',
        '#666666',
        '#ff0080',
        '#66ff66',
        '#f3d64e',
        '#709aed',
        '#db67e6',
        '#7adff2',
        '#ffffff'
      ].reverse().forEach((color: string, index: number) => {
        console.log(`.xterm-color-${index + 1}\n` + `  color: ${color}\n`);
      });

      this.termReady = true;
      this.outputData.emit('ready');
    });

    this.term.open(el.querySelector('.window-terminal-container'), true);
  }

  ngOnChanges(changes: SimpleChange) {
    if (!this.data || !this.termReady) {
      return;
    }

    if (this.data.clear) {
      this.term.reset();
    } else {
      this.term.write(this.data);
      setTimeout(() => this.term.fit());
    }
  }
}
