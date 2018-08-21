import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { BuildsLatestComponent } from './builds-latest.component';
import { BuildItemComponent } from '../build-item/build-item.component';
import { LoaderComponent } from '../../core/loader/loader.component';
import { ToTimePipe } from '../../shared/pipes/to-time.pipe';

import { SocketService } from '../../shared/providers/socket.service';

describe('BuildsLatestComponent', () => {
  let component: BuildsLatestComponent;
  let fixture: ComponentFixture<BuildsLatestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [
        BuildsLatestComponent,
        LoaderComponent,
        BuildItemComponent,
        ToTimePipe
      ],
      providers: [SocketService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildsLatestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
