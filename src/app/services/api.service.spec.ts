import { async, inject, TestBed } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { HttpModule, Http, XHRBackend, Response, ResponseOptions } from '@angular/http';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs/Observable';
import { ApiService } from './api.service';

describe('API Service (mockBackend)', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule, RouterTestingModule ],
      providers: [
        ApiService,
        { provide: XHRBackend, useClass: MockBackend }
      ]
    })
    .compileComponents();
  }));

  it('can instantiate service when inject service', inject([ApiService], (service: ApiService) => {
    expect(service instanceof ApiService).toBe(true);
  }));

  it('can instantiate service with "new"', inject([Http, Router], (http: Http, router: Router) => {
    expect(http).not.toBeNull('http should be provided');
    let service = new ApiService(http, router);
    expect(service instanceof ApiService).toBe(true, 'new service should be ok');
  }));

  it('can provide the mockBackend as XHRBackend', inject([XHRBackend], (backend: MockBackend) => {
    expect(backend).not.toBeNull('backend should be provided');
  }));

});
