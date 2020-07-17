import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Component, ViewChild } from '@angular/core';

import { AvatarPickerComponent } from './avatar-picker.component';

@Component({
  selector: 'app-host-component',
  template: `<app-avatar-picker [values]="data" [(ngModel)]="model"></app-avatar-picker>`
})
class TestHostComponent {
  @ViewChild(AvatarPickerComponent, /* TODO: add static flag */ {}) avatarPickerComponent: AvatarPickerComponent;
  data: string[] = ['/assets/images/icons/spinner.svg', '/assets/images/icons/spinner-green.svg'];
  model: string;
}

describe('AvatarPickerComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [AvatarPickerComponent, TestHostComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize first value from input values on init', () => {
    fixture.detectChanges();
    expect(component.avatarPickerComponent.value).toEqual('/assets/images/icons/spinner.svg');
    expect(component.avatarPickerComponent.innerValue).toEqual('/assets/images/icons/spinner.svg');
  });

  it('should have picker popup closed on init', () => {
    fixture.detectChanges();
    const popup = fixture.debugElement.nativeElement.querySelector('.avatars-picker');
    expect(component.avatarPickerComponent.isOpened).toBeFalsy();
    expect(popup).toBeFalsy();
  });

  it('should open picker popup when clicking on main avatar image', async(() => {
    fixture.detectChanges();
    const avatar = fixture.debugElement.nativeElement.querySelector('.avatar-image');
    avatar.click();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const popup = fixture.debugElement.nativeElement.querySelector('.avatars-picker');
      expect(component.avatarPickerComponent.isOpened).toBeTruthy();
      expect(popup).toBeTruthy();
    });
  }));

  it('should close picker popup when clicking on close icon', async(() => {
    fixture.detectChanges();
    const avatar = fixture.debugElement.nativeElement.querySelector('.avatar-image');
    avatar.click();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const icon = fixture.debugElement.nativeElement.querySelector('.avatars-picker .close-icon');
      icon.click();

      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const popup = fixture.debugElement.nativeElement.querySelector('.avatars-picker');
        expect(component.avatarPickerComponent.isOpened).toBeFalsy();
        expect(popup).toBeFalsy();
      });
    });
  }));

  it('should display right number of small avatars in popup', async(() => {
    fixture.detectChanges();
    const avatar = fixture.debugElement.nativeElement.querySelector('.avatar-image');
    avatar.click();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const savatars = fixture.debugElement.nativeElement.querySelectorAll('.avatars-picker .avatars-container .avatar-small');
      expect(savatars.length).toEqual(2);
    });
  }));

  it('should close picker popup when click on small avatar in popup', async(() => {
    fixture.detectChanges();
    const avatar = fixture.debugElement.nativeElement.querySelector('.avatar-image');
    avatar.click();

    fixture.whenStable().then(() => {
      fixture.detectChanges();

      const savatar = fixture.debugElement.nativeElement.querySelector('.avatars-picker .avatars-container .avatar-small:nth-child(1)');
      savatar.click();

      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const popup = fixture.debugElement.nativeElement.querySelector('.avatars-picker');
        expect(component.avatarPickerComponent.isOpened).toBeFalsy();
        expect(popup).toBeFalsy();
      });
    });
  }));

  it('should pick right avatar when clicking small avatar in popup', async(() => {
    fixture.detectChanges();
    const avatar = fixture.debugElement.nativeElement.querySelector('.avatar-image');
    avatar.click();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const savatar = fixture.debugElement.nativeElement.querySelector('.avatars-picker .avatars-container .avatar-small:nth-child(2)');
      savatar.click();

      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(component.avatarPickerComponent.value).toEqual('/assets/images/icons/spinner-green.svg');
        expect(component.avatarPickerComponent.innerValue).toEqual('/assets/images/icons/spinner-green.svg');
      });
    });
  }));

});
