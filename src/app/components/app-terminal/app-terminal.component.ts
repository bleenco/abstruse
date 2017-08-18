import { Component, ElementRef, OnInit, Input, SimpleChange, EventEmitter } from '@angular/core';
import * as AnsiUp from 'ansi_up';

@Component({
  selector: 'app-terminal',
  templateUrl: 'app-terminal.component.html'
})
export class AppTerminalComponent implements OnInit {
  @Input() data: any;
  @Input() options: { size: 'normal' | 'large' };
  au: any;
  commands: { command: string, visible: boolean, output: string }[];

  constructor(private elementRef: ElementRef) {
    this.commands = [];
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

    if (typeof this.data.clear !== 'undefined') {
      this.commands = [];
    } else {
      const output: string = this.au.ansi_to_html(this.data);
      const regex = /==[&gt;|>](.*)/g;
      let match;
      let commands: string[] = [];

      if (output.match(regex)) {
        while (match = regex.exec(output)) { commands.push(match[0]); }

        if (commands.length > 1) {
          this.commands = [];
        }

        this.commands = commands.reduce((acc, curr, i) => {
          let next = commands[i + 1] || '';
          next = next.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
          const c = curr.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
          let re = new RegExp('(' + c + ')(' + '[\\s\\S]+' + ')(' + next + ')');
          if (!output.match(re)) {
            re = new RegExp('(' + c + ')' + '[\\s\\S]+');
          }

          return acc.concat({
            command: curr.trim(),
            visible: i === commands.length - 1 ? true : false,
            output: output.match(re) && output.match(re)[2] ? output.match(re)[2].trim() : ''
          });
        }, this.commands);
      } else {
        this.commands[this.commands.length - 1].output += output;
      }

      this.commands = this.commands.map((cmd, i) => {
        cmd.visible = i === this.commands.length - 1 ? true : false;
        return cmd;
      });
    }

    this.checkScrollBottom();
  }

  checkScrollBottom(): void {
    // TODO: make this work actually
    // const element = window.document.documentElement;
    // if (element.scrollTop + element.clientHeight == element.scrollHeight) {
      window.scrollTo(0, document.body.scrollHeight);
    // }
  }

  toogleCommand(index: number) {
    this.commands[index].visible = !this.commands[index].visible;
  }
}
