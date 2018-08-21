import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SetupUserDialogComponent } from './setup-user-dialog.component';
import { AvatarPickerComponent } from '../../shared/widgets/avatar-picker/avatar-picker.component';
import { SelectboxComponent } from '../../shared/widgets/selectbox/selectbox.component';

import { AuthService } from '../../shared/providers/auth.service';

describe('SetupUserDialogComponent', () => {
  let component: SetupUserDialogComponent;
  let fixture: ComponentFixture<SetupUserDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [SetupUserDialogComponent, AvatarPickerComponent, SelectboxComponent],
      providers: [AuthService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
