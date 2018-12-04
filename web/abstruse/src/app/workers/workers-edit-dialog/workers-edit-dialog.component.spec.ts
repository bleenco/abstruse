import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkersEditDialogComponent } from './workers-edit-dialog.component';

describe('WorkersEditDialogComponent', () => {
  let component: WorkersEditDialogComponent;
  let fixture: ComponentFixture<WorkersEditDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkersEditDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkersEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
