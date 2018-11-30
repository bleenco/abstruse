import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoriesListComponent } from './repositories-list.component';

describe('RepositoriesListComponent', () => {
  let component: RepositoriesListComponent;
  let fixture: ComponentFixture<RepositoriesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepositoriesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepositoriesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
