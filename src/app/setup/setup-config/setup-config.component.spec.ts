import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { getAPIURL } from '../../core/shared/shared-functions';

import { SetupConfigComponent } from './setup-config.component';
import { LoaderComponent } from '../../core/loader/loader.component';
import { SetupService } from '../shared/setup.service';

const apiURL = getAPIURL();

const httpData = {
  secret: 'defaultPassword',
  jwtSecret: 'defaultJWTSecret',
  concurrency: 10,
  idleTimeout: 360,
  jobTimeout: 3600
};

describe('SetupConfigComponent', () => {
  let component: SetupConfigComponent;
  let fixture: ComponentFixture<SetupConfigComponent>;
  let injector: TestBed;
  let service: SetupService;
  let httpMock: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, FormsModule],
      declarations: [SetupConfigComponent, LoaderComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    injector = getTestBed();
    service = injector.get(SetupService);
    httpMock = injector.get(HttpTestingController);

    const req = httpMock.expectOne(`${apiURL}/setup/config`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: httpData });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have next button enabled on init', async(() => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const button = fixture.debugElement.nativeElement.querySelector('.setup-content-bottom .button.is-green');
      expect(button.textContent).toEqual('Next');
      expect(button.disabled).toBeFalsy();
    });
  }));

  it('should have skip button disabled on init', async(() => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const button = fixture.debugElement.nativeElement.querySelector('.setup-content-bottom .button:nth-child(1)');
      expect(button.textContent).toEqual('Skip');
      expect(button.disabled).toBeTruthy();
    });
  }));

  it('should have reset button disabled on init', async(() => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const button = fixture.debugElement.nativeElement.querySelector('.buttons .button:nth-child(1)');
      expect(button.textContent).toEqual('Reset');
      expect(button.disabled).toBeTruthy();
    });
  }));

  it('should have save button disabled on init', async(() => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const button = fixture.debugElement.nativeElement.querySelector('.buttons .button:nth-child(2)');
      expect(button.textContent).toEqual('Save');
      expect(button.disabled).toBeTruthy();
    });
  }));

  it('should initialize with all the data', async(() => {
    fixture.whenStable()
      .then(() => {
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        fixture.detectChanges();
        const inputs = fixture.nativeElement.querySelectorAll('.setup-configuration-box input');
        [].forEach.call(inputs, (input: HTMLInputElement) => {
          expect(input.value).not.toEqual('');
        });
      });
  }));

  it('should change some model value on form update', async(() => {
    fixture.whenStable()
      .then(() => {
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        fixture.detectChanges();
        const concurrencyInput = fixture.nativeElement.querySelector('.setup-configuration-box input[name="concurrency"]');
        expect(concurrencyInput.value).toEqual('10');
        expect(service.config.concurrency).toEqual(10);

        concurrencyInput.value = '4';
        concurrencyInput.dispatchEvent(new Event('input'));
      })
      .then(() => {
        fixture.detectChanges();
        const concurrencyInput = fixture.nativeElement.querySelector('.setup-configuration-box input[name="concurrency"]');
        expect(concurrencyInput.value).toEqual('4');
        expect(service.config.concurrency).toEqual(4);
      });
  }));

  it('should enable reset button on form update', async(() => {
    fixture.whenStable()
      .then(() => {
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        fixture.detectChanges();
        const concurrencyInput = fixture.nativeElement.querySelector('.setup-configuration-box input[name="concurrency"]');
        concurrencyInput.value = '4';
        concurrencyInput.dispatchEvent(new Event('input'));
      })
      .then(() => {
        fixture.detectChanges();
        const button = fixture.debugElement.nativeElement.querySelector('.buttons .button:nth-child(1)');
        expect(button.textContent).toEqual('Reset');
        expect(button.disabled).toBeFalsy();
      });
  }));

  it('should enable save button on form update', async(() => {
    fixture.whenStable()
      .then(() => {
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        fixture.detectChanges();
        const concurrencyInput = fixture.nativeElement.querySelector('.setup-configuration-box input[name="concurrency"]');
        concurrencyInput.value = '4';
        concurrencyInput.dispatchEvent(new Event('input'));
      })
      .then(() => {
        fixture.detectChanges();
        const button = fixture.debugElement.nativeElement.querySelector('.buttons .button:nth-child(2)');
        expect(button.textContent).toEqual('Save');
        expect(button.disabled).toBeFalsy();
      });
  }));

  it('should disable next button on form update and changes are not saved', async(() => {
    fixture.whenStable()
      .then(() => {
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        fixture.detectChanges();
        const concurrencyInput = fixture.nativeElement.querySelector('.setup-configuration-box input[name="concurrency"]');
        concurrencyInput.value = '4';
        concurrencyInput.dispatchEvent(new Event('input'));
      })
      .then(() => {
        fixture.detectChanges();
        const button = fixture.debugElement.nativeElement.querySelector('.setup-content-bottom .button.is-green');
        expect(button.textContent).toEqual('Next');
        expect(button.disabled).toBeTruthy();
      });
  }));

  it('should have disabled save button on invalid form', async(() => {
    fixture.whenStable()
      .then(() => {
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        fixture.detectChanges();
        const concurrencyInput = fixture.nativeElement.querySelector('.setup-configuration-box input[name="concurrency"]');
        concurrencyInput.value = '';
        concurrencyInput.dispatchEvent(new Event('input'));
      })
      .then(() => {
        fixture.detectChanges();
        const button = fixture.debugElement.nativeElement.querySelector('.buttons .button:nth-child(2)');
        expect(button.textContent).toEqual('Save');
        expect(button.disabled).toBeTruthy();
      });
  }));

  it('should generate new random secret', async(() => {
    fixture.whenStable()
      .then(() => {
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        fixture.detectChanges();
        const secretInput = fixture.nativeElement.querySelector('.setup-configuration-box input[name="secret"]');
        expect(secretInput.value).toEqual(httpData.secret);
        const columns = fixture.nativeElement.querySelectorAll('.setup-configuration-box .column.is-6');
        const button = columns[0].querySelector('.input-right-icon');
        button.click();
      })
      .then(() => {
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        const secretInput = fixture.nativeElement.querySelector('.setup-configuration-box input[name="secret"]');
        expect(secretInput.value).not.toEqual(httpData.secret);
        expect(secretInput.value.length).toEqual(10);
      });
  }));

  it('should generate new random JWT secret', async(() => {
    fixture.whenStable()
      .then(() => {
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        fixture.detectChanges();
        const jwtSecretInput = fixture.nativeElement.querySelector('.setup-configuration-box input[name="jwtSecret"]');
        expect(jwtSecretInput.value).toEqual(httpData.jwtSecret);
        const columns = fixture.nativeElement.querySelectorAll('.setup-configuration-box .column.is-6');
        const button = columns[1].querySelector('.input-right-icon');
        button.click();
      })
      .then(() => {
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        const jwtSecretInput = fixture.nativeElement.querySelector('.setup-configuration-box input[name="jwtSecret"]');
        expect(jwtSecretInput.value).not.toEqual(httpData.jwtSecret);
        expect(jwtSecretInput.value.length).toEqual(10);
      });
  }));
});
