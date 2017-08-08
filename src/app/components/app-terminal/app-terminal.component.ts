import {
  Component, ElementRef, OnInit, Input, SimpleChange, EventEmitter, NgZone } from '@angular/core';
import { ISlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';

import * as AnsiUp from 'ansi_up';

@Component({
  selector: 'app-terminal',
  templateUrl: 'app-terminal.component.html'
})
export class AppTerminalComponent implements OnInit {
  @Input() data: any;
  @Input() options: { size: 'normal' | 'large' };
  au: any;
  scrollOptions: ISlimScrollOptions;
  scrollEvents: EventEmitter<SlimScrollEvent>;
  commands: { command: string, visible: boolean, output: string }[];

  constructor(private elementRef: ElementRef, private ngZone: NgZone) {
    this.scrollOptions = {
      position: 'right',
      barBackground: '#11121A',
      barOpacity: '0.8',
      barWidth: '10',
      barBorderRadius: '10',
      barMargin: '2px 2px 2px 0',
      gridBackground: '#282a36',
      gridOpacity: '1',
      gridWidth: '10',
      gridBorderRadius: '0',
      gridMargin: '2px 2px 2px 0',
      alwaysVisible: true
    };

    this.scrollEvents = new EventEmitter<SlimScrollEvent>();
  }

  ngOnInit() {
    this.au = new AnsiUp.default();
    this.au.use_classes = true;
    this.commands = [];
  }

  ngOnChanges(changes: SimpleChange) {
    if (!this.data) {
      return;
    }

    this.ngZone.run(() => {
      const el = this.elementRef.nativeElement.querySelector('.window-terminal-container');
      if (typeof this.data.clear !== 'undefined') {
        el.innerHTML = '';
      } else {
        let output: string = this.au.ansi_to_html(this.data);
        if (output) {
          if (this.commands.length > 0) {
            if (output.indexOf('==&gt;') !== -1) {
              let command = output.split('</span>')[0] + '</span>';
              this.commands.push({
                command: command,
                visible: true,
                output: output
              });
            } else {
              this.commands[this.commands.length - 1].command += ` ${output}`;
            }
          } else {
            let regexp = /<span(.*)==&gt;/gi;
            regexp.lastIndex = 1;
            let match = regexp.exec(output);
            if (match) {
              let indexEnd = match.index;
              let indexStart = 0;
              while (indexEnd >= 0) {
                let log = output.substring(indexStart, indexEnd);
                let command = log.split('</span>')[0] + '</span>';
                this.commands.push({
                  command: command,
                  visible: true,
                  output: log
                });
                indexStart = indexEnd;
                indexEnd = regexp.exec(output).index;
              }
            }
          }
        }

        const recalculateEvent = new SlimScrollEvent({ type: 'recalculate' });
        const bottomEvent = new SlimScrollEvent({ type: 'scrollToBottom', duration: 300 });

        setTimeout(() => el.scrollTop = el.scrollHeight);
      }
    });
  }

  toogleCommand(index: number) {
    this.commands[index].visible = !this.commands[index].visible;
  }
}
