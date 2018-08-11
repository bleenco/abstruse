import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildsLatestComponent } from './builds-latest.component';

describe('BuildsLatestComponent', () => {
  let component: BuildsLatestComponent;
  let fixture: ComponentFixture<BuildsLatestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildsLatestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildsLatestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
