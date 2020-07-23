import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GatewayTimeoutComponent } from './gateway-timeout.component';

describe('GatewayTimeoutComponent', () => {
  let component: GatewayTimeoutComponent;
  let fixture: ComponentFixture<GatewayTimeoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayTimeoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayTimeoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
