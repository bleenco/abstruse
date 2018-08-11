import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { getAPIURL } from '../../core/shared/shared-functions';

import { SetupCheckComponent } from './setup-check.component';
import { LoaderComponent } from '../../core/loader/loader.component';
import { SetupService } from '../shared/setup.service';

const apiURL = getAPIURL();

describe('SetupCheckComponent', () => {
  let component: SetupCheckComponent;
  let fixture: ComponentFixture<SetupCheckComponent>;
  let injector: TestBed;
  let service: SetupService;
  let httpMock: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [SetupCheckComponent, LoaderComponent],
      providers: [SetupService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    injector = getTestBed();
    service = injector.get(SetupService);
    httpMock = injector.get(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Valid Data', () => {
    beforeEach(() => {
      const httpData = {
        git: { status: true, version: '2.18.0' },
        sqlite: { status: true, version: '3.19.3' },
        docker: { status: true, version: '18.06.0-ce' },
        dockerRunning: { status: true }
      };

      const req = httpMock.expectOne(`${apiURL}/setup/status`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: httpData });
    });

    it('should display single message', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.message'));
        expect(de.length).toEqual(1);
      });
    }));

    it('should display message that everything is good', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.query(By.css('.message'));
        expect(de.nativeElement.textContent).toContain('All required software is installed and running.');
      });
    }));

    it('should display all software listed', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.software-item-column'));
        expect(de.length).toEqual(3);
      });
    }));

    it('should display Docker is running and correct version', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.software-item-column'))[0];
        const name = de.query(By.css('.column.is-7 .brand-name'));
        const version = de.query(By.css('.column.is-4 span'));
        const circle = de.query(By.css('.status-circle'));

        expect(name.nativeElement.textContent).toEqual('Docker');
        expect(version.nativeElement.textContent).toEqual('18.06.0-ce');
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-active': true }));
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-error': false }));
        expect(circle.query(By.css('.fa-check'))).toBeTruthy();
        expect(circle.query(By.css('.fa-times'))).toBeFalsy();
      });
    }));

    it('should display SQLite is installed and correct version', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.software-item-column'))[1];
        const name = de.query(By.css('.column.is-7 .brand-name'));
        const version = de.query(By.css('.column.is-4 span'));
        const circle = de.query(By.css('.status-circle'));

        expect(name.nativeElement.textContent).toEqual('SQLite3');
        expect(version.nativeElement.textContent).toEqual('3.19.3');
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-active': true }));
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-error': false }));
        expect(circle.query(By.css('.fa-check'))).toBeTruthy();
        expect(circle.query(By.css('.fa-times'))).toBeFalsy();
      });
    }));

    it('should display git is installed and correct version', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.software-item-column'))[2];
        const name = de.query(By.css('.column.is-7 .brand-name'));
        const version = de.query(By.css('.column.is-4 span'));
        const circle = de.query(By.css('.status-circle'));

        expect(name.nativeElement.textContent).toEqual('git');
        expect(version.nativeElement.textContent).toEqual('2.18.0');
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-active': true }));
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-error': false }));
        expect(circle.query(By.css('.fa-check'))).toBeTruthy();
        expect(circle.query(By.css('.fa-times'))).toBeFalsy();
      });
    }));

    it('should have next button enabled', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.query(By.css('.setup-content-bottom .button.is-large.is-green'));

        expect(de.nativeElement.textContent).toEqual('Next');
        expect(de.nativeElement.disabled).toBe(false);
      });
    }));
  });

  describe('Invalid Data - Docker not running', () => {
    beforeEach(() => {
      const httpData = {
        git: { status: true, version: '2.18.0' },
        sqlite: { status: true, version: '3.19.3' },
        docker: { status: true },
        dockerRunning: { status: false }
      };

      const req = httpMock.expectOne(`${apiURL}/setup/status`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: httpData });
    });

    it('should display single error message', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.message.is-red'));
        expect(de.length).toEqual(1);
      });
    }));

    it('should not display ok message', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.message:not(.is-red)'));
        expect(de.length).toEqual(0);
      });
    }));

    it('should display right error message', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.query(By.css('.message'));
        expect(de.nativeElement.textContent.trim()).toEqual('Docker is not running. Please start Docker daemon and hit refresh button.');
      });
    }));

    it('should display that Docker is not running status', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.software-item-column'))[0];
        const name = de.query(By.css('.column.is-7 .brand-name'));
        const version = de.query(By.css('.column.is-4 span'));
        const circle = de.query(By.css('.status-circle'));

        expect(name.nativeElement.textContent).toEqual('Docker');
        expect(version.nativeElement.textContent).toEqual('');
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-active': false }));
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-error': true }));
        expect(circle.query(By.css('.fa-check'))).toBeFalsy();
        expect(circle.query(By.css('.fa-times'))).toBeTruthy();
      });
    }));

    it('should display SQLite is installed and correct version', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.software-item-column'))[1];
        const name = de.query(By.css('.column.is-7 .brand-name'));
        const version = de.query(By.css('.column.is-4 span'));
        const circle = de.query(By.css('.status-circle'));

        expect(name.nativeElement.textContent).toEqual('SQLite3');
        expect(version.nativeElement.textContent).toEqual('3.19.3');
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-active': true }));
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-error': false }));
        expect(circle.query(By.css('.fa-check'))).toBeTruthy();
        expect(circle.query(By.css('.fa-times'))).toBeFalsy();
      });
    }));

    it('should display git is installed and correct version', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.software-item-column'))[2];
        const name = de.query(By.css('.column.is-7 .brand-name'));
        const version = de.query(By.css('.column.is-4 span'));
        const circle = de.query(By.css('.status-circle'));

        expect(name.nativeElement.textContent).toEqual('git');
        expect(version.nativeElement.textContent).toEqual('2.18.0');
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-active': true }));
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-error': false }));
        expect(circle.query(By.css('.fa-check'))).toBeTruthy();
        expect(circle.query(By.css('.fa-times'))).toBeFalsy();
      });
    }));

    it('should have next button disabled', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.query(By.css('.setup-content-bottom .button.is-large.is-green'));

        expect(de.nativeElement.textContent).toEqual('Next');
        expect(de.nativeElement.disabled).toBe(true);
      });
    }));
  });

  describe('Invalid Data - SQLite3 not installed', () => {
    beforeEach(() => {
      const httpData = {
        git: { status: true, version: '2.18.0' },
        sqlite: { status: false },
        docker: { status: true, version: '18.06.0-ce' },
        dockerRunning: { status: true }
      };

      const req = httpMock.expectOne(`${apiURL}/setup/status`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: httpData });
    });

    it('should display single error message', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.message.is-red'));
        expect(de.length).toEqual(1);
      });
    }));

    it('should not display ok message', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.message:not(.is-red)'));
        expect(de.length).toEqual(0);
      });
    }));

    it('should display right error message', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.query(By.css('.message'));
        expect(de.nativeElement.textContent.trim()).toEqual('Not installed requirement/s: SQLite3');
      });
    }));

    it('should display Docker is running and correct version', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.software-item-column'))[0];
        const name = de.query(By.css('.column.is-7 .brand-name'));
        const version = de.query(By.css('.column.is-4 span'));
        const circle = de.query(By.css('.status-circle'));

        expect(name.nativeElement.textContent).toEqual('Docker');
        expect(version.nativeElement.textContent).toEqual('18.06.0-ce');
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-active': true }));
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-error': false }));
        expect(circle.query(By.css('.fa-check'))).toBeTruthy();
        expect(circle.query(By.css('.fa-times'))).toBeFalsy();
      });
    }));

    it('should display SQLite is not installed', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.software-item-column'))[1];
        const name = de.query(By.css('.column.is-7 .brand-name'));
        const version = de.query(By.css('.column.is-4 span'));
        const circle = de.query(By.css('.status-circle'));

        expect(name.nativeElement.textContent).toEqual('SQLite3');
        expect(version.nativeElement.textContent).toEqual('');
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-active': false }));
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-error': true }));
        expect(circle.query(By.css('.fa-check'))).toBeFalsy();
        expect(circle.query(By.css('.fa-times'))).toBeTruthy();
      });
    }));

    it('should display git is installed and correct version', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.software-item-column'))[2];
        const name = de.query(By.css('.column.is-7 .brand-name'));
        const version = de.query(By.css('.column.is-4 span'));
        const circle = de.query(By.css('.status-circle'));

        expect(name.nativeElement.textContent).toEqual('git');
        expect(version.nativeElement.textContent).toEqual('2.18.0');
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-active': true }));
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-error': false }));
        expect(circle.query(By.css('.fa-check'))).toBeTruthy();
        expect(circle.query(By.css('.fa-times'))).toBeFalsy();
      });
    }));

    it('should have next button disabled', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.query(By.css('.setup-content-bottom .button.is-large.is-green'));

        expect(de.nativeElement.textContent).toEqual('Next');
        expect(de.nativeElement.disabled).toBe(true);
      });
    }));
  });

  describe('Invalid Data - git not installed', () => {
    beforeEach(() => {
      const httpData = {
        git: { status: false },
        sqlite: { status: true, version: '3.19.3' },
        docker: { status: true, version: '18.06.0-ce' },
        dockerRunning: { status: true }
      };

      const req = httpMock.expectOne(`${apiURL}/setup/status`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: httpData });
    });

    it('should display single error message', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.message.is-red'));
        expect(de.length).toEqual(1);
      });
    }));

    it('should not display ok message', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.message:not(.is-red)'));
        expect(de.length).toEqual(0);
      });
    }));

    it('should display right error message', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.query(By.css('.message'));
        expect(de.nativeElement.textContent.trim()).toEqual('Not installed requirement/s: Git');
      });
    }));

    it('should display Docker is running and correct version', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.software-item-column'))[0];
        const name = de.query(By.css('.column.is-7 .brand-name'));
        const version = de.query(By.css('.column.is-4 span'));
        const circle = de.query(By.css('.status-circle'));

        expect(name.nativeElement.textContent).toEqual('Docker');
        expect(version.nativeElement.textContent).toEqual('18.06.0-ce');
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-active': true }));
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-error': false }));
        expect(circle.query(By.css('.fa-check'))).toBeTruthy();
        expect(circle.query(By.css('.fa-times'))).toBeFalsy();
      });
    }));

    it('should display SQLite is installed and correct version', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.software-item-column'))[1];
        const name = de.query(By.css('.column.is-7 .brand-name'));
        const version = de.query(By.css('.column.is-4 span'));
        const circle = de.query(By.css('.status-circle'));

        expect(name.nativeElement.textContent).toEqual('SQLite3');
        expect(version.nativeElement.textContent).toEqual('3.19.3');
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-active': true }));
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-error': false }));
        expect(circle.query(By.css('.fa-check'))).toBeTruthy();
        expect(circle.query(By.css('.fa-times'))).toBeFalsy();
      });
    }));

    it('should display git is not installed', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.software-item-column'))[2];
        const name = de.query(By.css('.column.is-7 .brand-name'));
        const version = de.query(By.css('.column.is-4 span'));
        const circle = de.query(By.css('.status-circle'));

        expect(name.nativeElement.textContent).toEqual('git');
        expect(version.nativeElement.textContent).toEqual('');
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-active': false }));
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-error': true }));
        expect(circle.query(By.css('.fa-check'))).toBeFalsy();
        expect(circle.query(By.css('.fa-times'))).toBeTruthy();
      });
    }));

    it('should have next button disabled', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.query(By.css('.setup-content-bottom .button.is-large.is-green'));

        expect(de.nativeElement.textContent).toEqual('Next');
        expect(de.nativeElement.disabled).toBe(true);
      });
    }));
  });

  describe('Invalid Data - nothing is intalled', () => {
    beforeEach(() => {
      const httpData = {
        git: { status: false },
        sqlite: { status: false },
        docker: { status: false },
        dockerRunning: { status: false }
      };

      const req = httpMock.expectOne(`${apiURL}/setup/status`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: httpData });
    });

    it('should display single error message', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.message.is-red'));
        expect(de.length).toEqual(1);
      });
    }));

    it('should not display ok message', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.message:not(.is-red)'));
        expect(de.length).toEqual(0);
      });
    }));

    it('should display right error message', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.query(By.css('.message'));
        expect(de.nativeElement.textContent.trim()).toEqual('Not installed requirement/s: Docker SQLite3 Git');
      });
    }));

    it('should display Docker is not installed', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.software-item-column'))[0];
        const name = de.query(By.css('.column.is-7 .brand-name'));
        const version = de.query(By.css('.column.is-4 span'));
        const circle = de.query(By.css('.status-circle'));

        expect(name.nativeElement.textContent).toEqual('Docker');
        expect(version.nativeElement.textContent).toEqual('');
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-active': false }));
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-error': true }));
        expect(circle.query(By.css('.fa-check'))).toBeFalsy();
        expect(circle.query(By.css('.fa-times'))).toBeTruthy();
      });
    }));

    it('should display SQLite is not installed', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.software-item-column'))[1];
        const name = de.query(By.css('.column.is-7 .brand-name'));
        const version = de.query(By.css('.column.is-4 span'));
        const circle = de.query(By.css('.status-circle'));

        expect(name.nativeElement.textContent).toEqual('SQLite3');
        expect(version.nativeElement.textContent).toEqual('');
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-active': false }));
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-error': true }));
        expect(circle.query(By.css('.fa-check'))).toBeFalsy();
        expect(circle.query(By.css('.fa-times'))).toBeTruthy();
      });
    }));

    it('should display git is not installed', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.queryAll(By.css('.software-item-column'))[2];
        const name = de.query(By.css('.column.is-7 .brand-name'));
        const version = de.query(By.css('.column.is-4 span'));
        const circle = de.query(By.css('.status-circle'));

        expect(name.nativeElement.textContent).toEqual('git');
        expect(version.nativeElement.textContent).toEqual('');
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-active': false }));
        expect(circle.query(By.css('.inner-circle')).classes).toEqual(jasmine.objectContaining({ 'is-error': true }));
        expect(circle.query(By.css('.fa-check'))).toBeFalsy();
        expect(circle.query(By.css('.fa-times'))).toBeTruthy();
      });
    }));

    it('should have next button disabled', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const de = fixture.debugElement.query(By.css('.setup-content-bottom .button.is-large.is-green'));

        expect(de.nativeElement.textContent).toEqual('Next');
        expect(de.nativeElement.disabled).toBe(true);
      });
    }));
  });

});
