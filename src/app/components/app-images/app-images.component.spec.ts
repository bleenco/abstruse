import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { AppImagesComponent } from './app-images.component';

describe('Images Component', () => {
  let fixture: ComponentFixture<AppImagesComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule, HttpModule],
      declarations: [AppImagesComponent, SafeHtmlPipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ApiService,
        AuthService,
        SocketService,
        ConfigService,
        NotificationService]
    })
      .createComponent(AppImagesComponent);
  });

  it('should see h1 contains text Docker Build Images', () => {
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.css('h1'));
    expect(de.nativeElement.textContent).toContain('Docker Build Images');
  });
});
