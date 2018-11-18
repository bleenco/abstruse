import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageBaseItemComponent } from './image-base-item.component';
import { HumanizeBytesPipe } from 'src/app/shared/pipes/humanize-bytes.pipe';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ImageBaseItemComponent', () => {
  let component: ImageBaseItemComponent;
  let fixture: ComponentFixture<ImageBaseItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [
        ImageBaseItemComponent,
        HumanizeBytesPipe
      ]
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
