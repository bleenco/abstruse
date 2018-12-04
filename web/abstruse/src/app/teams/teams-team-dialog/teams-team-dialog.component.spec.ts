import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsTeamDialogComponent } from './teams-team-dialog.component';

describe('TeamsTeamDialogComponent', () => {
  let component: TeamsTeamDialogComponent;
  let fixture: ComponentFixture<TeamsTeamDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamsTeamDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamsTeamDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
