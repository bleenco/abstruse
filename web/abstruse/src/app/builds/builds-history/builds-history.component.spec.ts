import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildsHistoryComponent } from './builds-history.component';

describe('BuildsHistoryComponent', () => {
  let component: BuildsHistoryComponent;
  let fixture: ComponentFixture<BuildsHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildsHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
