import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildJobItemComponent } from './build-job-item.component';

describe('BuildJobItemComponent', () => {
  let component: BuildJobItemComponent;
  let fixture: ComponentFixture<BuildJobItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildJobItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildJobItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
