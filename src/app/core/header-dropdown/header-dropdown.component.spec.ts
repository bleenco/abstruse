import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderDropdownComponent } from './header-dropdown.component';

describe('HeaderDropdownComponent', () => {
  let component: HeaderDropdownComponent;
  let fixture: ComponentFixture<HeaderDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
