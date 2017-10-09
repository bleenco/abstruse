import { DebugElement, NO_ERRORS_SCHEMA, EventEmitter }          from '@angular/core';
import { inject, async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { HttpModule, Http, XHRBackend, Response, ResponseOptions } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { AppBuildItemComponent } from './app-build-item.component';
import { AppHeaderComponent } from '../app-header/app-header.component';
import { AppToggleComponent } from '../app-toggle/app-toggle.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { ConfigService } from '../../services/config.service';
import { TimeService } from '../../services/time.service';
import { NotificationService } from '../../services/notification.service';
import { Observable } from 'rxjs/Observable';
import { ToTimePipe } from '../../pipes/to-time.pipe';
const buildsData: any = require('json-loader!../../testing/xhr-data/builds.json');

describe('Build Item Component', () => {
  let comp:    AppBuildItemComponent;
  let fixture: ComponentFixture<AppBuildItemComponent>;

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake(() => {
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZ21haWwuY29tIiwiaWQiOjE'
        + 'sImZ1bGxuYW1lIjoiSm9obiBXYXluZSIsInBhc3N3b3JkIjoiY2MwM2U3NDdhNmFmYmJjYmY4YmU3NjY4YW'
        + 'NmZWJlZTUiLCJhZG1pbiI6MSwiYXZhdGFyIjoiL2F2YXRhcnMvdXNlci5zdmciLCJjcmVhdGVkX2F0IjoxN'
        + 'TA3Mjg2NDUzOTYwLCJ1cGRhdGVkX2F0IjoxNTA3Mjg2NDUzOTYwLCJpYXQiOjE1MDczMDY1NzF9.tKDsUid'
        + 'LjHKVjb9IT612yf6yMM1DtT5H9fmn5wIBdhE';
    });

    fixture = TestBed.configureTestingModule({
      imports: [ FormsModule, RouterTestingModule, HttpModule ],
      declarations: [ AppBuildItemComponent, AppHeaderComponent, AppToggleComponent, ToTimePipe ],
      schemas:      [ NO_ERRORS_SCHEMA ],
      providers: [
        ApiService,
        AuthService,
        SocketService,
        ConfigService,
        TimeService,
        NotificationService,
        { provide: XHRBackend, useClass: MockBackend },
        { provide: ActivatedRoute, useValue: { params: Observable.of({id: 1}), snapshot: { params: { id: 1 } } } } ]
    })
    .createComponent(AppBuildItemComponent);
    comp = fixture.componentInstance;
    fixture.componentInstance.build = buildsData.data[0];
  });

  it('should expect buildCreated to be empty string', () => {
    expect(fixture.componentInstance.buildCreated).toBe('');
  });

  it('should expect build to be izak88/d3-bundle', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance.build.repository.full_name).toBe('Izak88/d3-bundle');
  });

  it('should expect commit message to be test', () => {
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.css('[name="commit-message"]'));
    expect(de.nativeElement.textContent).toContain('test');
  });
});
