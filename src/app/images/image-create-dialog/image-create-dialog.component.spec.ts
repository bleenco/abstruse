import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCreateDialogComponent } from './image-create-dialog.component';

describe('ImageCreateDialogComponent', () => {
  let component: ImageCreateDialogComponent;
  let fixture: ComponentFixture<ImageCreateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageCreateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
