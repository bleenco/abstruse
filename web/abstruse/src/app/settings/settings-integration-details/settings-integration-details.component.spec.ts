import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsIntegrationDetailsComponent } from './settings-integration-details.component';

describe('SettingsIntegrationDetailsComponent', () => {
  let component: SettingsIntegrationDetailsComponent;
  let fixture: ComponentFixture<SettingsIntegrationDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsIntegrationDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsIntegrationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
