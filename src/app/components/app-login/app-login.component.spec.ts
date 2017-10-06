import { NO_ERRORS_SCHEMA, EventEmitter }          from '@angular/core';
import { async, inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { HttpModule, Http, XHRBackend, Response, ResponseOptions  } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { AppLoginComponent } from './app-login.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';

describe('Login Component (mockBackend)', () => {
  let fixture: ComponentFixture<AppLoginComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [HttpModule, FormsModule, RouterTestingModule],
      declarations: [ AppLoginComponent ],
      schemas:      [ NO_ERRORS_SCHEMA ],
      providers: [ ApiService, AuthService, SocketService, { provide: XHRBackend, useClass: MockBackend } ]
    })
    .createComponent(AppLoginComponent);
  });

  it('should load component', () => {
    expect(fixture.componentInstance.loading).toBe(true);
  });

  it('should see loading image', () => {
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.css('.main-loader'));
    expect(de).not.toBeNull();
  });

  describe('Login Component', () => {
    let backend: MockBackend;
    let service: ApiService;
    let response: Response;

    beforeEach(inject([Http, Router, XHRBackend], (http: Http, router: Router, be: MockBackend) => {
      backend = be;
      service = new ApiService(http, router);
      let options = new ResponseOptions({ status: 200, body: { data: true } });
      response = new Response(options);
    }));

    it('should have Sign In <h1> after app is ready completes', async(inject([], () => {
      backend.connections.subscribe((c: MockConnection) => c.mockRespond(response));
      fixture.componentInstance.ngOnInit();

      return service.isAppReady().toPromise().then(isReady => {
        fixture.detectChanges();
        const de = fixture.debugElement.query(By.css('h1'));
        expect(de.nativeElement.textContent).toBe('Sign In');
      });
    })));
  });

});
