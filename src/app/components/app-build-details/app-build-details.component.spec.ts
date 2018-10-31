import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Http, HttpModule, Response, ResponseOptions, XHRBackend } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import * as buildTagData from '../../../testing/xhr-data/build-tag.json';
import * as buildData from '../../../testing/xhr-data/build.json';
import { ToTimePipe } from '../../pipes/to-time.pipe';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { TimeService } from '../../services/time.service';
import { AppBuildDetailsComponent } from './app-build-details.component';

describe('Build Details Component', () => {
  let fixture: ComponentFixture<AppBuildDetailsComponent>;

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
      declarations: [AppBuildDetailsComponent, ToTimePipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ApiService,
        AuthService,
        SocketService,
        TimeService,
        NotificationService,
        { provide: XHRBackend, useClass: MockBackend },
        { provide: ActivatedRoute, useValue: { params: of({ id: 1 }), snapshot: { params: { id: 1 } } } }]
    })
      .createComponent(AppBuildDetailsComponent);
  });

  it('should expect loading to be true', () => {
    expect(fixture.componentInstance.loading).toBe(true);
  });

  describe('Build Details Component', () => {
    let backend: MockBackend;
    let responseBuild: Response;
    let fakeBuild: any[];

    beforeEach(inject([Http, Router, XHRBackend], (_http: Http, _router: Router, be: MockBackend) => {
      backend = be;
      fakeBuild = (<any>buildData).data;
      let optionsBuild = new ResponseOptions({ status: 200, body: { data: fakeBuild } });
      responseBuild = new Response(optionsBuild);

      backend.connections.subscribe((c: MockConnection) => c.mockRespond(responseBuild));
    }));

    it('should see build name', () => {
      fixture.componentInstance.ngOnInit();
      fixture.detectChanges();
      const de = fixture.debugElement.query(By.css('h1'));
      expect(de.nativeElement.textContent).toContain('jkuri/d3-bundle');
    });
  });

  describe('Build Details Component when pushing new Tag', () => {
    let backend: MockBackend;
    let responseBuild: Response;
    let fakeBuild: any[];

    beforeEach(inject([Http, Router, XHRBackend], (_http: Http, _router: Router, be: MockBackend) => {
      backend = be;
      fakeBuild = (<any>buildTagData).data;
      let optionsBuild = new ResponseOptions({ status: 200, body: { data: fakeBuild } });
      responseBuild = new Response(optionsBuild);

      backend.connections.subscribe((c: MockConnection) => c.mockRespond(responseBuild));
    }));

    it('should see build name', () => {
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
