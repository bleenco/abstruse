import { Directive, Input, ElementRef, HostListener, Renderer2 } from '@angular/core';

export class TooltipOptions {
  constructor(
    public position: 'top' | 'right' | 'bottom' | 'left' | 'auto' = 'auto',
    public backgroundColor: string = '#3E3F42',
    public color: string = '#FFFFFF',
    public borderRadius: string = '4px',
    public fontSize: string = '13px',
    public lineHeight: string = '22px',
    public textAlign: string = 'center',
    public padding: string = '3px 8px'
  ) { }
}

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective {
  @Input() tooltipOptions: TooltipOptions = new TooltipOptions();

  element: HTMLElement;
  wrapper: HTMLElement;
  tooltipEl: HTMLElement;
  arrowEl: HTMLElement;
  textWidth: number;
  elementWidth: number;

  constructor(
    public el: ElementRef,
    public renderer: Renderer2
  ) {
    this.element = el.nativeElement;
    setTimeout(() => this.generateTooltip());
  }

  private generateTooltip(): void {
    const rect = this.element.getBoundingClientRect();
    this.tooltipEl = this.renderer.createElement('div');
    const text = this.renderer.createText(this.element.getAttribute('title'));
    this.textWidth = this.getTextWidth(this.element.getAttribute('title')) + 16;
    this.arrowEl = this.renderer.createElement('span');

    this.renderer.setStyle(this.arrowEl, 'display', 'block');
    this.renderer.setStyle(this.arrowEl, 'width', '10px');
    this.renderer.setStyle(this.arrowEl, 'height', '10px');
    this.renderer.setStyle(this.arrowEl, 'transform', 'rotate(-45deg)');
    this.renderer.setStyle(this.arrowEl, 'position', 'absolute');
    this.renderer.setStyle(this.arrowEl, 'bottom', '-5px');
    this.renderer.setStyle(this.arrowEl, 'background', this.tooltipOptions.backgroundColor);

    this.renderer.appendChild(this.tooltipEl, text);
    this.wrapper = this.renderer.createElement('div');
    this.renderer.setStyle(this.wrapper, 'position', 'relative');
    this.renderer.setStyle(this.wrapper, 'display', 'inline-block');
    this.renderer.setStyle(this.wrapper, 'height', `${rect.height}px`);
    this.renderer.setStyle(this.wrapper, 'overflow', 'visible');
    this.renderer.setStyle(this.wrapper, 'cursor', 'pointer');

    this.renderer.appendChild(this.tooltipEl, this.arrowEl);
    this.renderer.insertBefore(this.element.parentNode, this.wrapper, this.element);
    this.renderer.appendChild(this.wrapper, this.element);
    this.renderer.appendChild(this.wrapper, this.tooltipEl);

    this.setStyles();
    this.setPosition();
  }

  private setStyles(): void {
    this.renderer.setStyle(this.tooltipEl, 'background-color', this.tooltipOptions.backgroundColor);
    this.renderer.setStyle(this.tooltipEl, 'color', this.tooltipOptions.color);
    this.renderer.setStyle(this.tooltipEl, 'border-radius', this.tooltipOptions.borderRadius);
    this.renderer.setStyle(this.tooltipEl, 'font-size', this.tooltipOptions.fontSize);
    this.renderer.setStyle(this.tooltipEl, 'line-height', this.tooltipOptions.lineHeight);
    this.renderer.setStyle(this.tooltipEl, 'text-align', this.tooltipOptions.textAlign);
    this.renderer.setStyle(this.tooltipEl, 'padding', this.tooltipOptions.padding);
    this.renderer.setStyle(this.tooltipEl, 'z-index', 100);
    this.renderer.setStyle(this.tooltipEl, 'display', 'block');
    this.renderer.setStyle(this.tooltipEl, 'width', this.textWidth + 'px');
  }

  private setPosition(): void {
    setTimeout(() => {
      this.elementWidth = this.element.offsetWidth;
      const height = this.tooltipEl.offsetHeight;
      this.renderer.setStyle(this.tooltipEl, 'position', 'absolute');
      this.renderer.setStyle(this.tooltipEl, 'top', -(height + 12) + 'px');
      this.renderer.setStyle(this.tooltipEl, 'left', (-(this.textWidth / 2) + (this.elementWidth / 2)) + 'px');
      this.renderer.setStyle(this.arrowEl, 'left', (this.textWidth / 2 - 5) + 'px');

      setTimeout(() => this.renderer.setStyle(this.tooltipEl, 'display', 'none'));
    });
  }

  getTextWidth = (text: string) => {
    const canvas = (<any>this.getTextWidth).canvas || ((<any>this.getTextWidth).canvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    context.font = `14px Roboto`;
    const metrics = context.measureText(text);
    return metrics.width;
  }

  @HostListener('mouseenter') onMouseeEnter() {
    this.renderer.setStyle(this.tooltipEl, 'display', 'block');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(this.tooltipEl, 'display', 'none');
  }

}
