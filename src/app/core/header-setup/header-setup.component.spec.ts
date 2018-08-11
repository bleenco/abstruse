import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderSetupComponent } from './header-setup.component';

describe('HeaderSetupComponent', () => {
  let component: HeaderSetupComponent;
  let fixture: ComponentFixture<HeaderSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
