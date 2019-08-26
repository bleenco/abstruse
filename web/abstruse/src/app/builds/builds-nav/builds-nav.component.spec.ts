import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildsNavComponent } from './builds-nav.component';

describe('BuildsNavComponent', () => {
  let component: BuildsNavComponent;
  let fixture: ComponentFixture<BuildsNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildsNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildsNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
