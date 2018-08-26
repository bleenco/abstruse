import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoriesRepoDetailsComponent } from './repositories-repo-details.component';

describe('RepositoriesRepoDetailsComponent', () => {
  let component: RepositoriesRepoDetailsComponent;
  let fixture: ComponentFixture<RepositoriesRepoDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepositoriesRepoDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepositoriesRepoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
