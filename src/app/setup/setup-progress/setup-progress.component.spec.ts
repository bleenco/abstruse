import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupProgressComponent } from './setup-progress.component';

describe('SetupProgressComponent', () => {
  let component: SetupProgressComponent;
  let fixture: ComponentFixture<SetupProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
