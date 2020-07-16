import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerListItemComponent } from './worker-list-item.component';

describe('WorkerListItemComponent', () => {
  let component: WorkerListItemComponent;
  let fixture: ComponentFixture<WorkerListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkerListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
