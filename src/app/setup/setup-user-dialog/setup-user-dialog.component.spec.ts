import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupUserDialogComponent } from './setup-user-dialog.component';

describe('SetupUserDialogComponent', () => {
  let component: SetupUserDialogComponent;
  let fixture: ComponentFixture<SetupUserDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupUserDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
