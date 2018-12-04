import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutVersionComponent } from './about-version.component';

describe('AboutVersionComponent', () => {
  let component: AboutVersionComponent;
  let fixture: ComponentFixture<AboutVersionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AboutVersionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
