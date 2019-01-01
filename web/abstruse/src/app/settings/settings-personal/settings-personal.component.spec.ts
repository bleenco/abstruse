import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsPersonalComponent } from './settings-personal.component';

describe('SettingsPersonalComponent', () => {
  let component: SettingsPersonalComponent;
  let fixture: ComponentFixture<SettingsPersonalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsPersonalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
