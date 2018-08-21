import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { BuildJobDetailsComponent } from './build-job-details.component';
import { BuildJobRunItemComponent } from '../build-job-run-item/build-job-run-item.component';
import { TerminalComponent } from '../../shared/widgets/terminal/terminal.component';
import { LoaderComponent } from '../../core/loader/loader.component';
import { ToTimePipe } from '../../shared/pipes/to-time.pipe';

import { SocketService } from '../../shared/providers/socket.service';

describe('BuildJobDetailsComponent', () => {
  let component: BuildJobDetailsComponent;
  let fixture: ComponentFixture<BuildJobDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [
        BuildJobDetailsComponent,
        BuildJobRunItemComponent,
        TerminalComponent,
        LoaderComponent,
        ToTimePipe
      ],
      providers: [SocketService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildJobDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
