import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Http, HttpModule, XHRBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { AppSetupComponent } from './app-setup.component';

describe('Setup Component', () => {
  let fixture: ComponentFixture<AppSetupComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [HttpModule, FormsModule, RouterTestingModule],
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

    beforeEach(inject([Http, Router], (http: Http, router: Router) => {
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
