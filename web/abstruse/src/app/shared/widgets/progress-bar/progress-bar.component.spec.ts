import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ProgressBarComponent } from './progress-bar.component';
import { defaultProgressBarSettings, ProgressBarSettings } from './progress-bar.interface';
import { Component } from '@angular/core';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ProgressBarComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should have default options', () => {
    expect(component.options).toEqual(defaultProgressBarSettings);
  });

  it('should have default style class defined', () => {
    const options: ProgressBarSettings = defaultProgressBarSettings;
    const defaultClass = `is-${options.color}`;
    const container: HTMLElement = fixture.debugElement.query(By.css('.progress-bar-container'))
      .nativeElement;
    expect(container.classList.contains(defaultClass)).toBeTruthy();
  });

  it('should have default transition defined', () => {
    const options: ProgressBarSettings = defaultProgressBarSettings;
    const bar: HTMLElement = fixture.debugElement.query(By.css('.progress-bar')).nativeElement;
    expect(bar.style.transitionDuration).toEqual(`${String(options.transitionDuration)}ms`);
    expect(bar.style.transitionProperty).toEqual('width');
    expect(bar.style.transitionTimingFunction).toEqual('ease-in-out');
    expect(bar.style.transitionDelay).toEqual('0s');
  });
});

describe('ProgressBarComponent under TestComponent', () => {
  let testComponent: TestComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let container: HTMLElement;
  let bar: HTMLElement;
  let text: HTMLElement;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ProgressBarComponent, TestComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    testFixture = TestBed.createComponent(TestComponent);
    testComponent = testFixture.componentInstance;
    testFixture.detectChanges();
    container = testFixture.debugElement.query(By.css('.progress-bar-container')).nativeElement;
    bar = testFixture.debugElement.query(By.css('.progress-bar')).nativeElement;
  });

  it('should have placeholders text initially', () => {
    text = testFixture.debugElement.query(By.css('.progress-text')).nativeElement;
    expect(text.textContent).toBe('Usage');
  });

  it('should still have placeholder text even if percent assigned', () => {
    testComponent.percent = 32;
    testFixture.detectChanges();
    text = testFixture.debugElement.query(By.css('.progress-text')).nativeElement;
    expect(text.innerText).toBe('Usage');
  });

  it('should have percent text after assigned', () => {
    testComponent.placeholder = '';
    testComponent.percent = 32;
    testFixture.detectChanges();
    text = testFixture.debugElement.query(By.css('.progress-text')).nativeElement;
    expect(text.innerText).toBe('32%');
  });

  it('should have different styles applied when changing that in options', () => {
    const defaultClass = `is-${testComponent.options.color}`;
    testComponent.options = { ...testComponent.options, color: 'purple' };
    testFixture.detectChanges();
    expect(container.classList.contains(defaultClass)).toBeFalsy();
    expect(container.classList.contains('is-purple')).toBeTruthy();
  });

  @Component({
    selector: 'app-test-component',
    template: `<app-progress-bar
      [options]="options"
      [placeholder]="placeholder"
      [percent]="percent"
    ></app-progress-bar>`
  })
  class TestComponent {
    percent!: number;
    placeholder = 'Usage';
    options: ProgressBarSettings = defaultProgressBarSettings;
  }
});
