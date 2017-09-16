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
import * as AnsiUp from 'ansi_up';

@Component({
  selector: 'app-terminal',
  templateUrl: 'app-terminal.component.html'
})
export class AppTerminalComponent implements OnInit {
  @Input() data: any;
  @Input() options: { size: 'normal' | 'large' };
  au: any;
  commands: { command: string, visible: boolean, output: string, time: string }[];
  noData: boolean;
  initScroll: boolean;

  constructor(
    private elementRef: ElementRef,
    @Inject(DOCUMENT) private document: any
  ) {
    this.commands = [];
    this.initScroll = true;
  }

  ngOnInit() {
    this.au = new AnsiUp.default();
    this.au.use_classes = true;
    this.commands = [];
    this.noData = true;
  }

  ngOnChanges(changes: SimpleChange) {
    if (!this.data) {
      return;
    }

    this.noData = false;

    if (typeof this.data.clear !== 'undefined') {
      this.commands = [];
    } else {
      const output: string = this.au.ansi_to_html(this.data);
      const regex = /==[&gt;|>](.*)/g;
      let match;
      let commands: string[] = [];

      if (output.match(regex)) {
        while (match = regex.exec(output)) {
          commands.push(match[0]);
        }

        if (commands.length > 1) {
          this.commands = [];
        }

        let retime = new RegExp('exectime.*(\\d)', 'igm');
        let times = [];
        while (match = retime.exec(output)) {
          let t = match[0].replace('exectime]: ', '').replace(/<span.*/, '');
          times.push(t);
        }

        this.commands = commands.reduce((acc, curr, i) => {
          let next = commands[i + 1] || '';
          next = next.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
          const c = curr.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
          let re = new RegExp('(' + c + ')(' + '[\\s\\S]+' + ')(' + next + ')');
          if (!output.match(re)) {
            re = new RegExp('(' + c + ')' + '[\\s\\S]+');
          }
          let retime = new RegExp('exectime.*(\\d)', 'igm');
          let t = times[i] ? parseFloat(<any>(times[i] / 10)).toFixed(0) : null;
          let time = t && parseInt(<any>t, 10);

          let out = output.match(re) && output.match(re)[2] ? output.match(re)[2].trim() : '';
          out = out.replace(/\[exectime\]: [0-9.,]+/g, '');

          return acc.concat({
            command: curr.replace('==&gt;', '').trim(),
            visible: i === commands.length - 1 ? true : false,
            output: out,
            time: times[i] ? this.getDuration(time) : null
          });
        }, this.commands);
      } else {
        if (output.includes('[exectime]')) {
          let retime = new RegExp('exectime.*(\\d)', 'igm');
          let match = output.match(retime);
          let t = match[0].replace('exectime]: ', '').replace(/<span.*/, '');
          t = t ? parseFloat(<any>(<any>t / 10)).toFixed(0) : null;
          let time = t && parseInt(<any>t, 10);

          if (this.commands[this.commands.length - 1]) {
            this.commands[this.commands.length - 1].time = time ? this.getDuration(time) : '0ms';
          }
        } else {
          if (this.commands[this.commands.length - 1]) {
            this.commands[this.commands.length - 1].output += output;
          }
        }
      }

      this.commands = this.commands.map((cmd, i) => {
        const v = i === this.commands.length - 1 || cmd.visible;
        cmd.visible = v ? true : false;
        return cmd;
      });
    }

    setTimeout(() => this.checkScrollBottom());
  }

  checkScrollBottom(): void {
    const body = this.document.body;

    if (this.initScroll) {
      window.scrollTo(0, body.scrollHeight);
      this.initScroll = false;
    } else {
      const top = window.pageYOffset || this.document.documentElement.scrollTop ||
        this.document.body.scrollTop || 0;
      const scrollHeight = this.document.body.scrollHeight;
      const clientHeight = this.document.body.clientHeight;
      const height = scrollHeight - clientHeight;
      const diff = 250;

      if (height - diff < top) {
        window.scrollTo(0, body.scrollHeight);
      }
    }
  }

  toogleCommand(index: number) {
    this.commands[index].visible = !this.commands[index].visible;
  }

  getDuration(millis: number): string {
    const dur = {};
    const units = [
      {label: 'ms', mod: 100 }, // millis
      {label: 'sec', mod: 60 },
      {label: 'min', mod: 60 },
      {label: 'h', mod: 24 },
      {label: 'd', mod: 31 }
    ];
    units.forEach(u => millis = (millis - (dur[u.label] = (millis % u.mod))) / u.mod);
    const nonZero = (u) => { return dur[u.label]; };
    dur.toString = () => {
      return units
        .reverse()
        .filter(nonZero)
        .map(u => dur[u.label] + u.label)
        .join(', ');
    };

    return dur.toString();
  }
}
