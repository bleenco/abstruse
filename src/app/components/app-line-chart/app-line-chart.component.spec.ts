import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Http, HttpModule, Response, ResponseOptions, XHRBackend } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import * as jobsData from '../../../testing/xhr-data/jobs.json';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { StatsService } from '../../services/stats.service';
import { WindowService } from '../../services/window.service';
import { AppLineChartComponent } from './app-line-chart.component';

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
    let responseJobs: Response;
    let fakeJobs: any[];

    beforeEach(async(inject([Http, Router, XHRBackend], (http: Http, router: Router, be: MockBackend) => {
      backend = be;
      fakeJobs = (<any>jobsData).data;
      let optionsBuild = new ResponseOptions({ status: 200, body: { data: fakeJobs } });
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
