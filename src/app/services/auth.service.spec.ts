import { async, inject, TestBed } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { HttpModule, XHRBackend } from '@angular/http';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { SocketService } from './socket.service';

describe('Auth Service (mockBackend)', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule, RouterTestingModule ],
      providers: [
        ApiService,
        AuthService,
        SocketService,
        { provide: XHRBackend, useClass: MockBackend }
      ]
    })
    .compileComponents();
  }));

  it('can instantiate service when inject service', inject([AuthService], (service: AuthService) => {
    expect(service instanceof AuthService).toBe(true);
  }));

  it('can instantiate service with "new"', inject([ApiService, SocketService, Router], (api: ApiService, socket: SocketService, router: Router) => {
    expect(api).not.toBeNull('Api service should be provided');
    let service = new AuthService(api, socket, router);
    expect(service instanceof AuthService).toBe(true, 'new service should be ok');
  }));

  it('can provide the mockBackend as XHRBackend', inject([XHRBackend], (backend: MockBackend) => {
    expect(backend).not.toBeNull('backend should be provided');
  }));

  describe('when getBuilds', () => {
    let service: AuthService;

    beforeEach(inject([ApiService, SocketService, Router], (api: ApiService, socket: SocketService, router: Router) => {
      service = new AuthService(api, socket, router);
    }));

    it('can add new user', async(inject([ApiService, SocketService, Router], (api: ApiService, socket: SocketService, router: Router) => {
      let user = { email: 'test@gmail.com', fullname: 'test', password: 'test', confirmPassword: 'test', admin: 0 };

      return service.addNewUser(user)
        .then(res => expect(res).toBe(true));
    })));

    it('should return null when getting user data', inject([ApiService, SocketService, Router], (api: ApiService, socket: SocketService, router: Router) => {
      spyOn(localStorage, 'getItem').and.callFake(() => null);
      expect(service.getData()).toBeNull();
    }));

    it('should return false when checking if user is logged in',
      inject([ApiService, SocketService, Router], (api: ApiService, socket: SocketService, router: Router) => {
        spyOn(localStorage, 'getItem').and.callFake(() => null);
        service.logout();
        expect(service.isLoggedIn()).toBe(false);
    }));

    it('should return true when checkng if user is logged in after login call',
      inject([ApiService, SocketService, Router], (api: ApiService, socket: SocketService, router: Router) => {
        service.login('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikpva'
        + 'G4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ');
        spyOn(localStorage, 'getItem').and.callFake(() => {
          return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikpva'
          + 'G4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
        });
        expect(service.isLoggedIn()).toBe(true);
    }));

  });

});
