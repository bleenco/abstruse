import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildItemComponent } from './build-item.component';

describe('BuildItemComponent', () => {
  let component: BuildItemComponent;
  let fixture: ComponentFixture<BuildItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
