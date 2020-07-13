import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvidersReposListItemComponent } from './providers-repos-list-item.component';

describe('ProvidersReposListItemComponent', () => {
  let component: ProvidersReposListItemComponent;
  let fixture: ComponentFixture<ProvidersReposListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProvidersReposListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvidersReposListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
