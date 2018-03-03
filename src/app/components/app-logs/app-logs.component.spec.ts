import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, inject, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpModule, Http, XHRBackend, Response, ResponseOptions } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppLogsComponent } from './app-logs.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { WindowService } from '../../services/window.service';
import { StatsService } from '../../services/stats.service';
import * as logsData from '../../../testing/xhr-data/logs.json';

describe('Logs Component', () => {
  let fixture: ComponentFixture<AppLogsComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule, HttpModule, HttpClientModule],
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

    beforeEach(inject([HttpClient, Router, XHRBackend], (http: HttpClient, router: Router, be: MockBackend) => {
      backend = be;
      fakeLogs = (<any>logsData).data;
      const optionsBuild = new ResponseOptions({ status: 200, body: { data: fakeLogs } });
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
