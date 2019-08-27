import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildsCurrentComponent } from './builds-current.component';

describe('BuildsCurrentComponent', () => {
  let component: BuildsCurrentComponent;
  let fixture: ComponentFixture<BuildsCurrentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildsCurrentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildsCurrentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
