import { Component, OnInit, Input, OnChanges, SimpleChanges, ElementRef, Renderer2 } from '@angular/core';
import { ProgressBarSettings, defaultProgressBarSettings, style } from './progress-bar.interface';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.sass']
})
export class ProgressBarComponent implements OnInit, OnChanges {
  @Input() percent = 0;
  @Input() placeholder = '';
  @Input() options!: ProgressBarSettings;

  container!: HTMLElement;
  bar!: HTMLElement;
  classes: { [key: string]: string } = {
    blue: 'is-blue',
    red: 'is-red',
    green: 'is-green',
    yellow: 'is-yellow',
    orange: 'is-orange',
    purple: 'is-purple',
    indigo: 'is-indigo',
    teal: 'is-teal',
    pink: 'is-pink'
  };

  get percentage(): string {
    return `${this.percent}%`;
  }

  get text(): string {
    return this.placeholder;
  }

  constructor(public elementRef: ElementRef, public renderer: Renderer2) {}

  ngOnInit() {
    this.container = this.elementRef.nativeElement.querySelector('.progress-bar-container') as HTMLElement;
    this.bar = this.container.querySelector('.progress-bar') as HTMLElement;
    this.initSettings();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.container || !this.bar) {
      return;
    }

    if (changes && changes.options) {
      this.initSettings();
    }
  }

  private initSettings(): void {
    this.options = { ...defaultProgressBarSettings, ...(this.options || {}) };

    Object.keys(this.classes).forEach(key => {
      this.renderer.removeClass(this.container, this.classes[key]);
    });

    this.renderer.addClass(this.container, this.classes[this.options.color as style]);
    this.renderer.setStyle(this.container, 'width', this.options.width);
    this.renderer.setStyle(this.container, 'height', this.options.height);
    if (this.options.transition) {
      this.renderer.setStyle(this.bar, 'transition', `width ${this.options.transitionDuration}ms ease-in-out`);
    } else {
      this.renderer.setStyle(this.bar, 'transition', `none`);
    }
  }
}
