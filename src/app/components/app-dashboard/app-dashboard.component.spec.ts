import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { ToTimePipe } from '../../pipes/to-time.pipe';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { StatsService } from '../../services/stats.service';
import { AppDashboardComponent } from './app-dashboard.component';

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

    it('should see dashboard', () => {
      fixture.detectChanges();
      const de = fixture.debugElement.query(By.css('h1'));
      expect(de.nativeElement.textContent).toContain('Dashboard');
    });
  });

});
