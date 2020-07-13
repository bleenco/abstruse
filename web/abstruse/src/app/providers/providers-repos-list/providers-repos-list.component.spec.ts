import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvidersReposListComponent } from './providers-repos-list.component';

describe('ProvidersReposListComponent', () => {
  let component: ProvidersReposListComponent;
  let fixture: ComponentFixture<ProvidersReposListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProvidersReposListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvidersReposListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
