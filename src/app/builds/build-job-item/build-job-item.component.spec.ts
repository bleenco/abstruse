import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { BuildJobItemComponent } from './build-job-item.component';
import { ToTimePipe } from '../../shared/pipes/to-time.pipe';

import { SocketService } from '../../shared/providers/socket.service';

describe('BuildJobItemComponent', () => {
  let component: BuildJobItemComponent;
  let fixture: ComponentFixture<BuildJobItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [BuildJobItemComponent, ToTimePipe],
      providers: [SocketService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildJobItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
