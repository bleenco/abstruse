import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsSshComponent } from './settings-ssh.component';

describe('SettingsSshComponent', () => {
  let component: SettingsSshComponent;
  let fixture: ComponentFixture<SettingsSshComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsSshComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsSshComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
