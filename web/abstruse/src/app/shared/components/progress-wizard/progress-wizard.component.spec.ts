import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressWizardComponent } from './progress-wizard.component';

describe('ProgressWizardComponent', () => {
  let component: ProgressWizardComponent;
  let fixture: ComponentFixture<ProgressWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
