import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppBuildItemComponent } from './app-build-item.component';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { TimeService } from '../../services/time.service';
import { ToTimePipe } from '../../pipes/to-time.pipe';
import * as buildData from '../../../testing/xhr-data/build.json';
import * as buildTagData from '../../../testing/xhr-data/build-tag.json';

describe('Build Item Component', () => {
  let fixture: ComponentFixture<AppBuildItemComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpModule, HttpClientModule],
      declarations: [AppBuildItemComponent, ToTimePipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [ApiService, SocketService, TimeService]
    })
      .createComponent(AppBuildItemComponent);
  });

  it('should expect buildCreated to be empty string', () => {
    expect(fixture.componentInstance.buildCreated).toBe('');
  });

  it('should expect build to be izak88/d3-bundle', () => {
    fixture.componentInstance.build = (<any>buildData).data;
    fixture.detectChanges();
    expect(fixture.componentInstance.build.repository.full_name).toBe('jkuri/d3-bundle');
  });

  it('should expect commit message to be test', () => {
    fixture.componentInstance.build = (<any>buildData).data;
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.css('[name="commit-message"]'));
    expect(de.nativeElement.textContent).toContain('chore(abstruse.yml): make proper config');
  });

  it('should expect build to be izak88/d3-bundle', () => {
    fixture.componentInstance.build = (<any>buildTagData).data;
    fixture.detectChanges();
    expect(fixture.componentInstance.build.repository.full_name).toBe('Izak88/d3-bundle');
  });

  it('should see all the correct informations', () => {
    fixture.componentInstance.build = (<any>buildTagData).data;
    fixture.detectChanges();
    expect(fixture.componentInstance.dateTime).not.toBeNull();
    let de = fixture.debugElement.query(By.css('[name="author"]'));
    expect(de.nativeElement.textContent).toContain('Izak Lipnik');
    de = fixture.debugElement.query(By.css('[name="commit-message"]'));
    expect(de.nativeElement.textContent).toContain('add jenkins file');
    de = fixture.debugElement.query(By.css('[name="sha"]'));
    expect(de.nativeElement.textContent).toContain('1f3e9ce');
  });
});
