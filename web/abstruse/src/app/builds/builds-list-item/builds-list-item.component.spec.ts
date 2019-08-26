import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildsListItemComponent } from './builds-list-item.component';

describe('BuildsListItemComponent', () => {
  let component: BuildsListItemComponent;
  let fixture: ComponentFixture<BuildsListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildsListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildsListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
