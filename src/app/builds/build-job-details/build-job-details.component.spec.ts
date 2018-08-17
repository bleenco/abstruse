import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildJobDetailsComponent } from './build-job-details.component';

describe('BuildJobDetailsComponent', () => {
  let component: BuildJobDetailsComponent;
  let fixture: ComponentFixture<BuildJobDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildJobDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildJobDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
