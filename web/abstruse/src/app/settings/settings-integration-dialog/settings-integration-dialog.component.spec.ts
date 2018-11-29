import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsIntegrationDialogComponent } from './settings-integration-dialog.component';

describe('SettingsIntegrationDialogComponent', () => {
  let component: SettingsIntegrationDialogComponent;
  let fixture: ComponentFixture<SettingsIntegrationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsIntegrationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsIntegrationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
