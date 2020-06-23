import { Directive, Input, ViewContainerRef, Renderer2, OnDestroy, HostListener } from '@angular/core';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnDestroy {
  @Input() text: string;

  el: HTMLElement;
  tooltip: HTMLElement;
  body: HTMLBodyElement;

  constructor(private viewContainerRef: ViewContainerRef, private renderer: Renderer2) {
    this.el = this.viewContainerRef.element.nativeElement;
    this.body = document.body as HTMLBodyElement;
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  setup(): void {
    this.initTooltip();
  }

  private initTooltip(): void {
    if (this.body.querySelector('.tooltip-container')) {
      return;
    }

    this.tooltip = this.renderer.createElement('div');
    this.tooltip.innerHTML = this.text;
    this.renderer.setStyle(this.tooltip, 'display', 'inline-flex');
    this.renderer.setStyle(this.tooltip, 'position', 'absolute');
    this.renderer.addClass(this.tooltip, 'tooltip-container');
    this.renderer.appendChild(this.body, this.tooltip);

    const b = this.el.getBoundingClientRect();
    const left = b.left + b.width / 2 - this.tooltip.clientWidth / 2;
    const top = b.top + window.scrollY - this.tooltip.clientHeight - 15;

    this.renderer.setStyle(this.tooltip, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
  }

  private destroy(): void {
    if (!this.body.querySelector('.tooltip-container')) {
      return;
    }
    this.body.removeChild(this.body.querySelector('.tooltip-container'));
  }

  @HostListener('mouseover', ['$event']) onMouseOver() {
    this.setup();
  }

  @HostListener('mouseout', ['$event']) onMouseOut() {
    this.destroy();
  }
}
