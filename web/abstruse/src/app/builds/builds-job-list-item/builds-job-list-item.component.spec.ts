import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildsJobListItemComponent } from './builds-job-list-item.component';

describe('BuildsJobListItemComponent', () => {
  let component: BuildsJobListItemComponent;
  let fixture: ComponentFixture<BuildsJobListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildsJobListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildsJobListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
