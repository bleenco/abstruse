import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpModule, Http } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { AppDashboardComponent } from './app-dashboard.component';
import { StatsService } from '../../services/stats.service';
import { SocketService } from '../../services/socket.service';
import { ApiService } from '../../services/api.service';
import { ToTimePipe } from '../../pipes/to-time.pipe';

describe('Dashboard Component', () => {
  let fixture: ComponentFixture<AppDashboardComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule, HttpModule],
      declarations: [AppDashboardComponent, ToTimePipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ApiService,
        SocketService,
        StatsService]
    })
      .createComponent(AppDashboardComponent);
  });

  it('should expect loading to be true', () => {
    expect(fixture.componentInstance.loading).toBe(true);
  });

  describe('Dashboard Component', () => {
    let service: StatsService;
    let apiService: ApiService;
    let socketService: SocketService;

    beforeEach(inject([Http, Router], (http: Http, router: Router) => {
      apiService = new ApiService(http, router);
      socketService = new SocketService();
      service = new StatsService(socketService, apiService);
    }));

    it('should see dashboard', () => {
      fixture.detectChanges();
      const de = fixture.debugElement.query(By.css('h1'));
      expect(de.nativeElement.textContent).toContain('Dashboard');
    });
  });

});
