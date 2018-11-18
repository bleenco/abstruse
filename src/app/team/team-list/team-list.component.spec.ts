import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamListComponent } from './team-list.component';
import { LoaderComponent } from 'src/app/core/loader/loader.component';
import { TeamUserItemComponent } from '../team-user-item/team-user-item.component';
import { TeamUserDialogComponent } from '../team-user-dialog/team-user-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/widgets/confirm-dialog/confirm-dialog.component';
import { SelectboxComponent } from 'src/app/shared/widgets/selectbox/selectbox.component';
import { FormsModule } from '@angular/forms';
import { AvatarPickerComponent } from 'src/app/shared/widgets/avatar-picker/avatar-picker.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TeamListComponent', () => {
  let component: TeamListComponent;
  let fixture: ComponentFixture<TeamListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule
      ],
      declarations: [
        TeamListComponent,
        LoaderComponent,
        TeamUserItemComponent,
        TeamUserDialogComponent,
        ConfirmDialogComponent,
        SelectboxComponent,
        AvatarPickerComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
