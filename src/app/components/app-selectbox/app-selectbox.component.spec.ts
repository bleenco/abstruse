import { DebugElement, NO_ERRORS_SCHEMA }          from '@angular/core';
import { ComponentFixture, TestBed, inject, async } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { HttpModule, Http, XHRBackend, Response, ResponseOptions } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { AppSelectboxComponent } from './app-selectbox.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { WindowService } from '../../services/window.service';
import { StatsService } from '../../services/stats.service';

describe('SelectBox Component', () => {
  let fixture: ComponentFixture<AppSelectboxComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [ FormsModule, RouterTestingModule, HttpModule ],
      declarations: [ AppSelectboxComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        ApiService,
        AuthService,
        SocketService,
        ConfigService,
        NotificationService,
        WindowService,
        StatsService,
        { provide: XHRBackend, useClass: MockBackend } ]
    })
    .createComponent(AppSelectboxComponent);
  });

  it('should expect el to be undefined', () => {
    expect(fixture.componentInstance.data).toBeUndefined();
  });

  it('should expect index to be 0', () => {
    fixture.componentInstance.data = [ { key: 'a', value: '1234' }, { key: 'b', value: '4321' } ];
    fixture.componentInstance.writeValue('a');
    expect(fixture.componentInstance.index).toBe(0);
  });
});
