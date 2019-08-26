import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildsInfoContainerComponent } from './builds-info-container.component';

describe('BuildsInfoContainerComponent', () => {
  let component: BuildsInfoContainerComponent;
  let fixture: ComponentFixture<BuildsInfoContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildsInfoContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildsInfoContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
