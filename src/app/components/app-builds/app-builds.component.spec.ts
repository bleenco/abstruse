import { DebugElement, NO_ERRORS_SCHEMA, EventEmitter }          from '@angular/core';
import { inject, async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { HttpModule, Http, XHRBackend, Response, ResponseOptions } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { AppBuildsComponent } from './app-builds.component';
import { AppBuildItemComponent } from '../app-build-item/app-build-item.component';
import { AppHeaderComponent } from '../app-header/app-header.component';
import { AppToggleComponent } from '../app-toggle/app-toggle.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { NotificationService } from '../../services/notification.service';
import { TimeService } from '../../services/time.service';
import { ConfigService } from '../../services/config.service';
import { Observable } from 'rxjs/Observable';
import { ToTimePipe } from '../../pipes/to-time.pipe';
const buildsData: any = require('json-loader!../../testing/xhr-data/builds.json');

describe('Builds Component', () => {
  let comp:    AppBuildsComponent;
  let fixture: ComponentFixture<AppBuildsComponent>;

  beforeEach(async(() => {
    spyOn(localStorage, 'getItem').and.callFake(() => {
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZ21haWwuY29tIiwiaWQiOjE'
        + 'sImZ1bGxuYW1lIjoiSm9obiBXYXluZSIsInBhc3N3b3JkIjoiY2MwM2U3NDdhNmFmYmJjYmY4YmU3NjY4YW'
        + 'NmZWJlZTUiLCJhZG1pbiI6MSwiYXZhdGFyIjoiL2F2YXRhcnMvdXNlci5zdmciLCJjcmVhdGVkX2F0IjoxN'
        + 'TA3Mjg2NDUzOTYwLCJ1cGRhdGVkX2F0IjoxNTA3Mjg2NDUzOTYwLCJpYXQiOjE1MDczMDY1NzF9.tKDsUid'
        + 'LjHKVjb9IT612yf6yMM1DtT5H9fmn5wIBdhE';
    });

    fixture = TestBed.configureTestingModule({
      imports: [ FormsModule, RouterTestingModule, HttpModule ],
      declarations: [ AppBuildItemComponent, AppBuildsComponent, AppHeaderComponent, AppToggleComponent, ToTimePipe ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        ApiService,
        AuthService,
        SocketService,
        TimeService,
        NotificationService,
        ConfigService,
        { provide: XHRBackend, useClass: MockBackend },
        { provide: ActivatedRoute, useValue: { params: Observable.of({id: 1}), snapshot: { params: { id: 1 } } } } ]
    })
    .createComponent(AppBuildsComponent);
    comp = fixture.componentInstance;
  }));

  it('should expect loading to be true', () => {
    expect(fixture.componentInstance.loading).toBe(true);
  });

  describe('Builds Component', () => {
    let backend: MockBackend;
    let apiService: ApiService;
    let authService: AuthService;
    let socketService: SocketService;
    let responseBuilds: Response;
    let fakeBuilds: any[];

    beforeEach(async(inject([Http, Router, XHRBackend], (http: Http, router: Router, be: MockBackend) => {
      backend = be;
      apiService = new ApiService(http, router);
      socketService = new SocketService();
      authService = new AuthService(apiService, socketService, router);
      fakeBuilds = buildsData.data;
      let optionsBuild = new ResponseOptions({ status: 200, body: { data: fakeBuilds } });
      responseBuilds = new Response(optionsBuild);
      backend.connections.subscribe((c: MockConnection) => c.mockRespond(responseBuilds));
    })))  ;

    xit('should see build name', async(() => {
      fixture.detectChanges();
      expect(fixture.componentInstance.loading).toBe(false);
      expect(fixture.componentInstance.builds.length).toBe(5);
      const de = fixture.debugElement.query(By.css('.list-item'));
      expect(de).toContain('Builds');
    }));
  });

});
