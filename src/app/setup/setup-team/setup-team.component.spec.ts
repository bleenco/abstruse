import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { SetupTeamComponent } from './setup-team.component';
import { SetupUserDialogComponent } from '../setup-user-dialog/setup-user-dialog.component';
import { SelectboxComponent } from '../../shared/widgets/selectbox/selectbox.component';
import { AvatarPickerComponent } from '../../shared/widgets/avatar-picker/avatar-picker.component';

describe('SetupTeamComponent', () => {
  let component: SetupTeamComponent;
  let fixture: ComponentFixture<SetupTeamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, RouterTestingModule],
      declarations: [
        SetupTeamComponent,
        SelectboxComponent,
        SetupUserDialogComponent,
        AvatarPickerComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
