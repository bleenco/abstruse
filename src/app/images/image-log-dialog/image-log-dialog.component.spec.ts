import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageLogDialogComponent } from './image-log-dialog.component';

describe('ImageDetailsDialogComponent', () => {
  let component: ImageLogDialogComponent;
  let fixture: ComponentFixture<ImageLogDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImageLogDialogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageLogDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
