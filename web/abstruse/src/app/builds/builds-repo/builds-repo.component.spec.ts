import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildsRepoComponent } from './builds-repo.component';

describe('BuildsRepoComponent', () => {
  let component: BuildsRepoComponent;
  let fixture: ComponentFixture<BuildsRepoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildsRepoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildsRepoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
