import { DebugElement, NO_ERRORS_SCHEMA }          from '@angular/core';
import { ComponentFixture, TestBed, inject, async } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { HttpModule, Http, XHRBackend, Response, ResponseOptions } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { AppToggleComponent } from './app-toggle.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { WindowService } from '../../services/window.service';
import { StatsService } from '../../services/stats.service';

describe('Toggle Component', () => {
  let fixture: ComponentFixture<AppToggleComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [ FormsModule, RouterTestingModule, HttpModule ],
      declarations: [ AppToggleComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        ApiService,
        AuthService,
        SocketService,
        ConfigService,
        NotificationService,
        WindowService,
        StatsService,
        { provide: XHRBackend, useClass: MockBackend } ]
    })
    .createComponent(AppToggleComponent);
  });

  it('should expect isEnabled to be undefined', () => {
    expect(fixture.componentInstance.isEnabled).toBeUndefined();
  });

  it('should expect isEnabled to be true', () => {
    fixture.detectChanges();
    fixture.componentInstance.writeValue(true);
    expect(fixture.componentInstance.isEnabled).toBe(true);
  });

  it('should expect isEnabled to be false after click on button', () => {
    fixture.detectChanges();
    fixture.componentInstance.writeValue(true);
    const deToken = fixture.debugElement.query(By.css('.toggle-button'));
    if (deToken instanceof HTMLElement) {
      deToken.click();
    } else {
      deToken.triggerEventHandler('click', { button: 0 });
    }
    expect(fixture.componentInstance.isEnabled).toBe(false);
  });
});
