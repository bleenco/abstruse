import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderItemComponent } from './provider-item.component';

describe('ProviderItemComponent', () => {
  let component: ProviderItemComponent;
  let fixture: ComponentFixture<ProviderItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
