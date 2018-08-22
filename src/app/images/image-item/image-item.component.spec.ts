import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageItemComponent } from './image-item.component';

describe('ImageItemComponent', () => {
  let component: ImageItemComponent;
  let fixture: ComponentFixture<ImageItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
