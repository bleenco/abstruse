import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamUserItemComponent } from './team-user-item.component';

describe('TeamUserItemComponent', () => {
  let component: TeamUserItemComponent;
  let fixture: ComponentFixture<TeamUserItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamUserItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamUserItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
