import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { SelectboxComponent } from './selectbox.component';

const testData: { value: any,  placeholder: string }[] = [
  { value: 'ice-cream', placeholder: 'Ice cream' },
  { value: 'raspberry', placeholder: 'Raspberry' },
  { value: 'peach', placeholder: 'Peach' }
];

describe('SelectboxComponent', () => {
  let component: SelectboxComponent;
  let fixture: ComponentFixture<SelectboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ SelectboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close on toggle()', () => {
    expect(component.isOpened).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.selectbox-options-container')).toBeFalsy();

    component.toggle();
    fixture.detectChanges();
    expect(component.isOpened).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.selectbox-options-container')).toBeTruthy();

    component.toggle();
    fixture.detectChanges();
    expect(component.isOpened).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.selectbox-options-container')).toBeFalsy();
  });

  it('should have correct placeholder displayed based on selected value', () => {
    component.values = testData;
    component.value = 'raspberry';
    fixture.detectChanges();

    expect(component.placeholder).toEqual('Raspberry');
    expect(fixture.debugElement.query(By.css('.selectbox-value > span')).nativeElement.textContent).toEqual('Raspberry');

    component.value = 'ice-cream';
    fixture.detectChanges();

    expect(component.placeholder).toEqual('Ice cream');
    expect(fixture.debugElement.query(By.css('.selectbox-value > span')).nativeElement.textContent).toEqual('Ice cream');
  });

  it('should throw an error when setting value when values are not initialized', () => {
    const setValue = () => {
      component.value = 'raspberry';
    };
    expect(() => setValue()).toThrowError('no values initialized');
  });

  it('should throw an error when setting value that doesn\'t exists in initialized values', () => {
    component.values = testData;
    fixture.detectChanges();

    const setValue = () => {
      component.value = 'apple';
    };
    expect(() => setValue()).toThrowError('value does not exists');
  });

});
