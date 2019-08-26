import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildsDetailsComponent } from './builds-details.component';

describe('BuildsDetailsComponent', () => {
  let component: BuildsDetailsComponent;
  let fixture: ComponentFixture<BuildsDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildsDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
