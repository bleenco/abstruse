import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { inject, async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpModule, Http, XHRBackend, Response, ResponseOptions } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { of } from 'rxjs/observable/of';

import { AppRepositoryComponent } from './app-repository.component';
import { AppHeaderComponent } from '../app-header/app-header.component';
import { AppToggleComponent } from '../app-toggle/app-toggle.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { NgUploaderModule } from 'ngx-uploader';
import { Observable } from 'rxjs/Observable';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import * as buildsData from '../../../testing/xhr-data/builds.json';
import * as repositoryData from '../../../testing/xhr-data/repository.json';

const badge = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="20" style="shape-rendering:
  geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd;
  clip-rule:evenodd">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"></stop>
    <stop offset="1" stop-opacity=".1"></stop>
  </linearGradient>
  <mask id="a">
    <rect width="100" height="20" rx="3" fill="#fff"></rect>
  </mask>
  <g mask="url(#a)">
    <path fill="#333" d="M0 0h50v20H0z"></path>
    <path fill="#ffd43b" d="M50 0h50v20H50z"></path>
    <path fill="url(#b)" d="M0 0h100v20H0z"></path>
  </g>
  <g fill="#fff" font-family="Verdana,Geneva,sans-serif" font-size="10">
    <text x="4" y="15" fill="#010101" fill-opacity=".3">abstruse</text>
    <text x="4" y="14">abstruse</text>
    <text x="53" y="15" fill="#010101" fill-opacity=".3">success</text>
    <text x="53" y="14">success</text>
  </g>
</svg>
`;

describe('Repository Component', () => {
  let comp: AppRepositoryComponent;
  let fixture: ComponentFixture<AppRepositoryComponent>;

  beforeEach(async(() => {
    fixture = TestBed.configureTestingModule({
      imports: [NgUploaderModule, FormsModule, RouterTestingModule, HttpModule],
      declarations: [AppRepositoryComponent, AppHeaderComponent, AppToggleComponent, SafeHtmlPipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ApiService,
        AuthService,
        SocketService,
        ConfigService,
        NotificationService,
        { provide: XHRBackend, useClass: MockBackend },
        {
          provide: ActivatedRoute, useValue: {
            params: of({ id: 1 }), snapshot: { params: { id: 1 }, queryParams: { tab: 'builds' } }
          }
        }]
    })
      .createComponent(AppRepositoryComponent);
    comp = fixture.componentInstance;
  }));

  it('should expect loading to be true', () => {
    expect(fixture.componentInstance.loading).toBe(true);
  });

  describe('Repository Component', () => {
    let backend: MockBackend;
    let apiService: ApiService;
    let authService: AuthService;
    let socketService: SocketService;
    let responseBuilds: Response;
    let responseRepo: Response;
    let responseBadge: Response;
    let fakeBuilds: any[];
    let fakeRepository: any[];

    beforeEach(inject([Http, Router, XHRBackend], (http: Http, router: Router, be: MockBackend) => {
      fixture.componentInstance.tab = 'builds';
      backend = be;
      apiService = new ApiService(http, router);
      socketService = new SocketService();
      authService = new AuthService(apiService, socketService, router);
      fakeBuilds = (<any>buildsData).data;
      fakeRepository = (<any>repositoryData).data;
      let optionsBuilds = new ResponseOptions({ status: 200, body: { data: fakeBuilds } });
      responseBuilds = new Response(optionsBuilds);
      let optionsRepo = new ResponseOptions({ status: 200, body: { data: fakeRepository } });
      responseRepo = new Response(optionsRepo);
      let optionsBadge = new ResponseOptions({ status: 200, body: badge });
      responseBadge = new Response(optionsBadge);

      backend.connections.subscribe((c: MockConnection) => {
        if (c.request.url.indexOf('builds') !== -1) {
          c.mockRespond(responseBuilds);
        } else if (c.request.url.indexOf('badge') !== -1) {
          c.mockRespond(responseBadge);
        } else if (c.request.url.indexOf('tokens') !== -1) {
          c.mockRespond(new Response(new ResponseOptions({ status: 200, body: { data: [] } })));
        } else {
          c.mockRespond(responseRepo);
        }
      });

      spyOn(localStorage, 'getItem').and.callFake(() => {
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZ21haWwuY29tIiwiaWQiOjE'
          + 'sImZ1bGxuYW1lIjoiSm9obiBXYXluZSIsInBhc3N3b3JkIjoiY2MwM2U3NDdhNmFmYmJjYmY4YmU3NjY4YW'
          + 'NmZWJlZTUiLCJhZG1pbiI6MSwiYXZhdGFyIjoiL2F2YXRhcnMvdXNlci5zdmciLCJjcmVhdGVkX2F0IjoxN'
          + 'TA3Mjg2NDUzOTYwLCJ1cGRhdGVkX2F0IjoxNTA3Mjg2NDUzOTYwLCJpYXQiOjE1MDczMDY1NzF9.tKDsUid'
          + 'LjHKVjb9IT612yf6yMM1DtT5H9fmn5wIBdhE';
      });
    }));

    it('should get Repository Details', () => {
      return apiService.getRepository('1', '1').toPromise().then(repo => {
        if (repo) {
          expect(repo.name).toEqual('bterm');
        } else {
          Promise.reject(false);
        }
      });
    });

    it('should get Repository Details', () => {
      fixture.detectChanges();
      const de = fixture.debugElement.query(By.css('h1'));
      expect(de.nativeElement.textContent).toBe('Izak88/bterm');
    });

    it('should show Settings tab after click on settings button', () => {
      fixture.detectChanges();
      fixture.componentInstance.tab = 'settings';
      fixture.detectChanges();
      const de = fixture.debugElement.query(By.css('h2'));
      expect(de.nativeElement.textContent).toBe('Repository Settings');
    });
    it('should not be able to save settings after setting a bad api url', () => {
      const api = 'api.github.com';
      fixture.detectChanges();
      fixture.componentInstance.tab = 'settings';
      fixture.detectChanges();
      let urlInput = fixture.debugElement.query(By.css('[name="api_url"]')).nativeElement;
      urlInput.value = api;
      fixture.componentInstance.form.api_url = api;
      urlInput.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      const saveElement = fixture.debugElement.query(By.css('button[name="save-settings"]')).nativeElement;
      expect(saveElement.disabled).toBe(true);
    });
    it('should be able to save settings after setting a valid github url', () => {
      const api = 'http://api.github.com';
      fixture.detectChanges();
      fixture.componentInstance.tab = 'settings';
      fixture.detectChanges();
      let urlInput = fixture.debugElement.query(By.css('[name="api_url"]')).nativeElement;
      urlInput.value = api;
      fixture.componentInstance.form.api_url = api;
      urlInput.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      const saveElement = fixture.debugElement.query(By.css('button[name="save-settings"]')).nativeElement;
      expect(saveElement.disabled).toBe(false);
    });
    it('should be able to save settings after setting a valid github enterprise url', () => {
      const api = 'https://github.enterprise.com/api/v3';
      fixture.detectChanges();
      fixture.componentInstance.tab = 'settings';
      fixture.detectChanges();
      let urlInput = fixture.debugElement.query(By.css('[name="api_url"]')).nativeElement;
      urlInput.value = api;
      fixture.componentInstance.form.api_url = api;
      urlInput.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      const saveElement = fixture.debugElement.query(By.css('button[name="save-settings"]')).nativeElement;
      expect(saveElement.disabled).toBe(false);
    });
  });

});
