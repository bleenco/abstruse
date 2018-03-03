import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, inject, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpModule, Http, XHRBackend, Response, ResponseOptions } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppLineChartComponent } from './app-line-chart.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { WindowService } from '../../services/window.service';
import { StatsService } from '../../services/stats.service';
import * as jobsData from '../../../testing/xhr-data/jobs.json';

describe('Line Chart Component', () => {
  let fixture: ComponentFixture<AppLineChartComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule, HttpModule],
      declarations: [AppLineChartComponent],
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
      .createComponent(AppLineChartComponent);
  });

  it('should expect loading to be true', () => {
    expect(fixture.componentInstance.loading).toBe(true);
  });

  describe('Line Chart Component', () => {
    let backend: MockBackend;
    let apiService: ApiService;
    let authService: AuthService;
    let socketService: SocketService;
    let statsService: StatsService;
    let responseJobs: Response;
    let fakeJobs: any[];

    beforeEach(async(inject([HttpClient, Router, XHRBackend], (http: HttpClient, router: Router, be: MockBackend) => {
      backend = be;
      apiService = new ApiService(http, router);
      socketService = new SocketService();
      authService = new AuthService(apiService, socketService, router);
      statsService = new StatsService(socketService, apiService);
      fakeJobs = (<any>jobsData).data;
      const optionsBuild = new ResponseOptions({ status: 200, body: { data: fakeJobs } });
      responseJobs = new Response(optionsBuild);
      backend.connections.subscribe((c: MockConnection) => c.mockRespond(responseJobs));
    })));

    it('should see h2 contains text Jobs', async(() => {
      fixture.detectChanges();
      const de = fixture.debugElement.query(By.css('h2'));
      expect(de.nativeElement.textContent).toContain('Jobs');
    }));
  });
});
