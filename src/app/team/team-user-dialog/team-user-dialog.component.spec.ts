import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamUserDialogComponent } from './team-user-dialog.component';
import { FormsModule } from '@angular/forms';
import { AvatarPickerComponent } from 'src/app/shared/widgets/avatar-picker/avatar-picker.component';
import { SelectboxComponent } from 'src/app/shared/widgets/selectbox/selectbox.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TeamUserDialogComponent', () => {
  let component: TeamUserDialogComponent;
  let fixture: ComponentFixture<TeamUserDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule
      ],
      declarations: [
        TeamUserDialogComponent,
        AvatarPickerComponent,
        SelectboxComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
