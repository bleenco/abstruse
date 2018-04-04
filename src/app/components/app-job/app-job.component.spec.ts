import { DebugElement, NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { inject, async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpModule, Http, XHRBackend, Response, ResponseOptions } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { of } from 'rxjs/observable/of';

import { AppJobComponent } from './app-job.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { TimeService } from '../../services/time.service';
import { Observable } from 'rxjs/Observable';
import { ToTimePipe } from '../../pipes/to-time.pipe';
import * as jobData from '../../../testing/xhr-data/job.json';
import * as jobTagData from '../../../testing/xhr-data/job-tag.json';

describe('Job Component', () => {
  let comp: AppJobComponent;
  let fixture: ComponentFixture<AppJobComponent>;

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
      declarations: [AppJobComponent, ToTimePipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ApiService,
        AuthService,
        SocketService,
        TimeService,
        { provide: XHRBackend, useClass: MockBackend },
        { provide: ActivatedRoute, useValue: { params: of({ id: 1 }), snapshot: { params: { id: 1 } } } }]
    })
      .createComponent(AppJobComponent);
    comp = fixture.componentInstance;
  });

  it('should expect loading to be true', () => {
    expect(fixture.componentInstance.loading).toBe(true);
  });

  describe('Job Component', () => {
    let backend: MockBackend;
    let apiService: ApiService;
    let authService: AuthService;
    let socketService: SocketService;
    let responseJob: Response;
    let fakeJob: any[];

    beforeEach(inject([Http, Router, XHRBackend], (http: Http, router: Router, be: MockBackend) => {
      backend = be;
      apiService = new ApiService(http, router);
      socketService = new SocketService();
      authService = new AuthService(apiService, socketService, router);
      fakeJob = (<any>jobData).data;
      let optionsJob = new ResponseOptions({ status: 200, body: { data: fakeJob } });
      responseJob = new Response(optionsJob);

      backend.connections.subscribe((c: MockConnection) => c.mockRespond(responseJob));
    }));

    it('should see job name', () => {
      fixture.componentInstance.ngOnInit();
      fixture.detectChanges();
      const de = fixture.debugElement.query(By.css('h1'));
      expect(de.nativeElement.textContent).toContain('jkuri/d3-bundle');
    });
  });

  describe('Job Component when pushing new tag', () => {
    let backend: MockBackend;
    let apiService: ApiService;
    let authService: AuthService;
    let socketService: SocketService;
    let responseJob: Response;
    let fakeJob: any[];

    beforeEach(inject([Http, Router, XHRBackend], (http: Http, router: Router, be: MockBackend) => {
      backend = be;
      apiService = new ApiService(http, router);
      socketService = new SocketService();
      authService = new AuthService(apiService, socketService, router);
      fakeJob = (<any>jobTagData).data;
      let optionsJob = new ResponseOptions({ status: 200, body: { data: fakeJob } });
      responseJob = new Response(optionsJob);

      backend.connections.subscribe((c: MockConnection) => c.mockRespond(responseJob));
    }));

    it('should see job name', () => {
      fixture.componentInstance.ngOnInit();
      fixture.detectChanges();
      const de = fixture.debugElement.query(By.css('h1'));
      expect(de.nativeElement.textContent).toContain('Izak88/d3-bundle');
    });

    it('should see all the correct informations', () => {
      fixture.detectChanges();
      expect(fixture.componentInstance.dateTime).not.toBeNull();
      let de = fixture.debugElement.query(By.css('[name="author-and-commited"]'));
      expect(de.nativeElement.textContent).toContain('Izak Lipnik authored and commited');
      de = fixture.debugElement.query(By.css('[name="message"]'));
      expect(de.nativeElement.textContent).toContain('add jenkins file');
      de = fixture.debugElement.query(By.css('[name="sha"]'));
      expect(de.nativeElement.textContent).toContain('1f3e9ce');
    });
  });

});
