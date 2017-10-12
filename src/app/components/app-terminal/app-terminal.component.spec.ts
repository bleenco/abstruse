import { DebugElement, NO_ERRORS_SCHEMA }          from '@angular/core';
import { ComponentFixture, TestBed, inject, async } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { HttpModule, Http, XHRBackend, Response, ResponseOptions } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { AppTerminalComponent } from './app-terminal.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { WindowService } from '../../services/window.service';
import { StatsService } from '../../services/stats.service';

describe('Terminal Component', () => {
  let fixture: ComponentFixture<AppTerminalComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [ FormsModule, RouterTestingModule, HttpModule ],
      declarations: [ AppTerminalComponent ],
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
    .createComponent(AppTerminalComponent);
  });

  it('should expect noData to be undefined', () => {
    expect(fixture.componentInstance.noData).toBeUndefined();
  });

  it('should expect noData to be true', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance.noData).toBe(true);
  });

  it('should expect duration to convert into human readable string', () => {
    fixture.detectChanges();
    const duration = fixture.componentInstance.getDuration(2142412421421);
    expect(duration).toBe('26d, 9h, 36min, 54sec, 21ms');
  });
});
