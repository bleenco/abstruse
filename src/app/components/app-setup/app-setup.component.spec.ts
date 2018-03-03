import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpModule, Http, XHRBackend } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { AppSetupComponent } from './app-setup.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';

describe('Setup Component', () => {
  let fixture: ComponentFixture<AppSetupComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [HttpModule, FormsModule, RouterTestingModule, HttpClientModule],
      declarations: [AppSetupComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [ApiService, AuthService, SocketService, { provide: XHRBackend, useClass: MockBackend }]
    })
      .createComponent(AppSetupComponent);
  });

  it('expect loading to be true', () => {
    expect(fixture.componentInstance.loading).toBe(true);
  });

  describe('Setup Component', () => {
    let service: ApiService;

    beforeEach(inject([HttpClient, Router], (http: HttpClient, router: Router) => {
      service = new ApiService(http, router);
    }));

    it('should see Abstruse CI Setup text when page loads', () => {
      fixture.detectChanges();
      const de = fixture.debugElement.query(By.css('h1'));
      expect(de.nativeElement.textContent).toContain('AbstruseCI Setup');
    });

    it('should have Sign In <h1> after app is ready completes (naviagets to login)', async(inject([], () => {
      fixture.componentInstance.ngOnInit();

      return service.isAppReady().toPromise().then(isReady => {
        fixture.detectChanges();
        const de = fixture.debugElement.query(By.css('h1'));
        expect(de.nativeElement.textContent).toBe('Sign In');
      });
    })));
  });

});
