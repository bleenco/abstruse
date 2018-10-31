import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Http, HttpModule, Response, ResponseOptions, XHRBackend } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import * as logsData from '../../../testing/xhr-data/logs.json';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { StatsService } from '../../services/stats.service';
import { WindowService } from '../../services/window.service';
import { AppLogsComponent } from './app-logs.component';

describe('Logs Component', () => {
  let fixture: ComponentFixture<AppLogsComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule, HttpModule],
      declarations: [AppLogsComponent],
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
      .createComponent(AppLogsComponent);
  });

  it('should expect loading to be true', () => {
    expect(fixture.componentInstance.loading).toBe(true);
  });

  it('should see h1 contains text System Logs', () => {
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.css('h1'));
    expect(de.nativeElement.textContent).toContain('System Logs');
  });

  describe('Log Component', () => {
    let backend: MockBackend;
    let responseLogs: Response;
    let fakeLogs: any[];

    beforeEach(inject([Http, Router, XHRBackend], (http: Http, router: Router, be: MockBackend) => {
      backend = be;
      fakeLogs = (<any>logsData).data;
      let optionsBuild = new ResponseOptions({ status: 200, body: { data: fakeLogs } });
      responseLogs = new Response(optionsBuild);
      backend.connections.subscribe((c: MockConnection) => c.mockRespond(responseLogs));
    }));

    it('should expect loading to be false', () => {
      fixture.detectChanges();
      expect(fixture.componentInstance.loading).toBe(false);
    });

    it('should see h1 contains text Docker Build Images', () => {
      fixture.detectChanges();
      const de = fixture.debugElement.query(By.css('h1'));
      expect(de.nativeElement.textContent).toContain('System Logs');
    });
  });
});
