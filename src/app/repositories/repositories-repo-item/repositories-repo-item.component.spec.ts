import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoriesRepoItemComponent } from './repositories-repo-item.component';

describe('RepositoriesRepoItemComponent', () => {
  let component: RepositoriesRepoItemComponent;
  let fixture: ComponentFixture<RepositoriesRepoItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepositoriesRepoItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepositoriesRepoItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
