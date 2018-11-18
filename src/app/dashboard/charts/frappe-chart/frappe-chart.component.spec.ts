import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FrappeChartComponent } from './frappe-chart.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FrappeChartComponent', () => {
  let component: FrappeChartComponent;
  let fixture: ComponentFixture<FrappeChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [
        FrappeChartComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrappeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
