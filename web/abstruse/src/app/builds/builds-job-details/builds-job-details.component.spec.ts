import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildsJobDetailsComponent } from './builds-job-details.component';

describe('BuildsJobDetailsComponent', () => {
  let component: BuildsJobDetailsComponent;
  let fixture: ComponentFixture<BuildsJobDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildsJobDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildsJobDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
