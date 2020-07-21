import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildListItemComponent } from './build-list-item.component';

describe('BuildListItemComponent', () => {
  let component: BuildListItemComponent;
  let fixture: ComponentFixture<BuildListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
