import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardIndexComponent } from './dashboard-index.component';
import { NgDatepickerModule } from 'ng2-datepicker';
import { FrappeChartComponent } from '../charts/frappe-chart/frappe-chart.component';
import { ProgressChartComponent } from '../charts/progress-chart/progress-chart.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SocketService } from 'src/app/shared/providers/socket.service';

describe('DashboardIndexComponent', () => {
  let component: DashboardIndexComponent;
  let fixture: ComponentFixture<DashboardIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgDatepickerModule,
        HttpClientTestingModule
      ],
      declarations: [
        DashboardIndexComponent,
        FrappeChartComponent,
        ProgressChartComponent
      ],
      providers: [
        SocketService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
