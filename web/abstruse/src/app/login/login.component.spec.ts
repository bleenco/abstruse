import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { getAPIURL } from '../core/shared/shared-functions';

import { LoginComponent } from './login.component';

const apiURL = getAPIURL();

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let injector: TestBed;
  let httpMock: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, RouterTestingModule],
      declarations: [LoginComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty login fields', () => {
    expect(component.login.email).toEqual('');
    expect(component.login.password).toEqual('');
  });

  it('should have disabled login button when one of the fields is empty', async(() => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('.button');
      expect(button.disabled).toBeTruthy();
    });
  }));

  it('should have enabled login button when both fields are filled', async(() => {
    component.login.email = 'joe@example.com';
    component.login.password = 'password';
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('.button');
      expect(button.disabled).toBeFalsy();
    });
  }));

  it('should show loading spinner inside button when authenticating', async(() => {
    component.login.email = 'joe@example.com';
    component.login.password = 'password';
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('.button');
      button.click();
      fixture.detectChanges();
      expect(component.loading).toBeTruthy();
      const spinner = button.querySelector('img');
      expect(spinner).toBeTruthy();
    });
  }));

  it('should hide text on button when authenticating', async(() => {
    component.login.email = 'joe@example.com';
    component.login.password = 'password';
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('.button');
      button.click();
      fixture.detectChanges();
      expect(component.loading).toBeTruthy();
      const spinner = button.querySelector('span');
      expect(spinner).toBeFalsy();
    });
  }));

  it('should show error message with correct text on invalid login', async(() => {
    component.login.email = 'joe@example.com';
    component.login.password = 'password';
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('.button');
      button.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const message = fixture.debugElement.query(By.css('.message.is-red'));
        expect(message).toBeTruthy();
        expect(message.nativeElement.textContent).toContain('Invalid username and password combination.');
      });

      const req = httpMock.expectOne(`${apiURL}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush({ data: false });
    });
  }));

  it('should empty both fields on invalid login', async(() => {
    component.login.email = 'joe@example.com';
    component.login.password = 'password';
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('.button');
      button.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        expect(component.login.email).toEqual('');
        expect(component.login.password).toEqual('');
      });

      const req = httpMock.expectOne(`${apiURL}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush({ data: false });
    });
  }));

  it('should focus username field input on invalid login', async(() => {
    component.login.email = 'joe@example.com';
    component.login.password = 'password';
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('.button');
      button.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const input = fixture.nativeElement.querySelector('input[name="username"]');
        setTimeout(() => expect(document.activeElement === input).toBeTruthy());
      });

      const req = httpMock.expectOne(`${apiURL}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush({ data: false });
    });
  }));
});
