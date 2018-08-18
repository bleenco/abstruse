import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildJobRunItemComponent } from './build-job-run-item.component';

describe('BuildJobRunItemComponent', () => {
  let component: BuildJobRunItemComponent;
  let fixture: ComponentFixture<BuildJobRunItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildJobRunItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildJobRunItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
