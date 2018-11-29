import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsIntegrationItemComponent } from './settings-integration-item.component';

describe('SettingsIntegrationItemComponent', () => {
  let component: SettingsIntegrationItemComponent;
  let fixture: ComponentFixture<SettingsIntegrationItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsIntegrationItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsIntegrationItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
