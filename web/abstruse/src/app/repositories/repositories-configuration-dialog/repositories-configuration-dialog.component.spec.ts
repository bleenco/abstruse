import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoriesConfigurationDialogComponent } from './repositories-configuration-dialog.component';

describe('RepositoriesConfigurationDialogComponent', () => {
  let component: RepositoriesConfigurationDialogComponent;
  let fixture: ComponentFixture<RepositoriesConfigurationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepositoriesConfigurationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepositoriesConfigurationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
