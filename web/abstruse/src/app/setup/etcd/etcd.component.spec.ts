import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EtcdComponent } from './etcd.component';

describe('EtcdComponent', () => {
  let component: EtcdComponent;
  let fixture: ComponentFixture<EtcdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EtcdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EtcdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
