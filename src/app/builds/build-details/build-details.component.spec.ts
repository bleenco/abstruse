import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { BuildDetailsComponent } from './build-details.component';
import { BuildJobItemComponent } from '../build-job-item/build-job-item.component';
import { LoaderComponent } from '../../core/loader/loader.component';
import { ToTimePipe } from '../../shared/pipes/to-time.pipe';

import { SocketService } from '../../shared/providers/socket.service';

describe('BuildDetailsComponent', () => {
  let component: BuildDetailsComponent;
  let fixture: ComponentFixture<BuildDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [
        BuildDetailsComponent,
        LoaderComponent,
        ToTimePipe,
        BuildJobItemComponent
      ],
      providers: [SocketService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
