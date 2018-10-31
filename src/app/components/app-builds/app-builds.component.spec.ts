import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Http, HttpModule, Response, ResponseOptions, XHRBackend } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import * as buildsData from '../../../testing/xhr-data/builds.json';
import { ToTimePipe } from '../../pipes/to-time.pipe';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { TimeService } from '../../services/time.service';
import { AppBuildItemComponent } from '../app-build-item/app-build-item.component';
import { AppBuildsComponent } from './app-builds.component';

describe('Builds Component', () => {
  let fixture: ComponentFixture<AppBuildsComponent>;

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake(() => {
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZ21haWwuY29tIiwiaWQiOjE'
        + 'sImZ1bGxuYW1lIjoiSm9obiBXYXluZSIsInBhc3N3b3JkIjoiY2MwM2U3NDdhNmFmYmJjYmY4YmU3NjY4YW'
        + 'NmZWJlZTUiLCJhZG1pbiI6MSwiYXZhdGFyIjoiL2F2YXRhcnMvdXNlci5zdmciLCJjcmVhdGVkX2F0IjoxN'
        + 'TA3Mjg2NDUzOTYwLCJ1cGRhdGVkX2F0IjoxNTA3Mjg2NDUzOTYwLCJpYXQiOjE1MDczMDY1NzF9.tKDsUid'
        + 'LjHKVjb9IT612yf6yMM1DtT5H9fmn5wIBdhE';
    });

    fixture = TestBed.configureTestingModule({
      imports: [ FormsModule, RouterTestingModule, HttpModule ],
      declarations: [ AppBuildItemComponent, AppBuildsComponent, ToTimePipe ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        ApiService,
        AuthService,
        SocketService,
        TimeService,
        { provide: XHRBackend, useClass: MockBackend } ]
    })
    .createComponent(AppBuildsComponent);
  });

  it('should expect loading to be true', () => {
    expect(fixture.componentInstance.loading).toBe(true);
  });

  describe('Builds Component', () => {
    let backend: MockBackend;
    let responseBuilds: Response;
    let fakeBuilds: any[];

    beforeEach(async(inject([Http, Router, XHRBackend], (_http: Http, _router: Router, be: MockBackend) => {
      backend = be;
      fakeBuilds = (<any>buildsData).data;
      let optionsBuild = new ResponseOptions({ status: 200, body: { data: fakeBuilds } });
      responseBuilds = new Response(optionsBuild);
      backend.connections.subscribe((c: MockConnection) => c.mockRespond(responseBuilds));
    })));

    it('should see build name', () => {
      fixture.detectChanges();
      expect(fixture.componentInstance.loading).toBe(false);
      expect(fixture.componentInstance.builds.length).toBe(5);
      const de = fixture.debugElement.query(By.css('.list-item:nth-child(1) .repo-full-name'));
      expect(de.nativeElement.textContent).toContain('Izak88/d3-bundle');
    });
  });

});
