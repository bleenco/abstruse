import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoriesListItemComponent } from './repositories-list-item.component';

describe('RepositoriesListItemComponent', () => {
  let component: RepositoriesListItemComponent;
  let fixture: ComponentFixture<RepositoriesListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepositoriesListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepositoriesListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
