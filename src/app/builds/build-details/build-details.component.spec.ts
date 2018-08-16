import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildDetailsComponent } from './build-details.component';

describe('BuildDetailsComponent', () => {
  let component: BuildDetailsComponent;
  let fixture: ComponentFixture<BuildDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
