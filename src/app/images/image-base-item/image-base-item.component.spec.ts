import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageBaseItemComponent } from './image-base-item.component';

describe('ImageBaseItemComponent', () => {
  let component: ImageBaseItemComponent;
  let fixture: ComponentFixture<ImageBaseItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageBaseItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageBaseItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
