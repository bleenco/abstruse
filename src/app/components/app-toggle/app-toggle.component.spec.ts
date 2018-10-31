import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpModule, XHRBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { StatsService } from '../../services/stats.service';
import { WindowService } from '../../services/window.service';
import { AppToggleComponent } from './app-toggle.component';

describe('Toggle Component', () => {
  let fixture: ComponentFixture<AppToggleComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule, HttpModule],
      declarations: [AppToggleComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ApiService,
        AuthService,
        SocketService,
        ConfigService,
        NotificationService,
        WindowService,
        StatsService,
        { provide: XHRBackend, useClass: MockBackend }]
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
