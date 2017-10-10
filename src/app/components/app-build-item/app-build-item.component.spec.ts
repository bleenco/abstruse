import { DebugElement, NO_ERRORS_SCHEMA }          from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';

import { AppBuildItemComponent } from './app-build-item.component';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { TimeService } from '../../services/time.service';
import { ToTimePipe } from '../../pipes/to-time.pipe';
const buildsData: any = require('json-loader!../../testing/xhr-data/builds.json');

describe('Build Item Component', () => {
  let fixture: ComponentFixture<AppBuildItemComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpModule ],
      declarations: [ AppBuildItemComponent, ToTimePipe ],
      schemas:      [ NO_ERRORS_SCHEMA ],
      providers: [ ApiService, SocketService, TimeService ]
    })
    .createComponent(AppBuildItemComponent);
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
