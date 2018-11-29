import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsIntegrationRepoItemComponent } from './settings-integration-repo-item.component';

describe('SettingsIntegrationRepoItemComponent', () => {
  let component: SettingsIntegrationRepoItemComponent;
  let fixture: ComponentFixture<SettingsIntegrationRepoItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsIntegrationRepoItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsIntegrationRepoItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
