import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsSshModalComponent } from './settings-ssh-modal.component';

describe('SettingsSshModalComponent', () => {
  let component: SettingsSshModalComponent;
  let fixture: ComponentFixture<SettingsSshModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsSshModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsSshModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
