import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobListItemComponent } from './job-list-item.component';

describe('JobListItemComponent', () => {
  let component: JobListItemComponent;
  let fixture: ComponentFixture<JobListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
