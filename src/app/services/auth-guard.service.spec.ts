import { async, inject, TestBed } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { HttpModule, XHRBackend } from '@angular/http';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth-guard.service';
import { SocketService } from './socket.service';

describe('Auth Guard Service', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule, RouterTestingModule ],
      providers: [
        ApiService,
        AuthService,
        AuthGuard,
        SocketService,
        { provide: XHRBackend, useClass: MockBackend }
      ]
    })
    .compileComponents();
  }));

  it('can instantiate service when inject service', inject([AuthGuard], (service: AuthGuard) => {
    expect(service instanceof AuthGuard).toBe(true);
  }));

  describe('Auth Guard Service', () => {
    let service: AuthGuard;

    beforeEach(inject([ApiService, AuthService, Router], (api: ApiService, auth: AuthService, router: Router) => {
      service = new AuthGuard(api, auth, router);
    }));

    it('expect canActivate function to be defined', () => {
      expect(service.canActivate).toBeDefined();
    });
  });
});
