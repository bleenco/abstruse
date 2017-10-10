import { NO_ERRORS_SCHEMA }          from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppEditorComponent } from './app-editor.component';
import { WindowService } from '../../services/window.service';
import { ToTimePipe } from '../../pipes/to-time.pipe';

describe('Dashboard Component', () => {
  let fixture: ComponentFixture<AppEditorComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [ AppEditorComponent, ToTimePipe ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [ WindowService ]
    })
    .createComponent(AppEditorComponent);
  });

  it('should expect editor to be null', () => {
    expect(fixture.componentInstance.editor).toBeUndefined();
  });
});
