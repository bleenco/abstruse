import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildsRepoInfoComponent } from './builds-repo-info.component';

describe('BuildsRepoInfoComponent', () => {
  let component: BuildsRepoInfoComponent;
  let fixture: ComponentFixture<BuildsRepoInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildsRepoInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildsRepoInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
