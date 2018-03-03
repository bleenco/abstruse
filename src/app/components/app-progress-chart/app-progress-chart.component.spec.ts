import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, inject, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpModule, Http, XHRBackend, Response, ResponseOptions } from '@angular/http';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { AppProgressChartComponent } from './app-progress-chart.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { WindowService } from '../../services/window.service';
import { StatsService } from '../../services/stats.service';

describe('Progress Chart Component', () => {
  let fixture: ComponentFixture<AppProgressChartComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule, HttpModule, HttpClientModule],
      declarations: [AppProgressChartComponent],
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
      .createComponent(AppProgressChartComponent);
  });

  it('should expect el to be undefined', () => {
    expect(fixture.componentInstance.el).toBeUndefined();
  });

  it('should expect ratio to be 0.15', () => {
    fixture.componentInstance.percent = 15;
    fixture.detectChanges();
    fixture.componentInstance.render();
    expect(fixture.componentInstance.ratio).toBe(0.15);
    const de = fixture.debugElement.query(By.css('.progress-chart'));
    expect(de.nativeElement.textContent).toContain('%');
  });
});
