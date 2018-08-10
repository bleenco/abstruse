import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupConfigComponent } from './setup-config.component';

describe('SetupConfigComponent', () => {
  let component: SetupConfigComponent;
  let fixture: ComponentFixture<SetupConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
