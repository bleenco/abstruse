import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { BuildItemComponent } from './build-item.component';
import { ToTimePipe } from '../../shared/pipes/to-time.pipe';

import { SocketService } from '../../shared/providers/socket.service';

describe('BuildItemComponent', () => {
  let component: BuildItemComponent;
  let fixture: ComponentFixture<BuildItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [BuildItemComponent, ToTimePipe],
      providers: [SocketService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
