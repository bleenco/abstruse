import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpModule, XHRBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { StatsService } from '../../services/stats.service';
import { WindowService } from '../../services/window.service';
import { AppSelectboxComponent } from './app-selectbox.component';

describe('SelectBox Component', () => {
  let fixture: ComponentFixture<AppSelectboxComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule, HttpModule],
      declarations: [AppSelectboxComponent],
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
      .createComponent(AppSelectboxComponent);
  });

  it('should expect el to be undefined', () => {
    expect(fixture.componentInstance.data).toBeUndefined();
  });

  it('should expect index to be 0', () => {
    fixture.componentInstance.data = [{ key: 'a', value: '1234' }, { key: 'b', value: '4321' }];
    fixture.componentInstance.writeValue('a');
    expect(fixture.componentInstance.index).toBe(0);
  });
});
