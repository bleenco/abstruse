import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvidersModalComponent } from './providers-modal.component';

describe('ProvidersModalComponent', () => {
  let component: ProvidersModalComponent;
  let fixture: ComponentFixture<ProvidersModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProvidersModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvidersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
