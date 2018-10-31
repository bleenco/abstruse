import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Http, HttpModule, Response, ResponseOptions, XHRBackend } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxUploaderModule } from 'ngx-uploader';
import { of } from 'rxjs';

import * as repositoriesData from '../../../testing/xhr-data/repositories.json';
import * as userData from '../../../testing/xhr-data/user.json';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { AppHeaderComponent } from '../app-header/app-header.component';
import { AppToggleComponent } from '../app-toggle/app-toggle.component';
import { AppUserComponent } from './app-user.component';

describe('User Component', () => {
  let fixture: ComponentFixture<AppUserComponent>;

  beforeEach(async(() => {
    fixture = TestBed.configureTestingModule({
      imports: [NgxUploaderModule, FormsModule, RouterTestingModule, HttpModule],
      declarations: [AppUserComponent, AppHeaderComponent, AppToggleComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ApiService,
        AuthService,
        SocketService,
        ConfigService,
        NotificationService,
        { provide: XHRBackend, useClass: MockBackend },
        { provide: ActivatedRoute, useValue: { params: of({ id: 1 }), snapshot: { params: { id: 1 } } } }]
    })
    .createComponent(AppUserComponent);
  }));

  it('should expect loging to be true', () => {
    expect(fixture.componentInstance.loading).toBe(true);
  });

  describe('User Component', () => {
    let backend: MockBackend;
    let apiService: ApiService;
    let responseUsers: Response;
    let responseRepos: Response;
    let fakeUsers: any[];
    let fakeRepositories: any[];

    beforeEach(inject([Http, Router, XHRBackend], (http: Http, router: Router, be: MockBackend) => {
      backend = be;
      apiService = new ApiService(http, router);
      fakeUsers = (<any>userData).data;
      fakeRepositories = (<any>repositoriesData).data;
      let optionsUsers = new ResponseOptions({ status: 200, body: { data: fakeUsers } });
      responseUsers = new Response(optionsUsers);
      let optionsRepos = new ResponseOptions({ status: 200, body: { data: fakeRepositories } });
      responseRepos = new Response(optionsRepos);

      backend.connections.subscribe((c: MockConnection) => {
        if (c.request.url.indexOf('user') !== -1) {
          c.mockRespond(responseUsers);
        } else {
          c.mockRespond(responseRepos);
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

    it('should get User Details', () => {
      fixture.componentInstance.ngOnInit();
      return apiService.getUser(1).toPromise().then(user => {
        if (user) {
          expect(user.email).toEqual('john@gmail.com');
        } else {
          Promise.reject(false);
        }
      });
    });

    it('should get Repositories', () => {
      return apiService.getRepositories('', '1').toPromise().then(repositories => {
        if (repositories) {
          expect(repositories.length).toEqual(3);
        } else {
          Promise.reject(false);
        }
      });
    });

    it('should show User Profile tab', () => {
      fixture.detectChanges();
      const de = fixture.debugElement.query(By.css('h1'));
      expect(de.nativeElement.textContent).toBe('User Profile');
    });

    it('should show Permissions tab after click on third item in menu', () => {
      fixture.detectChanges();
      fixture.debugElement.query(By.css('[name="tab-permissions"]')).nativeElement.click();
      fixture.detectChanges();
      const de = fixture.debugElement.query(By.css('h1'));
      expect(de.nativeElement.textContent).toBe('Permissions');
    });

    it('should show repositories on permission tab', () => {
      fixture.detectChanges();
      fixture.debugElement.query(By.css('[name="tab-permissions"]')).nativeElement.click();
      fixture.detectChanges();
      const de = fixture.debugElement.query(By.css('h1'));
      expect(de.nativeElement.textContent).toBe('Permissions');
      expect(fixture.componentInstance.restrictedRepositories.length).toBe(0);
      expect(fixture.componentInstance.repositories.length).toBe(3);
    });
  });

});
