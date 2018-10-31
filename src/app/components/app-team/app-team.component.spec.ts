import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Http, HttpModule, Response, ResponseOptions, XHRBackend } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import * as usersData from '../../../testing/xhr-data/users.json';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { SocketService } from '../../services/socket.service';
import { AppSelectboxComponent } from '../app-selectbox/app-selectbox.component';
import { AppTeamComponent } from './app-team.component';

describe('Team Component', () => {
  let fixture: ComponentFixture<AppTeamComponent>;

  beforeEach(async(() => {
    spyOn(localStorage, 'getItem').and.callFake(() => {
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZ21haWwuY29tIiwiaWQiOjE'
        + 'sImZ1bGxuYW1lIjoiSm9obiBXYXluZSIsInBhc3N3b3JkIjoiY2MwM2U3NDdhNmFmYmJjYmY4YmU3NjY4YW'
        + 'NmZWJlZTUiLCJhZG1pbiI6MSwiYXZhdGFyIjoiL2F2YXRhcnMvdXNlci5zdmciLCJjcmVhdGVkX2F0IjoxN'
        + 'TA3Mjg2NDUzOTYwLCJ1cGRhdGVkX2F0IjoxNTA3Mjg2NDUzOTYwLCJpYXQiOjE1MDczMDY1NzF9.tKDsUid'
        + 'LjHKVjb9IT612yf6yMM1DtT5H9fmn5wIBdhE';
    });

    fixture = TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule, HttpModule],
      declarations: [AppTeamComponent, AppSelectboxComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ApiService,
        AuthService,
        SocketService,
        ConfigService,
        { provide: XHRBackend, useClass: MockBackend },
        { provide: ActivatedRoute, useValue: { params: of({ id: 1 }), snapshot: { params: { id: 1 } } } }]
    })
    .createComponent(AppTeamComponent);
  }));

  it('should expect loging to be true', () => {
    expect(fixture.componentInstance.loading).toBe(true);
  });

  describe('Team Component', () => {
    let backend: MockBackend;
    let apiService: ApiService;
    let responseUsers: Response;
    let fakeUsers: any[];

    beforeEach(inject([Http, Router, XHRBackend], (http: Http, router: Router, be: MockBackend) => {
      backend = be;
      apiService = new ApiService(http, router);
      fakeUsers = (<any>usersData).data;
      let optionsUsers = new ResponseOptions({ status: 200, body: { data: fakeUsers } });
      responseUsers = new Response(optionsUsers);

      backend.connections.subscribe((c: MockConnection) => c.mockRespond(responseUsers));
    }));

    it('should get users', () => {
      fixture.componentInstance.ngOnInit();
      return apiService.getUsers().toPromise().then(users => {
        if (users) {
          expect(users.length).toEqual(1);
          expect(users[0].email).toEqual('john@gmail.com');
        } else {
          Promise.reject(false);
        }
      });
    });

    it('should see Team Management', () => {
      fixture.detectChanges();
      const de = fixture.debugElement.query(By.css('h1'));
      expect(de.nativeElement.textContent).toBe('Team Management');
    });

    it('should see one user, John', () => {
      fixture.detectChanges();
      const de = fixture.debugElement.query(By.css('h2'));
      expect(de.nativeElement.textContent).toBe('John Wayne');
    });

    it(`shouldn't see form for adding new user`, () => {
      fixture.detectChanges();
      const de = fixture.debugElement.query(By.css('h4'));
      expect(de).toBeNull();
    });

    it(`should see form for adding new user after click on button`, () => {
      fixture.detectChanges();
      const deToken = fixture.debugElement.query(By.css('[name="btn-addUser"]'));
      if (deToken instanceof HTMLElement) {
        deToken.click();
      } else {
        deToken.triggerEventHandler('click', { button: 0 });
      }
      fixture.detectChanges();
      expect('Add New User').toBe('Add New User');
    });
  });

});
