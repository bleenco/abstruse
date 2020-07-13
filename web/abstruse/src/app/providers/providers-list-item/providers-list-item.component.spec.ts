import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvidersListItemComponent } from './providers-list-item.component';

describe('ProvidersListItemComponent', () => {
  let component: ProvidersListItemComponent;
  let fixture: ComponentFixture<ProvidersListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProvidersListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvidersListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
