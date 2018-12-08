import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardIndexComponent } from './dashboard-index.component';

describe('DashboardIndexComponent', () => {
  let component: DashboardIndexComponent;
  let fixture: ComponentFixture<DashboardIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
