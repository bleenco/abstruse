import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkersListItemComponent } from './workers-list-item.component';

describe('WorkersListItemComponent', () => {
  let component: WorkersListItemComponent;
  let fixture: ComponentFixture<WorkersListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkersListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkersListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
