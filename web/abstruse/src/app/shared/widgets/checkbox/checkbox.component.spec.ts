import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from './checkbox.component';
import { Component } from '@angular/core';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;
  let input: HTMLInputElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [CheckboxComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    input = fixture.debugElement.query(By.css('input[type="checkbox"]')).nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should change value on click', () => {
    expect(input.checked).toBeFalsy();
    input.click();
    fixture.detectChanges();
    expect(input.checked).toBeTruthy();
  });

  it('should change value on .checkbox-label click', () => {
    const label: HTMLLabelElement = fixture.debugElement.query(By.css('.checkbox-label')).nativeElement;
    expect(input.checked).toBeFalsy();
    label.click();
    fixture.detectChanges();
    expect(input.checked).toBeTruthy();
  });

  it('should change value on .label click', () => {
    const label: HTMLLabelElement = fixture.debugElement.query(By.css('.label')).nativeElement;
    expect(input.checked).toBeFalsy();
    label.click();
    fixture.detectChanges();
    expect(input.checked).toBeTruthy();
  });

  it('should display label value when provided', () => {
    const label: HTMLLabelElement = fixture.debugElement.query(By.css('.label')).nativeElement;
    expect(label.innerText).toEqual('');
    component.label = 'Enabled';
    fixture.detectChanges();
    expect(label.innerText).toEqual('Enabled');
  });
});

describe('CheckboxComponent under TestHostComponent', () => {
  let testHostComponent: TestHostComponent;
  let testHostFixture: ComponentFixture<TestHostComponent>;
  let input: HTMLInputElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [CheckboxComponent, TestHostComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    testHostFixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = testHostFixture.componentInstance;
    input = testHostFixture.debugElement.query(By.css('input[type="checkbox"]')).nativeElement;
    testHostFixture.detectChanges();
  });

  it('should display label text', () => {
    const label: HTMLLabelElement = testHostFixture.debugElement.query(By.css('.label')).nativeElement;
    expect(label.innerText).toEqual('Enabled');
  });

  it('should display different label text when changed', () => {
    const label: HTMLLabelElement = testHostFixture.debugElement.query(By.css('.label')).nativeElement;
    expect(label.innerText).toEqual('Enabled');
    testHostComponent.label = 'Disabled';
    testHostFixture.detectChanges();
    expect(label.innerText).toEqual('Disabled');
  });

  it('should be initially checked', () => {
    expect(input.checked).toBeFalsy();
  });

  it('should change value when ngModel changed', async(() => {
    expect(input.checked).toBeFalsy();
    testHostComponent.checked = true;
    testHostFixture.detectChanges();

    testHostFixture.whenStable().then(() => {
      testHostFixture.detectChanges();
      expect(input.checked).toBeTruthy();
    });
  }));

  @Component({
    selector: 'host-component',
    template: `<app-checkbox [(ngModel)]="checked" [label]="label"></app-checkbox>`
  })
  class TestHostComponent {
    checked!: boolean;
    label = 'Enabled';
  }
});
