import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { TooltipDirective } from './tooltip.directive';

@Component({
  template: `<span appTooltip [text]="text">Text</span>`
})
class TestComponent {
  text: string = 'This is tooltip content';
}

const mouseEvent = (el: HTMLElement, ev: string) => {
  el.dispatchEvent(new MouseEvent(ev, { view: window, bubbles: true, cancelable: true }));
};

describe('TooltipDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let el: HTMLElement;
  let tooltip: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, TooltipDirective]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement.query(By.css('span')).nativeElement;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });

  it('should not display tooltip initially', () => {
    tooltip = document.body.querySelector('.tooltip-container') as HTMLElement;
    expect(tooltip).toBeFalsy();
  });

  it('should display tooltip on mouseover', () => {
    mouseEvent(el, 'mouseover');
    fixture.detectChanges();
    tooltip = document.body.querySelector('.tooltip-container') as HTMLElement;
    expect(tooltip).toBeDefined();
  });

  it('should hide after mouseout', () => {
    mouseEvent(el, 'mouseover');
    fixture.detectChanges();
    tooltip = document.body.querySelector('.tooltip-container') as HTMLElement;
    expect(tooltip).toBeDefined();
    mouseEvent(el, 'mouseout');
    tooltip = document.body.querySelector('.tooltip-container') as HTMLElement;
    expect(tooltip).toBeFalsy();
  });

  it('should have right text displayed', () => {
    mouseEvent(el, 'mouseover');
    fixture.detectChanges();
    tooltip = document.body.querySelector('.tooltip-container') as HTMLElement;
    expect(tooltip.textContent).toEqual(component.text);
  });

  it('should update text when changed', () => {
    mouseEvent(el, 'mouseover');
    fixture.detectChanges();
    tooltip = document.body.querySelector('.tooltip-container') as HTMLElement;
    expect(tooltip.textContent).toEqual(component.text);
    component.text = 'This is new tooltip text';
    fixture.detectChanges();
    expect(tooltip.textContent).toEqual(component.text);
  });
});
