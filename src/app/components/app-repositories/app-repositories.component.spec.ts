import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Http, HttpModule, Response, ResponseOptions, XHRBackend } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import * as repositoriesData from '../../../testing/xhr-data/repositories.json';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { ToTimePipe } from '../../pipes/to-time.pipe';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { TimeService } from '../../services/time.service';
import { AppBuildItemComponent } from '../app-build-item/app-build-item.component';
import { AppRepositoriesComponent } from './app-repositories.component';

describe('Repositories Component', () => {
  let fixture: ComponentFixture<AppRepositoriesComponent>;

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake(() => {
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZ21haWwuY29tIiwiaWQiOjE'
        + 'sImZ1bGxuYW1lIjoiSm9obiBXYXluZSIsInBhc3N3b3JkIjoiY2MwM2U3NDdhNmFmYmJjYmY4YmU3NjY4YW'
        + 'NmZWJlZTUiLCJhZG1pbiI6MSwiYXZhdGFyIjoiL2F2YXRhcnMvdXNlci5zdmciLCJjcmVhdGVkX2F0IjoxN'
        + 'TA3Mjg2NDUzOTYwLCJ1cGRhdGVkX2F0IjoxNTA3Mjg2NDUzOTYwLCJpYXQiOjE1MDczMDY1NzF9.tKDsUid'
        + 'LjHKVjb9IT612yf6yMM1DtT5H9fmn5wIBdhE';
    });

    fixture = TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule, HttpModule],
      declarations: [AppBuildItemComponent, AppRepositoriesComponent, ToTimePipe, SafeHtmlPipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ApiService,
        AuthService,
        SocketService,
        TimeService,
        ConfigService,
        NotificationService,
        { provide: XHRBackend, useClass: MockBackend }]
    })
      .createComponent(AppRepositoriesComponent);
  });

  it('should expect loading to be true', () => {
    expect(fixture.componentInstance.loading).toBe(true);
  });

  describe('Repositories Component', () => {
    let backend: MockBackend;
    let responseRepositories: Response;
    let fakeRepositories: any[];

    beforeEach(async(inject([Http, Router, XHRBackend], (_http: Http, _router: Router, be: MockBackend) => {
      backend = be;
      fakeRepositories = (<any>repositoriesData).data;
      let optionsRepositories = new ResponseOptions({ status: 200, body: { data: fakeRepositories } });
      responseRepositories = new Response(optionsRepositories);
      backend.connections.subscribe((c: MockConnection) => c.mockRespond(responseRepositories));
    })));

    it('should expect loading to be false', () => {
      fixture.detectChanges();
      expect(fixture.componentInstance.loading).toBe(false);
    });

    it('should see Repositories header', () => {
      fixture.detectChanges();
      const de = fixture.debugElement.query(By.css('h1'));
      expect(de.nativeElement.textContent).toContain('Repositories');
    });

    it('should see three repositories', () => {
      fixture.detectChanges();
      expect(fixture.componentInstance.repositories.length).toBe(3);
    });

    it('first repository should be bterm', () => {
      fixture.detectChanges();
      expect(fixture.componentInstance.repositories[0].name).toBe('bterm');
    });
  });
});
