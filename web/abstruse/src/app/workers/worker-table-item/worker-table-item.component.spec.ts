import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerTableItemComponent } from './worker-table-item.component';

describe('WorkerTableItemComponent', () => {
  let component: WorkerTableItemComponent;
  let fixture: ComponentFixture<WorkerTableItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkerTableItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerTableItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
