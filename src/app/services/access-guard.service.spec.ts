import { async, inject, TestBed } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { HttpModule, XHRBackend } from '@angular/http';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { AccessGuard } from './access-guard.service';
import { SocketService } from './socket.service';

describe('Access Guard Service', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule, RouterTestingModule ],
      providers: [
        ApiService,
        AuthService,
        AccessGuard,
        SocketService,
        { provide: XHRBackend, useClass: MockBackend }
      ]
    })
    .compileComponents();
  }));

  it('can instantiate service when inject service', inject([AccessGuard], (service: AccessGuard) => {
    expect(service instanceof AccessGuard).toBe(true);
  }));

  describe('AccessGuard Service', () => {
    let service: AccessGuard;

    beforeEach(inject([ApiService, AuthService, Router], (api: ApiService, auth: AuthService, router: Router) => {
      service = new AccessGuard(api, auth, router);
    }));

    it('expect canActivate function to be defined', () => {
      expect(service.canActivate).toBeDefined();
    });
  });
});
