import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpModule, Http, XHRBackend } from '@angular/http';
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
      declarations: [AppLoginComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [ApiService, AuthService, SocketService, { provide: XHRBackend, useClass: MockBackend }]
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
    let service: ApiService;

    beforeEach(inject([Http, Router], (http: Http, router: Router) => {
      service = new ApiService(http, router);
    }));

    it('should have Sign In <h1> after app is ready completes', async(inject([], () => {
      fixture.componentInstance.ngOnInit();

      return service.isAppReady().toPromise().then(isReady => {
        fixture.detectChanges();
        const de = fixture.debugElement.query(By.css('h1'));
        expect(de.nativeElement.textContent).toBe('Sign In');
      });
    })));
  });

});
