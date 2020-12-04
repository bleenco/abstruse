import { Directive, Input, ViewContainerRef, Renderer2, OnDestroy, HostListener, OnChanges } from '@angular/core';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnChanges, OnDestroy {
  @Input() text!: string | null;

  el: HTMLElement;
  tooltip!: HTMLElement;
  body: HTMLBodyElement;

  constructor(private viewContainerRef: ViewContainerRef, private renderer: Renderer2) {
    this.el = this.viewContainerRef.element.nativeElement;
    this.body = document.body as HTMLBodyElement;
  }

  ngOnChanges(): void {
    const container = this.body.querySelector('.tooltip-container') as HTMLElement;
    if (container && this.text) {
      container.innerHTML = this.text;
    }
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

    this.setBodyPosition();

    this.tooltip = this.renderer.createElement('div');
    this.tooltip.innerHTML = this.text as string;
    this.renderer.setStyle(this.tooltip, 'display', 'inline-flex');
    this.renderer.setStyle(this.tooltip, 'position', 'absolute');
    this.renderer.addClass(this.tooltip, 'tooltip-container');
    this.renderer.appendChild(this.body, this.tooltip);

    const b = this.el.getBoundingClientRect();
    const left = b.left + window.scrollX + b.width / 2 - this.tooltip.clientWidth / 2;
    const top = b.top + window.scrollY - this.tooltip.clientHeight - 15;

    this.renderer.setStyle(this.tooltip, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
  }

  private setBodyPosition(): void {
    const style = getComputedStyle(this.body);
    if (style.position !== 'relative') {
      this.renderer.setStyle(this.body, 'position', 'relative');
    }
  }

  private destroy(): void {
    const container = this.body.querySelector('.tooltip-container') as HTMLElement;
    if (container) {
      this.body.removeChild(container);
    }
  }

  @HostListener('mouseover', ['$event']) onMouseOver(): void {
    this.setup();
  }

  @HostListener('mouseout', ['$event']) onMouseOut(): void {
    this.destroy();
  }
}
